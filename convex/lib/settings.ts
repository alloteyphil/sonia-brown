import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { WeeklyRule } from "../../src/lib/domain/availability";

export type Settings = Omit<Doc<"settings">, "_id" | "_creationTime">;

export const DEFAULT_SETTINGS: Settings = {
  businessName: "Sonia Brown — Private Chef & Catering",
  phone: "+233 20 000 0000",
  whatsapp: "233200000000",
  email: "hello@soniabrown.com",
  instagram: "soniabrown.chef",
  serviceArea: "Greater Accra",
  depositPercent: 30,
  cancellationPolicy:
    "Cancel more than 7 days before your booking for a full refund of your deposit. " +
    "Within 7 days, the deposit covers ingredients already bought and isn't refundable. " +
    "You can reschedule once, free of charge, with at least 72 hours' notice.",
  leadTimeHours: 48,
  maxBookingsPerDay: 2,
  bufferMinutes: 90,
  slotIntervalMinutes: 30,
  maxAdvanceDays: 180,
  autoConfirmPaid: true,
  notifyOwnerEmail: undefined,
  notifyOnNewBooking: true,
  sendClientReminders: true,
};

export const DEFAULT_RULES: WeeklyRule[] = [
  { weekday: 0, enabled: true, start: "12:00", end: "21:00" },
  { weekday: 1, enabled: false, start: "10:00", end: "21:00" },
  { weekday: 2, enabled: true, start: "10:00", end: "21:00" },
  { weekday: 3, enabled: true, start: "10:00", end: "21:00" },
  { weekday: 4, enabled: true, start: "10:00", end: "21:00" },
  { weekday: 5, enabled: true, start: "10:00", end: "22:00" },
  { weekday: 6, enabled: true, start: "10:00", end: "22:00" },
];

export async function getSettings(ctx: QueryCtx): Promise<Settings & { _id?: Doc<"settings">["_id"] }> {
  const doc = await ctx.db.query("settings").first();
  return doc ? { ...DEFAULT_SETTINGS, ...doc } : DEFAULT_SETTINGS;
}

export async function getRules(ctx: QueryCtx): Promise<WeeklyRule[]> {
  const docs = await ctx.db.query("availabilityRules").collect();
  if (docs.length === 0) return DEFAULT_RULES;
  return DEFAULT_RULES.map((def) => {
    const d = docs.find((x) => x.weekday === def.weekday);
    return d ? { weekday: d.weekday, enabled: d.enabled, start: d.start, end: d.end } : def;
  });
}
