/** Owner-only: services, availability, blocked dates, settings, clients. */
import { v, ConvexError } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { requireOwner } from "./lib/auth";
import { DEFAULT_SETTINGS, getRules, getSettings } from "./lib/settings";

// ---------- Services ----------
export const listServices = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    const rows = await ctx.db.query("services").collect();
    return rows.sort((a, b) => Number(a.archived) - Number(b.archived) || a.sortOrder - b.sortOrder);
  },
});

const serviceFields = {
  name: v.string(),
  description: v.string(),
  basePrice: v.number(),
  pricePerGuest: v.number(),
  minGuests: v.number(),
  maxGuests: v.number(),
  durationMinutes: v.number(),
  sortOrder: v.number(),
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function validateService(s: { name: string; basePrice: number; pricePerGuest: number; minGuests: number; maxGuests: number; durationMinutes: number }) {
  if (s.name.trim().length < 2) throw new ConvexError("Give the service a name.");
  if ([s.basePrice, s.pricePerGuest].some((n) => !Number.isInteger(n) || n < 0)) throw new ConvexError("Prices can't be negative.");
  if (s.minGuests < 1 || s.maxGuests < s.minGuests) throw new ConvexError("Check the guest range.");
  if (s.durationMinutes < 30 || s.durationMinutes > 16 * 60) throw new ConvexError("Duration should be between 30 minutes and 16 hours.");
}

export const saveService = mutation({
  args: { id: v.optional(v.id("services")), ...serviceFields },
  handler: async (ctx, { id, ...fields }) => {
    await requireOwner(ctx);
    validateService(fields);
    const slug = slugify(fields.name);
    if (id) {
      await ctx.db.patch(id, { ...fields, slug });
      return id;
    }
    return ctx.db.insert("services", { ...fields, slug, archived: false });
  },
});

export const setServiceArchived = mutation({
  args: { id: v.id("services"), archived: v.boolean() },
  handler: async (ctx, { id, archived }) => {
    await requireOwner(ctx);
    await ctx.db.patch(id, { archived });
  },
});

// ---------- Availability ----------
export const getAvailability = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    const [rules, settings, blocked] = await Promise.all([
      getRules(ctx),
      getSettings(ctx),
      ctx.db.query("blockedDates").withIndex("by_date").collect(),
    ]);
    return {
      rules,
      blocked: blocked.map((b) => ({ _id: b._id, date: b.date, reason: b.reason })),
      leadTimeHours: settings.leadTimeHours,
      maxBookingsPerDay: settings.maxBookingsPerDay,
      bufferMinutes: settings.bufferMinutes,
      slotIntervalMinutes: settings.slotIntervalMinutes,
      maxAdvanceDays: settings.maxAdvanceDays,
    };
  },
});

const time = /^([01]\d|2[0-3]):[0-5]\d$/;

export const saveAvailability = mutation({
  args: {
    rules: v.array(v.object({ weekday: v.number(), enabled: v.boolean(), start: v.string(), end: v.string() })),
    leadTimeHours: v.number(),
    maxBookingsPerDay: v.number(),
    bufferMinutes: v.number(),
    slotIntervalMinutes: v.number(),
    maxAdvanceDays: v.number(),
  },
  handler: async (ctx, a) => {
    await requireOwner(ctx);
    for (const r of a.rules) {
      if (!time.test(r.start) || !time.test(r.end) || r.start >= r.end) {
        throw new ConvexError("Each working day needs a start time before its end time.");
      }
      const existing = await ctx.db.query("availabilityRules").withIndex("by_weekday", (q) => q.eq("weekday", r.weekday)).first();
      if (existing) await ctx.db.patch(existing._id, r);
      else await ctx.db.insert("availabilityRules", r);
    }
    if (a.maxBookingsPerDay < 1 || a.slotIntervalMinutes < 15 || a.leadTimeHours < 0 || a.bufferMinutes < 0) {
      throw new ConvexError("Check the availability numbers.");
    }
    await upsertSettings(ctx, {
      leadTimeHours: a.leadTimeHours,
      maxBookingsPerDay: a.maxBookingsPerDay,
      bufferMinutes: a.bufferMinutes,
      slotIntervalMinutes: a.slotIntervalMinutes,
      maxAdvanceDays: a.maxAdvanceDays,
    });
  },
});

