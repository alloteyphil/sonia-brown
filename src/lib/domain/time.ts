import { fromZonedTime, formatInTimeZone, toZonedTime } from "date-fns-tz";
import { format, parse } from "date-fns";

/**
 * All business dates and times are in Africa/Accra. Bookings store
 * `date` ("yyyy-MM-dd") and `startTime` ("HH:mm") as Accra wall-clock values,
 * plus `startAt` (UTC epoch ms) for sorting and comparisons.
 */
export const TIMEZONE = "Africa/Accra";

export function toEpoch(date: string, time: string): number {
  return fromZonedTime(`${date}T${time}:00`, TIMEZONE).getTime();
}

export function todayInAccra(now: Date = new Date()): string {
  return formatInTimeZone(now, TIMEZONE, "yyyy-MM-dd");
}

export function weekdayOf(date: string): number {
  // 0 = Sunday ... 6 = Saturday
  return parse(date, "yyyy-MM-dd", new Date(2000, 0, 1)).getDay();
}

export function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function timeOf(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function addMinutesToTime(time: string, mins: number): string {
  return timeOf(minutesOf(time) + mins);
}

export function formatDateLong(date: string): string {
  return format(parse(date, "yyyy-MM-dd", new Date()), "EEEE d MMMM yyyy");
}

export function formatDateShort(date: string): string {
  return format(parse(date, "yyyy-MM-dd", new Date()), "EEE d MMM");
}

export function formatTime12(time: string): string {
  return format(parse(time, "HH:mm", new Date()), "h:mm a");
}

export function nowInAccra(now: Date = new Date()): Date {
  return toZonedTime(now, TIMEZONE);
}
