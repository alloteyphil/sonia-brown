import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Safety net for slot holds whose scheduled expiry didn't run.
crons.interval("sweep expired holds", { minutes: 30 }, internal.bookings.sweepExpiredHolds, {});

// 9:00 Accra (UTC+0): remind clients about bookings in two days.
crons.daily("client reminders", { hourUTC: 9, minuteUTC: 0 }, internal.emails.sendReminders, {});

export default crons;
