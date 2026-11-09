import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import type { AvailabilityInput } from "../../src/lib/domain/availability";
import { getRules, getSettings } from "./settings";

/** A booking blocks the calendar if it's pending/confirmed and not an expired hold. */
export function occupiesSlot(b: Doc<"bookings">, now: number): boolean {
  if (b.status !== "pending" && b.status !== "confirmed") return false;
  if (b.holdExpiresAt !== undefined && b.holdExpiresAt < now && b.amountPaid === 0) return false;
  return true;
}

export async function buildAvailabilityInput(
  ctx: QueryCtx,
  args: { durationMinutes: number; fromDate: string; toDate: string; excludeBookingId?: Doc<"bookings">["_id"] },
): Promise<AvailabilityInput> {
  const now = Date.now();
  const [settings, rules, blocked, bookings] = await Promise.all([
    getSettings(ctx),
    getRules(ctx),
    ctx.db
      .query("blockedDates")
      .withIndex("by_date", (q) => q.gte("date", args.fromDate).lte("date", args.toDate))
      .collect(),
    ctx.db
      .query("bookings")
      .withIndex("by_date", (q) => q.gte("date", args.fromDate).lte("date", args.toDate))
      .collect(),
  ]);
  return {
    rules,
    blockedDates: blocked.map((b) => b.date),
    settings: {
      leadTimeHours: settings.leadTimeHours,
      maxBookingsPerDay: settings.maxBookingsPerDay,
      bufferMinutes: settings.bufferMinutes,
      slotIntervalMinutes: settings.slotIntervalMinutes,
      maxAdvanceDays: settings.maxAdvanceDays,
    },
    bookings: bookings
      .filter((b) => b._id !== args.excludeBookingId && occupiesSlot(b, now))
      .map((b) => ({ date: b.date, startTime: b.startTime, endTime: b.endTime })),
    durationMinutes: args.durationMinutes,
    now,
  };
}
