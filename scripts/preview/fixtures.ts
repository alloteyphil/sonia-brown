import { addDays, format } from "date-fns";
import { availableDates, slotsForDate } from "../../src/lib/domain/availability";
import { computeQuote } from "../../src/lib/domain/pricing";
import { addMinutesToTime, toEpoch, todayInAccra } from "../../src/lib/domain/time";
import { fallbackBusiness, fallbackServices } from "../../src/brand/content";

const services = fallbackServices.map((s, i) => ({ ...s, _id: `svc${i}` }));
const today = todayInAccra();
const day = (n: number) => format(addDays(new Date(today), n), "yyyy-MM-dd");
const rules = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, enabled: weekday !== 1, start: weekday === 0 ? "12:00" : "10:00", end: "21:00" }));
const settings = { leadTimeHours: 48, maxBookingsPerDay: 2, bufferMinutes: 90, slotIntervalMinutes: 30, maxAdvanceDays: 180 };

const people = [
  ["Ama Owusu", "024 555 0101", "ama@example.com"],
  ["Kwame Mensah", "020 555 0102", "kwame@example.com"],
  ["Efua Asante", "027 555 0103", "efua@example.com"],
  ["Daniel Boateng", "055 555 0104", "daniel@example.com"],
  ["Naa Adjeley", "026 555 0105", "naa@example.com"],
];
const raw: Array<[number, number, number, string, number, string, number]> = [
  [0, 0, 3, "18:00", 6, "confirmed", 0.3],
  [1, 1, 5, "10:00", 2, "pending", 0],
  [2, 2, 12, "11:00", 40, "confirmed", 1],
  [0, 3, 8, "19:00", 4, "pending", 0],
  [0, 4, -6, "18:30", 8, "completed", 1],
  [1, 0, -13, "10:00", 2, "completed", 0.3],
  [0, 1, 0, "18:00", 3, "confirmed", 0.3],
  [2, 3, 17, "12:00", 25, "confirmed", 0.3],
];
const bookings = raw.map(([s, c, off, time, guests, status, paidFrac], i) => {
  const svc = services[s];
  const q = computeQuote(svc, guests, 30);
  const date = day(off);
  const paid = paidFrac === 1 ? q.total : paidFrac > 0 ? q.depositDue : 0;
  return {
    _id: `bk${i}`, reference: `SB-${["K7M2QX", "P4HT9A", "W3ZN8R", "C6JV2D", "M9QR4T", "H2XK7P", "T5NW3E", "B8FG6Y"][i]}`,
    serviceId: svc._id, serviceName: svc.name, customerId: `c${c}`, customerName: people[c][0], customerPhone: people[c][1], customerEmail: people[c][2],
    date, startTime: time, endTime: addMinutesToTime(time, svc.durationMinutes), startAt: toEpoch(date, time), guests,
    address: ["14 Ringway Estates, Osu, Accra", "House 7, East Legon", "Labadi Beach Hotel garden", "Airport Residential", "Cantonments, Accra"][c],
    occasion: ["30th birthday", undefined, "Naming ceremony", "Anniversary", "Family dinner"][c], dietaryNotes: c === 0 ? "One guest has a peanut allergy" : c === 1 ? "Low carb, no pork" : undefined,
    status, lineItems: q.lineItems, total: q.total, depositDue: q.depositDue, amountPaid: paid, amountRefunded: 0,
    paymentStatus: paid === 0 ? "unpaid" : paid >= q.total ? "paid" : "deposit_paid", paymentChoice: paid ? "deposit" : "later",
    createdAt: Date.now() - i * 86400000, updatedAt: Date.now(), balance: q.total - paid, awaitingPayment: false,
  };
});
const occupied = bookings.filter((b) => b.status === "pending" || b.status === "confirmed");
const input = (duration: number) => ({ rules, blockedDates: [day(20)], settings, bookings: occupied, durationMinutes: duration, now: Date.now() });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fixtures: Record<string, any> = {
  "public:services": services,
  "public:businessInfo": fallbackBusiness,
  "public:availableDays": (a: { serviceId: string }) => availableDates(today, 120, input(services.find((s) => s._id === a.serviceId)!.durationMinutes)),
  "public:slots": (a: { serviceId: string; date: string }) => {
    const svc = services.find((s) => s._id === a.serviceId)!;
    return slotsForDate(a.date, input(svc.durationMinutes)).map((start) => ({ start, end: addMinutesToTime(start, svc.durationMinutes) }));
  },
  "public:bookingByReference": () => ({ ...bookings[0], firstName: "Ama", balance: bookings[0].total - bookings[0].amountPaid, whatsapp: "233200000000", cancellationPolicy: fallbackBusiness.cancellationPolicy, holdExpiresAt: null }),
  "dashboard:me": { ok: true, email: "sonia@example.com" },
  "dashboard:overview": {
    today: bookings.filter((b) => b.date === today),
    thisWeek: occupied.filter((b) => b.date >= today && b.date <= day(7)).sort((a, b) => a.startAt - b.startAt),
    upcoming: occupied.filter((b) => b.date >= today),
    pendingRequests: bookings.filter((b) => b.status === "pending"),
    attention: [],
    stats: { revenueThisMonth: 1234000, outstanding: bookings.filter((b) => b.status === "confirmed").reduce((s, b) => s + b.balance, 0), upcomingCount: occupied.filter((b) => b.date >= today).length, pendingCount: 2 },
  },
  "dashboard:bookingsInRange": (a: { from: string; to: string }) => ({ bookings: bookings.filter((b) => b.date >= a.from && b.date <= a.to), blockedDates: [{ date: day(20), reason: "Family wedding" }] }),
  "dashboard:listBookings": bookings,
  "dashboard:bookingDetail": (a: { id: string }) => {
    const b = bookings.find((x) => x._id === a.id);
    if (!b) return null;
    return { ...b, internalNotes: "Bring the cast-iron pan.", payments: b.amountPaid ? [{ _id: "p1", kind: "charge", amount: b.amountPaid, method: "mobile_money", provider: "manual", status: "succeeded", paidAt: Date.now() - 3 * 86400000, createdAt: Date.now(), note: "MoMo ref 88213" }] : [], serviceDurationMinutes: 300, business: { name: "Sonia Brown — Private Chef & Catering", phone: "+233 20 000 0000", email: "hello@soniabrown.com", serviceArea: "Greater Accra", cancellationPolicy: fallbackBusiness.cancellationPolicy } };
  },
  "admin:listClients": people.map((p, i) => ({ _id: `c${i}`, name: p[0], phone: p[1], email: p[2], bookingCount: bookings.filter((b) => b.customerId === `c${i}`).length, completedCount: 1, totalSpent: bookings.filter((b) => b.customerId === `c${i}`).reduce((s, b) => s + b.amountPaid, 0), lastBooking: null, bookings: bookings.filter((b) => b.customerId === `c${i}`) })),
  "admin:listServices": services.map((s, i) => ({ ...s, archived: false, sortOrder: i })),
  "admin:getAvailability": { rules, blocked: [{ _id: "bl1", date: day(20), reason: "Family wedding" }], ...settings },
  "admin:getSettingsForOwner": { ...fallbackBusiness, instagram: "soniabrown.chef", autoConfirmPaid: true, notifyOwnerEmail: "", notifyOnNewBooking: true, sendClientReminders: true },
};