export const blockDate = mutation({
  args: { date: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, { date, reason }) => {
    await requireOwner(ctx);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new ConvexError("Pick a date.");
    const existing = await ctx.db.query("blockedDates").withIndex("by_date", (q) => q.eq("date", date)).first();
    if (!existing) await ctx.db.insert("blockedDates", { date, reason: reason || undefined });
  },
});

export const unblockDate = mutation({
  args: { id: v.id("blockedDates") },
  handler: async (ctx, { id }) => {
    await requireOwner(ctx);
    await ctx.db.delete(id);
  },
});

// ---------- Settings ----------
async function upsertSettings(ctx: MutationCtx, patch: Partial<typeof DEFAULT_SETTINGS>) {
  const doc = await ctx.db.query("settings").first();
  if (doc) await ctx.db.patch(doc._id, patch);
  else await ctx.db.insert("settings", { ...DEFAULT_SETTINGS, ...patch });
}

export const getSettingsForOwner = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    const s = await getSettings(ctx);
    return {
      businessName: s.businessName,
      phone: s.phone,
      whatsapp: s.whatsapp,
      email: s.email,
      instagram: s.instagram ?? "",
      serviceArea: s.serviceArea,
      depositPercent: s.depositPercent,
      cancellationPolicy: s.cancellationPolicy,
      autoConfirmPaid: s.autoConfirmPaid,
      notifyOwnerEmail: s.notifyOwnerEmail ?? "",
      notifyOnNewBooking: s.notifyOnNewBooking,
      sendClientReminders: s.sendClientReminders,
    };
  },
});

export const saveSettings = mutation({
  args: {
    businessName: v.string(),
    phone: v.string(),
    whatsapp: v.string(),
    email: v.string(),
    instagram: v.string(),
    serviceArea: v.string(),
    depositPercent: v.number(),
    cancellationPolicy: v.string(),
    autoConfirmPaid: v.boolean(),
    notifyOwnerEmail: v.string(),
    notifyOnNewBooking: v.boolean(),
    sendClientReminders: v.boolean(),
  },
  handler: async (ctx, a) => {
    await requireOwner(ctx);
    if (a.depositPercent < 0 || a.depositPercent > 100) throw new ConvexError("Deposit must be between 0 and 100%.");
    await upsertSettings(ctx, {
      ...a,
      whatsapp: a.whatsapp.replace(/[^0-9]/g, ""),
      instagram: a.instagram.replace(/^@/, "") || undefined,
      notifyOwnerEmail: a.notifyOwnerEmail || undefined,
    });
  },
});

// ---------- Clients ----------
export const listClients = query({
  args: {},
  handler: async (ctx) => {
    await requireOwner(ctx);
    const [customers, bookings] = await Promise.all([
      ctx.db.query("customers").collect(),
      ctx.db.query("bookings").collect(),
    ]);
    return customers
      .map((c) => {
        const mine = bookings
          .filter((b) => b.customerId === c._id && !(b.status === "cancelled" && b.cancellationReason?.startsWith("Payment not")))
          .sort((a, b) => b.startAt - a.startAt);
        return {
          _id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          bookingCount: mine.length,
          completedCount: mine.filter((b) => b.status === "completed").length,
          totalSpent: mine.reduce((s, b) => s + b.amountPaid - b.amountRefunded, 0),
          lastBooking: mine[0] ? { _id: mine[0]._id, date: mine[0].date, serviceName: mine[0].serviceName, status: mine[0].status } : null,
          bookings: mine.slice(0, 10).map((b) => ({ _id: b._id, date: b.date, serviceName: b.serviceName, status: b.status, reference: b.reference })),
        };
      })
      .filter((c) => c.bookingCount > 0)
      .sort((a, b) => (b.lastBooking?.date ?? "").localeCompare(a.lastBooking?.date ?? ""));
  },
});
