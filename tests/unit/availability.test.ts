import { describe, expect, it } from "vitest";
import {
  availableDates,
  checkSlot,
  slotsForDate,
  type AvailabilityInput,
} from "../../src/lib/domain/availability";
import { toEpoch } from "../../src/lib/domain/time";

// 2026-12-07 is a Monday.
const MONDAY = "2026-12-07";
const rules = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  enabled: weekday !== 0, // closed Sundays
  start: "10:00",
  end: "20:00",
}));

function input(overrides: Partial<AvailabilityInput> = {}): AvailabilityInput {
  return {
    rules,
    blockedDates: [],
    settings: {
      leadTimeHours: 48,
      maxBookingsPerDay: 2,
      bufferMinutes: 60,
      slotIntervalMinutes: 60,
      maxAdvanceDays: 180,
    },
    bookings: [],
    durationMinutes: 240,
    now: toEpoch("2026-12-01", "09:00"),
    ...overrides,
  };
}

describe("slotsForDate", () => {
  it("lists slots that fit inside working hours", () => {
    expect(slotsForDate(MONDAY, input())).toEqual([
      "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
    ]);
  });

  it("returns nothing on closed weekdays and blocked dates", () => {
    expect(slotsForDate("2026-12-06", input())).toEqual([]); // Sunday
    expect(slotsForDate(MONDAY, input({ blockedDates: [MONDAY] }))).toEqual([]);
  });

  it("respects lead time", () => {
    const now = toEpoch("2026-12-05", "12:00"); // 48h later = Mon 12:00
    expect(slotsForDate(MONDAY, input({ now }))[0]).toBe("12:00");
  });

  it("keeps a buffer around existing bookings", () => {
    const bookings = [{ date: MONDAY, startTime: "10:00", endTime: "14:00" }];
    // needs 60 min buffer after 14:00 -> earliest 15:00, must end by 20:00
    expect(slotsForDate(MONDAY, input({ bookings }))).toEqual(["15:00", "16:00"]);
  });

  it("closes the day when the daily limit is reached", () => {
    const bookings = [
      { date: MONDAY, startTime: "08:00", endTime: "09:00" },
      { date: MONDAY, startTime: "21:00", endTime: "22:00" },
    ];
    expect(slotsForDate(MONDAY, input({ bookings }))).toEqual([]);
  });
});

describe("checkSlot (double-booking guard)", () => {
  it("rejects a slot that is already taken", () => {
    const bookings = [{ date: MONDAY, startTime: "12:00", endTime: "16:00" }];
    expect(checkSlot(MONDAY, "12:00", input({ bookings })).ok).toBe(false);
    expect(checkSlot(MONDAY, "13:00", input({ bookings })).ok).toBe(false);
  });
  it("accepts a free slot", () => {
    expect(checkSlot(MONDAY, "12:00", input()).ok).toBe(true);
  });
});

describe("availableDates", () => {
  it("skips Sundays and days inside the lead time", () => {
    const dates = availableDates("2026-12-01", 7, input());
    expect(dates).not.toContain("2026-12-01"); // within 48h
    expect(dates).not.toContain("2026-12-06"); // Sunday
    expect(dates).toContain("2026-12-03");
  });
});
