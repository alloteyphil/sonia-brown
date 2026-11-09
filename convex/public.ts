/** Read-only functions the public site and booking flow call (no login). */
import { v } from "convex/values";
import { addDays, format, parse } from "date-fns";
import { query } from "./_generated/server";
import { getSettings } from "./lib/settings";
import { buildAvailabilityInput } from "./lib/occupancy";
import { availableDates, slotsForDate } from "../src/lib/domain/availability";
import { todayInAccra, addMinutesToTime } from "../src/lib/domain/time";

export const services = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("services")
      .withIndex("by_archived_order", (q) => q.eq("archived", false))
      .collect();
    return rows.map((s) => ({
      _id: s._id,
      name: s.name,
      slug: s.slug,
      description: s.description,
      basePrice: s.basePrice,
      pricePerGuest: s.pricePerGuest,
      minGuests: s.minGuests,
      maxGuests: s.maxGuests,
      durationMinutes: s.durationMinutes,
      imageUrl: s.imageUrl,
    }));
  },
});

export const businessInfo = query({
  args: {},
  handler: async (ctx) => {
    const s = await getSettings(ctx);
    return {
      businessName: s.businessName,
      phone: s.phone,
      whatsapp: s.whatsapp,
      email: s.email,
      instagram: s.instagram,
      serviceArea: s.serviceArea,
      depositPercent: s.depositPercent,
      cancellationPolicy: s.cancellationPolicy,
      leadTimeHours: s.leadTimeHours,
    };
  },
});

export const availableDays = query({
  args: { serviceId: v.id("services"), from: v.optional(v.string()), days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service || service.archived) return [];
    const from = args.from ?? todayInAccra();
    const days = Math.min(args.days ?? 62, 120);
    const to = format(addDays(parse(from, "yyyy-MM-dd", new Date()), days), "yyyy-MM-dd");
    const input = await buildAvailabilityInput(ctx, {
      durationMinutes: service.durationMinutes,
      fromDate: from,
      toDate: to,
    });
    return availableDates(from, days, input);
  },
});

export const slots = query({
  args: { serviceId: v.id("services"), date: v.string() },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service || service.archived) return [];
    const input = await buildAvailabilityInput(ctx, {
      durationMinutes: service.durationMinutes,
      fromDate: args.date,
      toDate: args.date,
    });
    return slotsForDate(args.date, input).map((start) => ({
      start,
      end: addMinutesToTime(start, service.durationMinutes),
    }));
  },
});

/** Guest-facing booking summary. Requires the reference AND the secret token. */
export const bookingByReference = query({
  args: { reference: v.string(), token: v.string() },
  handler: async (ctx, { reference, token }) => {
    const b = await ctx.db
      .query("bookings")
      .withIndex("by_reference", (q) => q.eq("reference", reference.toUpperCase()))
      .first();
    if (!b || b.accessToken !== token) return null;
    const customer = await ctx.db.get(b.customerId);
    const settings = await getSettings(ctx);
    return {
      reference: b.reference,
      serviceName: b.serviceName,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      guests: b.guests,
      address: b.address,
      occasion: b.occasion,
      status: b.status,
      paymentStatus: b.paymentStatus,
      paymentChoice: b.paymentChoice,
      lineItems: b.lineItems,
      total: b.total,
      depositDue: b.depositDue,
      amountPaid: b.amountPaid,
      balance: Math.max(0, b.total - b.amountPaid + b.amountRefunded),
      holdExpiresAt: b.holdExpiresAt ?? null,
      cancellationReason: b.cancellationReason,
      firstName: customer?.name.split(" ")[0] ?? "",
      whatsapp: settings.whatsapp,
      cancellationPolicy: settings.cancellationPolicy,
    };
  },
});
