/** Guest booking flow: create, hold, pay, confirm. */
import { v, ConvexError } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { bookingRequestSchema } from "../src/lib/domain/validation";
import { makeReference, randomCode } from "../src/lib/domain/validation";
import { computeQuote, PricingError } from "../src/lib/domain/pricing";
import { checkSlot } from "../src/lib/domain/availability";
import { addMinutesToTime, toEpoch } from "../src/lib/domain/time";
import { CURRENCY } from "../src/lib/domain/money";
import { getSettings } from "./lib/settings";
import { buildAvailabilityInput, occupiesSlot } from "./lib/occupancy";
import { rateLimit } from "./lib/rateLimit";
import { recomputeBookingMoney } from "./lib/money";
import { getPaymentProvider } from "./payments/paystack";

export const HOLD_MINUTES = 15;

const requestArgs = {
  serviceId: v.string(),
  date: v.string(),
  startTime: v.string(),
  guests: v.number(),
  address: v.string(),
  occasion: v.optional(v.string()),
  dietaryNotes: v.optional(v.string()),
  notes: v.optional(v.string()),
  name: v.string(),
  phone: v.string(),
  email: v.string(),
  paymentChoice: v.union(v.literal("deposit"), v.literal("full"), v.literal("later")),
};

function siteUrl(): string {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/**
 * The double-booking guard. Convex mutations are serialisable transactions:
 * the availability read and the insert commit together or not at all, so two
 * guests can never take the same slot.
 */
export const createBooking = internalMutation({
  args: requestArgs,
  handler: async (ctx, raw) => {
    const parsed = bookingRequestSchema.safeParse(raw);
    if (!parsed.success) {
      throw new ConvexError(parsed.error.issues[0]?.message ?? "Please check your details.");
    }
    const req = parsed.data;

    await rateLimit(ctx, `book:${req.email}`, 5, 60 * 60_000);
    await rateLimit(ctx, "book:all", 120, 60 * 60_000);

    const serviceId = ctx.db.normalizeId("services", req.serviceId);
    const service = serviceId ? await ctx.db.get(serviceId) : null;
    if (!service || service.archived) throw new ConvexError("That service isn't available any more.");

    const settings = await getSettings(ctx);
    let quote;
    try {
      quote = computeQuote(service, req.guests, settings.depositPercent);
    } catch (e) {
      if (e instanceof PricingError) throw new ConvexError(e.message);
      throw e;
    }

    const input = await buildAvailabilityInput(ctx, {
      durationMinutes: service.durationMinutes,
      fromDate: req.date,
      toDate: req.date,
    });
    const slot = checkSlot(req.date, req.startTime, input);
    if (!slot.ok) throw new ConvexError(slot.reason);

    // Upsert the customer by email.
    const now = Date.now();
    let customer = await ctx.db
      .query("customers")
      .withIndex("by_email", (q) => q.eq("email", req.email))
      .first();
    if (customer) {
      await ctx.db.patch(customer._id, { name: req.name, phone: req.phone });
    } else {
      const id = await ctx.db.insert("customers", {
        name: req.name,
        email: req.email,
        phone: req.phone,
        createdAt: now,
      });
      customer = (await ctx.db.get(id))!;
    }

    // Unique reference.
    let reference = makeReference();
    while (
      await ctx.db
        .query("bookings")
        .withIndex("by_reference", (q) => q.eq("reference", reference))
        .first()
    ) {
      reference = makeReference();
    }

    const online = req.paymentChoice !== "later";
    const bookingId = await ctx.db.insert("bookings", {
      reference,
      accessToken: randomCode(24),
      serviceId: service._id,
      serviceName: service.name,
      customerId: customer._id,
      date: req.date,
      startTime: req.startTime,
      endTime: addMinutesToTime(req.startTime, service.durationMinutes),
      startAt: toEpoch(req.date, req.startTime),
      guests: req.guests,
      address: req.address,
      occasion: req.occasion || undefined,
      dietaryNotes: req.dietaryNotes || undefined,
      notes: req.notes || undefined,
      status: "pending",
      lineItems: quote.lineItems,
      total: quote.total,
      depositDue: quote.depositDue,
      amountPaid: 0,
      amountRefunded: 0,
      paymentStatus: "unpaid",
      paymentChoice: req.paymentChoice,
      holdExpiresAt: online ? now + HOLD_MINUTES * 60_000 : undefined,
      createdAt: now,
      updatedAt: now,
    });

    if (online) {
      await ctx.scheduler.runAfter(HOLD_MINUTES * 60_000 + 30_000, internal.bookings.expireHold, {
        bookingId,
      });
    } else {
      await ctx.scheduler.runAfter(0, internal.emails.send, { template: "request_received", bookingId });
      if (settings.notifyOnNewBooking) {
        await ctx.scheduler.runAfter(0, internal.emails.send, { template: "owner_new_booking", bookingId });
      }
    }

    const booking = (await ctx.db.get(bookingId))!;
    return {
      bookingId,
      reference,
      accessToken: booking.accessToken,
      email: req.email,
      chargeAmount: req.paymentChoice === "full" ? quote.total : quote.depositDue,
    };
  },
});

export const recordInitiatedPayment = internalMutation({
  args: { bookingId: v.id("bookings"), providerRef: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    await ctx.db.insert("payments", {
      bookingId: args.bookingId,
      kind: "charge",
      amount: args.amount,
      currency: CURRENCY,
      method: "card",
      provider: "paystack",
      providerRef: args.providerRef,
      status: "initiated",
      createdAt: Date.now(),
    });
  },
});

/** Called if Paystack refused to start a checkout, so the slot frees up at once. */
export const releaseHold = internalMutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }) => {
    const b = await ctx.db.get(bookingId);
    if (b && b.status === "pending" && b.amountPaid === 0) {
      await ctx.db.patch(bookingId, {
        status: "cancelled",
        cancellationReason: "Payment could not be started",
        holdExpiresAt: undefined,
        updatedAt: Date.now(),
      });
    }
  },
});

