/** Owner-only booking + payment management. Every function calls requireOwner. */
import { v, ConvexError } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { requireOwner } from "./lib/auth";
import { occupiesSlot, buildAvailabilityInput } from "./lib/occupancy";
import { recomputeBookingMoney } from "./lib/money";
import { getSettings } from "./lib/settings";
import { paymentMethod } from "./schema";
import { assertTransition, type BookingStatus } from "../src/lib/domain/status";
import { checkSlot } from "../src/lib/domain/availability";
import { addMinutesToTime, toEpoch, todayInAccra } from "../src/lib/domain/time";
import { CURRENCY } from "../src/lib/domain/money";
import { getPaymentProvider } from "./payments/paystack";

function isAwaitingPayment(b: Doc<"bookings">) {
  return b.status === "pending" && b.holdExpiresAt !== undefined && b.amountPaid === 0;
}

async function withCustomer(ctx: QueryCtx, b: Doc<"bookings">) {
  const c = await ctx.db.get(b.customerId);
  return {
    ...b,
    customerName: c?.name ?? "Unknown",
    customerPhone: c?.phone ?? "",
    customerEmail: c?.email ?? "",
    balance: Math.max(0, b.total - b.amountPaid + b.amountRefunded),
    awaitingPayment: isAwaitingPayment(b),
    accessToken: undefined,
  };
}

export const me = query({
  args: {},
  handler: async (ctx) => {
    try {
      return { ok: true as const, email: await requireOwner(ctx) };
    } catch (e) {
      return { ok: false as const, error: e instanceof Error ? e.message : "Not allowed" };
    }
  },
});

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    const now = Date.now();
    const today = todayInAccra();
    const monthPrefix = today.slice(0, 7);
    const all = await ctx.db.query("bookings").withIndex("by_startAt").order("desc").take(1000);
    const live = all.filter((b) => !(b.status === "cancelled" && b.cancellationReason?.startsWith("Payment not")));

    const upcoming = live
      .filter((b) => b.date >= today && (b.status === "confirmed" || b.status === "pending") && occupiesSlot(b, now))
      .sort((a, b) => a.startAt - b.startAt);
    const weekEnd = toEpoch(today, "00:00") + 7 * 86400_000;

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_status_paidAt", (q) => q.eq("status", "succeeded"))
      .collect();
    const monthStart = toEpoch(`${monthPrefix}-01`, "00:00");
    const revenueThisMonth = payments
      .filter((p) => (p.paidAt ?? 0) >= monthStart)
      .reduce((s, p) => s + (p.kind === "charge" ? p.amount : -p.amount), 0);

    const outstanding = live
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((s, b) => s + Math.max(0, b.total - b.amountPaid + b.amountRefunded), 0);

    const pendingRequests = live.filter((b) => b.status === "pending" && !isAwaitingPayment(b));
    const attention = live.filter((b) => b.needsAttention);

    return {
      today: await Promise.all(upcoming.filter((b) => b.date === today).map((b) => withCustomer(ctx, b))),
      thisWeek: await Promise.all(upcoming.filter((b) => b.startAt < weekEnd).slice(0, 10).map((b) => withCustomer(ctx, b))),
      upcoming: await Promise.all(upcoming.slice(0, 8).map((b) => withCustomer(ctx, b))),
      pendingRequests: await Promise.all(pendingRequests.map((b) => withCustomer(ctx, b))),
      attention: await Promise.all(attention.map((b) => withCustomer(ctx, b))),
      stats: {
        revenueThisMonth,
        outstanding,
        upcomingCount: upcoming.length,
        pendingCount: pendingRequests.length,
      },
    };
  },
});

export const bookingsInRange = query({
  args: { from: v.string(), to: v.string() },
  handler: async (ctx, { from, to }) => {
    await requireOwner(ctx);
    const now = Date.now();
    const [rows, blocked] = await Promise.all([
      ctx.db
        .query("bookings")
        .withIndex("by_date", (q) => q.gte("date", from).lte("date", to))
        .collect(),
      ctx.db
        .query("blockedDates")
        .withIndex("by_date", (q) => q.gte("date", from).lte("date", to))
        .collect(),
    ]);
    const visible = rows.filter(
      (b) => occupiesSlot(b, now) || b.status === "completed" || (b.status === "cancelled" && !b.cancellationReason?.startsWith("Payment not")) || b.status === "declined",
    );
    return {
      bookings: await Promise.all(visible.sort((a, b) => a.startAt - b.startAt).map((b) => withCustomer(ctx, b))),
      blockedDates: blocked.map((b) => ({ date: b.date, reason: b.reason })),
    };
  },
});

