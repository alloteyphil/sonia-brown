/**
 * Demo data so the dashboard is usable immediately.
 *   npx convex run seed:run
 * Safe to run once; refuses if services already exist (pass {force:true} to add anyway).
 */
import { v } from "convex/values";
import { addDays, format, parse } from "date-fns";
import { internalMutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { DEFAULT_RULES, DEFAULT_SETTINGS } from "./lib/settings";
import { computeQuote } from "../src/lib/domain/pricing";
import { addMinutesToTime, toEpoch, todayInAccra } from "../src/lib/domain/time";
import { makeReference, randomCode } from "../src/lib/domain/validation";
import type { BookingStatus } from "../src/lib/domain/status";
import { derivePaymentStatus } from "../src/lib/domain/status";

export const run = internalMutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, { force }) => {
    const existing = await ctx.db.query("services").first();
    if (existing && !force) return "Already seeded. Run with {\"force\": true} to add demo bookings again.";

    if (!(await ctx.db.query("settings").first())) {
      await ctx.db.insert("settings", DEFAULT_SETTINGS);
    }
    if (!(await ctx.db.query("availabilityRules").first())) {
      for (const r of DEFAULT_RULES) await ctx.db.insert("availabilityRules", r);
    }

    const services = [
      {
        name: "Private Dinner",
        description:
          "A multi-course dinner cooked in your kitchen and served at your table. Perfect for birthdays, anniversaries and dinners you want to remember.",
        basePrice: 60000,
        pricePerGuest: 35000,
        minGuests: 2,
        maxGuests: 14,
        durationMinutes: 300,
        sortOrder: 1,
      },
      {
        name: "Weekly Meal Prep",
        description:
          "A week of fresh, balanced meals cooked in your home, portioned and labelled in your fridge. Tailored to your goals and tastes.",
        basePrice: 80000,
        pricePerGuest: 20000,
        minGuests: 1,
        maxGuests: 6,
        durationMinutes: 240,
        sortOrder: 2,
      },
      {
        name: "Event Catering",
        description:
          "Beautiful food for gatherings of up to 80: small chops, buffet or family-style, with setup and service handled.",
        basePrice: 150000,
        pricePerGuest: 18000,
        minGuests: 15,
        maxGuests: 80,
        durationMinutes: 480,
        sortOrder: 3,
      },
    ];
    const serviceIds: Id<"services">[] = [];
    for (const s of services) {
      const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      serviceIds.push(await ctx.db.insert("services", { ...s, slug, archived: false }));
    }

    const people = [
      { name: "Ama Owusu", email: "ama.owusu@example.com", phone: "024 555 0101" },
      { name: "Kwame Mensah", email: "kwame.mensah@example.com", phone: "020 555 0102" },
      { name: "Efua Asante", email: "efua.asante@example.com", phone: "027 555 0103" },
      { name: "Daniel Boateng", email: "daniel.b@example.com", phone: "055 555 0104" },
      { name: "Naa Adjeley", email: "naa.adjeley@example.com", phone: "026 555 0105" },
    ];
    const customerIds: Id<"customers">[] = [];
    for (const p of people) customerIds.push(await ctx.db.insert("customers", { ...p, createdAt: Date.now() }));

    const today = parse(todayInAccra(), "yyyy-MM-dd", new Date());
    const day = (offset: number) => format(addDays(today, offset), "yyyy-MM-dd");

    const demo: Array<{
      s: number; c: number; offset: number; time: string; guests: number; status: BookingStatus;
      paid: "none" | "deposit" | "full"; method?: "card" | "mobile_money" | "cash"; address: string; occasion?: string; dietary?: string; choice: "deposit" | "full" | "later";
    }> = [
      { s: 0, c: 0, offset: 3, time: "18:00", guests: 6, status: "confirmed", paid: "deposit", method: "mobile_money", address: "14 Ringway Estates, Osu, Accra", occasion: "30th birthday", dietary: "One guest has a peanut allergy", choice: "deposit" },
      { s: 1, c: 1, offset: 5, time: "10:00", guests: 2, status: "pending", paid: "none", address: "House 7, East Legon, Accra", dietary: "Low carb, no pork", choice: "later" },
      { s: 2, c: 2, offset: 12, time: "11:00", guests: 40, status: "confirmed", paid: "full", method: "card", address: "Labadi Beach Hotel garden", occasion: "Naming ceremony", choice: "full" },
      { s: 0, c: 3, offset: 8, time: "19:00", guests: 4, status: "pending", paid: "none", address: "Airport Residential, Accra", occasion: "Anniversary", choice: "later" },
      { s: 0, c: 4, offset: -6, time: "18:30", guests: 8, status: "completed", paid: "full", method: "cash", address: "Cantonments, Accra", occasion: "Family dinner", choice: "deposit" },
      { s: 1, c: 0, offset: -13, time: "10:00", guests: 2, status: "completed", paid: "deposit", method: "mobile_money", address: "14 Ringway Estates, Osu, Accra", choice: "deposit" },
      { s: 0, c: 1, offset: -2, time: "18:00", guests: 3, status: "cancelled", paid: "none", address: "East Legon, Accra", choice: "later" },
    ];

    for (const d of demo) {
      const svc = services[d.s];
      const quote = computeQuote(svc, d.guests, DEFAULT_SETTINGS.depositPercent);
      const date = day(d.offset);
      const paid = d.paid === "full" ? quote.total : d.paid === "deposit" ? quote.depositDue : 0;
      const now = Date.now();
      const bookingId = await ctx.db.insert("bookings", {
        reference: makeReference(),
        accessToken: randomCode(24),
        serviceId: serviceIds[d.s],
        serviceName: svc.name,
        customerId: customerIds[d.c],
        date,
        startTime: d.time,
        endTime: addMinutesToTime(d.time, svc.durationMinutes),
        startAt: toEpoch(date, d.time),
        guests: d.guests,
        address: d.address,
        occasion: d.occasion,
        dietaryNotes: d.dietary,
        status: d.status,
        lineItems: quote.lineItems,
        total: quote.total,
        depositDue: quote.depositDue,
        amountPaid: paid,
        amountRefunded: 0,
        paymentStatus: derivePaymentStatus({ total: quote.total, depositDue: quote.depositDue, paid, refunded: 0 }),
        paymentChoice: d.choice,
        cancellationReason: d.status === "cancelled" ? "Client's plans changed" : undefined,
        createdAt: now,
        updatedAt: now,
      });
      if (paid > 0) {
        await ctx.db.insert("payments", {
          bookingId,
          kind: "charge",
          amount: paid,
          currency: "GHS",
          method: d.method ?? "cash",
          provider: d.method === "card" ? "paystack" : "manual",
          providerRef: d.method === "card" ? `DEMO-${randomCode(8)}` : undefined,
          status: "succeeded",
          paidAt: toEpoch(day(Math.min(d.offset, 0) - 3), "12:00"),
          note: d.method === "card" ? undefined : "Demo payment",
          recordedBy: d.method === "card" ? undefined : "seed",
          createdAt: now,
        });
      }
    }

    await ctx.db.insert("blockedDates", { date: day(20), reason: "Family wedding" });
    return "Seeded 3 services, 5 clients, 7 bookings and a blocked date.";
  },
});