/** Runs 15 minutes after an online booking is created. Unpaid → slot released. */
export const expireHold = internalMutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }) => {
    const b = await ctx.db.get(bookingId);
    if (!b || b.status !== "pending" || b.holdExpiresAt === undefined) return;
    if (b.amountPaid > 0) return;
    if (b.holdExpiresAt > Date.now()) return;
    await ctx.db.patch(bookingId, {
      status: "cancelled",
      cancellationReason: "Payment not completed within 15 minutes",
      updatedAt: Date.now(),
    });
  },
});

/** Hourly safety net in case a scheduled expiry was missed. */
export const sweepExpiredHolds = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const pending = await ctx.db
      .query("bookings")
      .withIndex("by_status_startAt", (q) => q.eq("status", "pending"))
      .collect();
    for (const b of pending) {
      if (b.holdExpiresAt !== undefined && b.holdExpiresAt < now && b.amountPaid === 0) {
        await ctx.db.patch(b._id, {
          status: "cancelled",
          cancellationReason: "Payment not completed within 15 minutes",
          updatedAt: now,
        });
      }
    }
  },
});

/**
 * Apply a verified, successful provider charge. Idempotent: replays of the same
 * webhook or a webhook + redirect verification never double-count money.
 */
export const applyVerifiedCharge = internalMutation({
  args: {
    providerRef: v.string(),
    amount: v.number(),
    currency: v.string(),
    channel: v.string(),
    paidAt: v.union(v.number(), v.null()),
    eventKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.eventKey) {
      const seen = await ctx.db
        .query("webhookEvents")
        .withIndex("by_key", (q) => q.eq("provider", "paystack").eq("eventKey", args.eventKey!))
        .first();
      if (seen) return { applied: false, reason: "duplicate event" };
      await ctx.db.insert("webhookEvents", {
        provider: "paystack",
        eventKey: args.eventKey,
        receivedAt: Date.now(),
      });
    }

    const payment = await ctx.db
      .query("payments")
      .withIndex("by_providerRef", (q) => q.eq("providerRef", args.providerRef))
      .first();
    if (!payment) return { applied: false, reason: "unknown reference" };
    if (payment.status === "succeeded") return { applied: false, reason: "already applied" };
    if (args.currency !== CURRENCY) return { applied: false, reason: "currency mismatch" };

    const booking = await ctx.db.get(payment.bookingId);
    if (!booking) return { applied: false, reason: "booking missing" };

    await ctx.db.patch(payment._id, {
      status: "succeeded",
      amount: args.amount, // trust the provider's verified amount
      method: args.channel === "mobile_money" ? "mobile_money" : "card",
      paidAt: args.paidAt ?? Date.now(),
    });
    const { paymentStatus } = await recomputeBookingMoney(ctx, booking._id);
    const settings = await getSettings(ctx);
    const now = Date.now();

    if (booking.status === "pending") {
      await ctx.db.patch(booking._id, {
        holdExpiresAt: undefined,
        status: settings.autoConfirmPaid && paymentStatus !== "unpaid" ? "confirmed" : "pending",
        updatedAt: now,
      });
    } else if (booking.status === "cancelled" && booking.cancellationReason?.startsWith("Payment not")) {
      // Paid after the hold expired: revive it if the slot is still free.
      const input = await buildAvailabilityInput(ctx, {
        durationMinutes: 0,
        fromDate: booking.date,
        toDate: booking.date,
        excludeBookingId: booking._id,
      });
      const clash = input.bookings.some(
        (b) => b.startTime < booking.endTime && booking.startTime < b.endTime,
      );
      const dayFull = input.bookings.length >= input.settings.maxBookingsPerDay;
      if (!clash && !dayFull) {
        await ctx.db.patch(booking._id, {
          status: settings.autoConfirmPaid ? "confirmed" : "pending",
          cancellationReason: undefined,
          holdExpiresAt: undefined,
          updatedAt: now,
        });
      } else {
        await ctx.db.patch(booking._id, {
          needsAttention:
            "Payment arrived after the 15-minute hold expired and the slot was taken. Refund the client or arrange a new date.",
          updatedAt: now,
        });
      }
    }

    await ctx.scheduler.runAfter(0, internal.emails.send, {
      template: "payment_received",
      bookingId: booking._id,
    });
    if (settings.notifyOnNewBooking && booking.amountPaid === 0) {
      await ctx.scheduler.runAfter(0, internal.emails.send, {
        template: "owner_new_booking",
        bookingId: booking._id,
      });
    }
    return { applied: true, reason: "ok" };
  },
});