export const listBookings = query({
  args: { includeAbandoned: v.optional(v.boolean()) },
  handler: async (ctx, { includeAbandoned }) => {
    await requireOwner(ctx);
    const rows = await ctx.db.query("bookings").withIndex("by_startAt").order("desc").take(1000);
    const filtered = includeAbandoned
      ? rows
      : rows.filter((b) => !(b.status === "cancelled" && b.cancellationReason?.startsWith("Payment not")));
    return Promise.all(filtered.map((b) => withCustomer(ctx, b)));
  },
});

export const bookingDetail = query({
  args: { id: v.id("bookings") },
  handler: async (ctx, { id }) => {
    await requireOwner(ctx);
    const b = await ctx.db.get(id);
    if (!b) return null;
    const [base, payments, service, settings] = await Promise.all([
      withCustomer(ctx, b),
      ctx.db.query("payments").withIndex("by_booking", (q) => q.eq("bookingId", id)).collect(),
      ctx.db.get(b.serviceId),
      getSettings(ctx),
    ]);
    return {
      ...base,
      payments: payments
        .filter((p) => p.status !== "initiated" || Date.now() - p.createdAt < 60 * 60_000)
        .sort((a, b) => (b.paidAt ?? b.createdAt) - (a.paidAt ?? a.createdAt)),
      serviceDurationMinutes: service?.durationMinutes ?? 0,
      business: {
        name: settings.businessName,
        phone: settings.phone,
        email: settings.email,
        serviceArea: settings.serviceArea,
        cancellationPolicy: settings.cancellationPolicy,
      },
    };
  },
});

const statusEmail: Partial<Record<BookingStatus, "status_confirmed" | "status_declined" | "status_cancelled" | "status_completed">> = {
  confirmed: "status_confirmed",
  declined: "status_declined",
  cancelled: "status_cancelled",
  completed: "status_completed",
};

export const setStatus = mutation({
  args: {
    id: v.id("bookings"),
    status: v.union(v.literal("confirmed"), v.literal("declined"), v.literal("cancelled"), v.literal("completed")),
    reason: v.optional(v.string()),
    notifyClient: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, status, reason, notifyClient }) => {
    await requireOwner(ctx);
    const b = await ctx.db.get(id);
    if (!b) throw new ConvexError("Booking not found");
    try {
      assertTransition(b.status, status);
    } catch (e) {
      throw new ConvexError((e as Error).message);
    }
    if (status === "confirmed" && b.holdExpiresAt !== undefined && b.holdExpiresAt < Date.now() && b.amountPaid === 0) {
      // Re-check the slot if confirming an expired online hold.
      const service = await ctx.db.get(b.serviceId);
      const input = await buildAvailabilityInput(ctx, {
        durationMinutes: service?.durationMinutes ?? 0,
        fromDate: b.date,
        toDate: b.date,
        excludeBookingId: b._id,
      });
      const clash = input.bookings.some((x) => x.startTime < b.endTime && b.startTime < x.endTime);
      if (clash) throw new ConvexError("Another booking now overlaps this time. Reschedule it first.");
    }
    await ctx.db.patch(id, {
      status,
      holdExpiresAt: undefined,
      cancellationReason: status === "cancelled" || status === "declined" ? reason || undefined : b.cancellationReason,
      updatedAt: Date.now(),
    });
    const template = statusEmail[status];
    if (template && notifyClient !== false) {
      await ctx.scheduler.runAfter(0, internal.emails.send, { template, bookingId: id });
    }
  },
});

