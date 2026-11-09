import { addDays, format, parse } from "date-fns";
import { minutesOf, timeOf, toEpoch, weekdayOf } from "./time";

export type WeeklyRule = {
  weekday: number; // 0 = Sunday
  enabled: boolean;
  start: string; // "HH:mm"
  end: string; // "HH:mm" latest time a booking may END
};

export type AvailabilitySettings = {
  leadTimeHours: number;
  maxBookingsPerDay: number;
  bufferMinutes: number; // travel / setup / cleanup gap between bookings
  slotIntervalMinutes: number;
  maxAdvanceDays: number;
};

export type OccupiedBooking = {
  date: string;
  startTime: string;
  endTime: string;
};

export type AvailabilityInput = {
  rules: WeeklyRule[];
  blockedDates: string[];
  settings: AvailabilitySettings;
  bookings: OccupiedBooking[]; // active bookings + live holds only
  durationMinutes: number;
  now: number; // epoch ms
};

export type SlotCheck = { ok: true } | { ok: false; reason: string };

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/** All start times on `date` that a booking of `durationMinutes` could take. */
export function slotsForDate(date: string, input: AvailabilityInput): string[] {
  const { rules, blockedDates, settings, bookings, durationMinutes, now } = input;
  if (blockedDates.includes(date)) return [];

  const rule = rules.find((r) => r.weekday === weekdayOf(date));
  if (!rule || !rule.enabled) return [];

  const sameDay = bookings.filter((b) => b.date === date);
  if (sameDay.length >= settings.maxBookingsPerDay) return [];

  const earliest = now + settings.leadTimeHours * 3600_000;
  const latest = now + settings.maxAdvanceDays * 86400_000;
  const open = minutesOf(rule.start);
  const close = minutesOf(rule.end);
  const slots: string[] = [];

  for (let t = open; t + durationMinutes <= close; t += settings.slotIntervalMinutes) {
    const start = timeOf(t);
    const startAt = toEpoch(date, start);
    if (startAt < earliest || startAt > latest) continue;
    const clash = sameDay.some((b) =>
      overlaps(
        t - settings.bufferMinutes,
        t + durationMinutes + settings.bufferMinutes,
        minutesOf(b.startTime),
        minutesOf(b.endTime),
      ),
    );
    if (!clash) slots.push(start);
  }
  return slots;
}

/** Authoritative check run inside the booking transaction. */
export function checkSlot(date: string, startTime: string, input: AvailabilityInput): SlotCheck {
  if (input.blockedDates.includes(date)) {
    return { ok: false, reason: "Sonia isn't taking bookings on that date." };
  }
  const slots = slotsForDate(date, input);
  if (!slots.includes(startTime)) {
    return {
      ok: false,
      reason: "Sorry, that time was just taken or is no longer available. Please pick another.",
    };
  }
  return { ok: true };
}

/** Days in [from, from+days) with at least one open slot. */
export function availableDates(from: string, days: number, input: AvailabilityInput): string[] {
  const start = parse(from, "yyyy-MM-dd", new Date());
  const out: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = format(addDays(start, i), "yyyy-MM-dd");
    if (slotsForDate(d, input).length > 0) out.push(d);
  }
  return out;
}