export const latestInitiatedRef = internalQuery({
  args: { reference: v.string(), token: v.string() },
  handler: async (ctx, { reference, token }) => {
    const b = await ctx.db
      .query("bookings")
      .withIndex("by_reference", (q) => q.eq("reference", reference))
      .first();
    if (!b || b.accessToken !== token) return null;
    const rows = await ctx.db
      .query("payments")
      .withIndex("by_booking", (q) => q.eq("bookingId", b._id))
      .collect();
    return rows
      .filter((r) => r.provider === "paystack" && r.status === "initiated" && r.providerRef)
      .map((r) => r.providerRef!);
  },
});

export const isSlotHeldForBooking = internalQuery({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, { bookingId }) => {
    const b = await ctx.db.get(bookingId);
    return b ? occupiesSlot(b, Date.now()) : false;
  },
});

/** Public entry point used by the booking form. */
export const start = action({
  args: requestArgs,
  handler: async (
    ctx,
    args,
  ): Promise<{ kind: "redirect" | "confirmation"; url: string; reference: string }> => {
    const created: {
      bookingId: Id<"bookings">;
      reference: string;
      accessToken: string;
      email: string;
      chargeAmount: number;
    } = await ctx.runMutation(internal.bookings.createBooking, args);

    const confirmationUrl = `${siteUrl()}/book/confirmation/${created.reference}?t=${created.accessToken}`;
    if (args.paymentChoice === "later") {
      return { kind: "confirmation", url: confirmationUrl, reference: created.reference };
    }

    const providerRef = `${created.reference}-${Date.now().toString(36).toUpperCase()}`;
    try {
      await ctx.runMutation(internal.bookings.recordInitiatedPayment, {
        bookingId: created.bookingId,
        providerRef,
        amount: created.chargeAmount,
      });
      const { redirectUrl } = await getPaymentProvider().initialize({
        email: created.email,
        amount: created.chargeAmount,
        currency: CURRENCY,
        reference: providerRef,
        callbackUrl: confirmationUrl,
        metadata: { booking_reference: created.reference, payment: args.paymentChoice },
      });
      return { kind: "redirect", url: redirectUrl, reference: created.reference };
    } catch (e) {
      await ctx.runMutation(internal.bookings.releaseHold, { bookingId: created.bookingId });
      throw new ConvexError(
        e instanceof Error ? e.message : "We couldn't start the payment. Please try again.",
      );
    }
  },
});

/**
 * Called by the confirmation page after Paystack redirects back. It never
 * trusts the redirect: it asks Paystack directly whether the charge succeeded.
 */
export const confirmPayment = action({
  args: { reference: v.string(), token: v.string() },
  handler: async (ctx, { reference, token }): Promise<{ paid: boolean }> => {
    const refs: string[] | null = await ctx.runQuery(internal.bookings.latestInitiatedRef, {
      reference,
      token,
    });
    if (!refs || refs.length === 0) return { paid: false };
    let paid = false;
    for (const ref of refs) {
      try {
        const charge = await getPaymentProvider().verify(ref);
        if (charge.status === "success") {
          await ctx.runMutation(internal.bookings.applyVerifiedCharge, {
            providerRef: ref,
            amount: charge.amount,
            currency: charge.currency,
            channel: charge.channel,
            paidAt: charge.paidAt,
          });
          paid = true;
        }
      } catch {
        // Webhook will still deliver; the page keeps listening in realtime.
      }
    }
    return { paid };
  },
});