export const reschedule = mutation({
  args: { id: v.id("bookings"), date: v.string(), startTime: v.string(), override: v.optional(v.boolean()) },
  handler: async (ctx, { id, date, startTime, override }) => {
    await requireOwner(ctx);
    const b = await ctx.db.get(id);
    if (!b) throw new ConvexError("Booking not found");
    if (b.status !== "pending" && b.status !== "confirmed") {
      throw new ConvexError("Only pending or confirmed bookings can be rescheduled.");
    }
    const service = await ctx.db.get(b.serviceId);
    const duration = service?.durationMinutes ?? 240;
    if (!override) {
      const input = await buildAvailabilityInput(ctx, {
        durationMinutes: duration,
        fromDate: date,
        toDate: date,
        excludeBookingId: id,
      });
      // Sonia can book inside her own lead time.
      input.settings.leadTimeHours = 0;
      const check = checkSlot(date, startTime, input);
      if (!check.ok) throw new ConvexError(check.reason);
    }
    await ctx.db.patch(id, {
      date,
      startTime,
      endTime: addMinutesToTime(startTime, duration),
      startAt: toEpoch(date, startTime),
      updatedAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.emails.send, { template: "rescheduled", bookingId: id });
  },
});

export const updateNotes = mutation({
  args: { id: v.id("bookings"), internalNotes: v.string() },
  handler: async (ctx, { id, internalNotes }) => {
    await requireOwner(ctx);
    await ctx.db.patch(id, { internalNotes: internalNotes.slice(0, 5000), updatedAt: Date.now() });
  },
});

export const clearAttention = mutation({
  args: { id: v.id("bookings") },
  handler: async (ctx, { id }) => {
    await requireOwner(ctx);
    await ctx.db.patch(id, { needsAttention: undefined });
  },
});

export const recordPayment = mutation({
  args: {
    id: v.id("bookings"),
    kind: v.union(v.literal("charge"), v.literal("refund")),
    amount: v.number(),
    method: paymentMethod,
    paidAt: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = await requireOwner(ctx);
    if (!Number.isInteger(args.amount) || args.amount <= 0) {
      throw new ConvexError("Enter an amount greater than zero.");
    }
    const b = await ctx.db.get(args.id);
    if (!b) throw new ConvexError("Booking not found");
    if (args.kind === "refund" && args.amount > b.amountPaid - b.amountRefunded) {
      throw new ConvexError("Refund is more than what has been paid.");
    }
    await ctx.db.insert("payments", {
      bookingId: args.id,
      kind: args.kind,
      amount: args.amount,
      currency: CURRENCY,
      method: args.method,
      provider: "manual",
      status: "succeeded",
      paidAt: args.paidAt,
      note: args.note?.slice(0, 500),
      recordedBy: email,
      createdAt: Date.now(),
    });
    const before = b.amountPaid;
    await recomputeBookingMoney(ctx, args.id);
    if (args.kind === "charge" && before === 0 && b.status === "pending" && b.holdExpiresAt !== undefined) {
      await ctx.db.patch(args.id, { holdExpiresAt: undefined });
    }
  },
});

export const deletePayment = mutation({
  args: { paymentId: v.id("payments") },
  handler: async (ctx, { paymentId }) => {
    await requireOwner(ctx);
    const p = await ctx.db.get(paymentId);
    if (!p) return;
    if (p.provider !== "manual") throw new ConvexError("Online payments can't be deleted. Record a refund instead.");
    await ctx.db.delete(paymentId);
    await recomputeBookingMoney(ctx, p.bookingId);
  },
});

export const paystackRefundTarget = internalQuery({
  args: { id: v.id("bookings") },
  handler: async (ctx, { id }) => {
    const rows = await ctx.db.query("payments").withIndex("by_booking", (q) => q.eq("bookingId", id)).collect();
    const p = rows.find((r) => r.provider === "paystack" && r.status === "succeeded" && r.kind === "charge");
    return p?.providerRef ?? null;
  },
});

export const insertProviderRefund = internalMutation({
  args: { id: v.id("bookings"), amount: v.number(), recordedBy: v.string(), providerRef: v.string(), note: v.optional(v.string()) },
  handler: async (ctx, a) => {
    await ctx.db.insert("payments", {
      bookingId: a.id,
      kind: "refund",
      amount: a.amount,
      currency: CURRENCY,
      method: "card",
      provider: "paystack",
      providerRef: `refund:${a.providerRef}:${Date.now()}`,
      status: "succeeded",
      paidAt: Date.now(),
      note: a.note,
      recordedBy: a.recordedBy,
      createdAt: Date.now(),
    });
    await recomputeBookingMoney(ctx, a.id);
  },
});

/** Optional: refund an online payment through Paystack's refund API. */
export const refundViaPaystack = action({
  args: { id: v.id("bookings"), amount: v.number(), note: v.optional(v.string()) },
  handler: async (ctx, { id, amount, note }) => {
    const email = await requireOwner(ctx);
    const ref: string | null = await ctx.runQuery(internal.dashboard.paystackRefundTarget, { id });
    if (!ref) throw new ConvexError("This booking has no online payment to refund.");
    const provider = getPaymentProvider();
    if (!provider.refund) throw new ConvexError("Refunds aren't supported by this provider.");
    await provider.refund(ref, amount);
    await ctx.runMutation(internal.dashboard.insertProviderRefund, { id, amount, recordedBy: email, providerRef: ref, note });
  },
});

export type DashboardBookingId = Id<"bookings">;
