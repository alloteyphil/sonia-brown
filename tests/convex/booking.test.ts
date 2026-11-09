// @vitest-environment edge-runtime
import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import schema from "../../convex/schema";
import { api, internal } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const modules = import.meta.glob("../../convex/**/*.ts");

async function setup() {
  const t = convexTest(schema, modules);
  await t.mutation(internal.seed.run, {});
  const services = await t.query(api.public.services, {});
  const dinner = services.find((s) => s.name === "Private Dinner")!;
  const days = await t.query(api.public.availableDays, { serviceId: dinner._id, days: 60 });
  const date = days[3];
  const slots = await t.query(api.public.slots, { serviceId: dinner._id, date });
  return { t, dinner, date, time: slots[0].start };
}

const guest = (overrides: Record<string, unknown> = {}) => ({
  guests: 4,
  address: "12 Test Street, Osu, Accra",
  name: "Test Client",
  phone: "024 123 4567",
  email: "client@example.com",
  paymentChoice: "later" as const,
  ...overrides,
});

beforeEach(() => {
  vi.stubEnv("OWNER_EMAILS", "sonia@example.com");
});

describe("booking flow", () => {
  it("prevents double-booking the same slot", async () => {
    const { t, dinner, date, time } = await setup();
    await t.mutation(internal.bookings.createBooking, { serviceId: dinner._id, date, startTime: time, ...guest() });
    await expect(
      t.mutation(internal.bookings.createBooking, {
        serviceId: dinner._id, date, startTime: time, ...guest({ email: "other@example.com" }),
      }),
    ).rejects.toThrow(/taken|no longer available/);
    const slots = await t.query(api.public.slots, { serviceId: dinner._id, date });
    expect(slots.some((s) => s.start === time)).toBe(false);
  });

  it("prices on the server and rejects bad guest counts", async () => {
    const { t, dinner, date, time } = await setup();
    await expect(
      t.mutation(internal.bookings.createBooking, { serviceId: dinner._id, date, startTime: time, ...guest({ guests: 1 }) }),
    ).rejects.toThrow(/at least 2/);
    const r = await t.mutation(internal.bookings.createBooking, { serviceId: dinner._id, date, startTime: time, ...guest({ paymentChoice: "deposit" }) });
    const b = await t.run((ctx) => ctx.db.get(r.bookingId));
    expect(b!.total).toBe(dinner.basePrice + dinner.pricePerGuest * 4);
    expect(r.chargeAmount).toBe(b!.depositDue);
    expect(b!.holdExpiresAt).toBeGreaterThan(Date.now());
  });

  it("releases an unpaid hold after it expires", async () => {
    const { t, dinner, date, time } = await setup();
    const r = await t.mutation(internal.bookings.createBooking, { serviceId: dinner._id, date, startTime: time, ...guest({ paymentChoice: "deposit" }) });
    await t.run((ctx) => ctx.db.patch(r.bookingId, { holdExpiresAt: Date.now() - 1000 }));
    await t.mutation(internal.bookings.expireHold, { bookingId: r.bookingId });
    const b = await t.run((ctx) => ctx.db.get(r.bookingId));
    expect(b!.status).toBe("cancelled");
    const slots = await t.query(api.public.slots, { serviceId: dinner._id, date });
    expect(slots.some((s) => s.start === time)).toBe(true);
  });

  it("applies a verified charge exactly once and auto-confirms", async () => {
    const { t, dinner, date, time } = await setup();
    const r = await t.mutation(internal.bookings.createBooking, { serviceId: dinner._id, date, startTime: time, ...guest({ paymentChoice: "deposit" }) });
    await t.mutation(internal.bookings.recordInitiatedPayment, { bookingId: r.bookingId, providerRef: "REF-1", amount: r.chargeAmount });
    const charge = { providerRef: "REF-1", amount: r.chargeAmount, currency: "GHS", channel: "mobile_money", paidAt: Date.now() };
    const first = await t.mutation(internal.bookings.applyVerifiedCharge, { ...charge, eventKey: "charge.success:1" });
    const replay = await t.mutation(internal.bookings.applyVerifiedCharge, { ...charge, eventKey: "charge.success:1" });
    const redirect = await t.mutation(internal.bookings.applyVerifiedCharge, charge);
    expect(first.applied).toBe(true);
    expect(replay.applied).toBe(false);
    expect(redirect.applied).toBe(false);
    const b = await t.run((ctx) => ctx.db.get(r.bookingId));
    expect(b!.amountPaid).toBe(r.chargeAmount);
    expect(b!.paymentStatus).toBe("deposit_paid");
    expect(b!.status).toBe("confirmed");
    expect(b!.holdExpiresAt).toBeUndefined();
  });

  it("rejects a charge in the wrong currency", async () => {
    const { t, dinner, date, time } = await setup();
    const r = await t.mutation(internal.bookings.createBooking, { serviceId: dinner._id, date, startTime: time, ...guest({ paymentChoice: "full" }) });
    await t.mutation(internal.bookings.recordInitiatedPayment, { bookingId: r.bookingId, providerRef: "REF-2", amount: r.chargeAmount });
    const res = await t.mutation(internal.bookings.applyVerifiedCharge, { providerRef: "REF-2", amount: r.chargeAmount, currency: "NGN", channel: "card", paidAt: null });
    expect(res.applied).toBe(false);
  });

  it("guest lookup needs the secret token", async () => {
    const { t, dinner, date, time } = await setup();
    const r = await t.mutation(internal.bookings.createBooking, { serviceId: dinner._id, date, startTime: time, ...guest() });
    expect(await t.query(api.public.bookingByReference, { reference: r.reference, token: "wrong" })).toBeNull();
    const ok = await t.query(api.public.bookingByReference, { reference: r.reference, token: r.accessToken });
    expect(ok?.status).toBe("pending");
  });
});

describe("owner dashboard", () => {
  it("blocks anyone who isn't the owner", async () => {
    const { t } = await setup();
    await expect(t.query(api.dashboard.overview, {})).rejects.toThrow(/sign in/);
    await expect(t.withIdentity({ email: "stranger@example.com" }).query(api.dashboard.overview, {})).rejects.toThrow(/isn't allowed/);
  });

  it("lets Sonia confirm a request, record cash and see the balance", async () => {
    const { t, dinner, date, time } = await setup();
    const sonia = t.withIdentity({ email: "sonia@example.com" });
    const r = await t.mutation(internal.bookings.createBooking, { serviceId: dinner._id, date, startTime: time, ...guest() });
    const id = r.bookingId as Id<"bookings">;

    await sonia.mutation(api.dashboard.setStatus, { id, status: "confirmed" });
    await expect(sonia.mutation(api.dashboard.setStatus, { id, status: "declined" })).rejects.toThrow(/can't be moved/);

    await sonia.mutation(api.dashboard.recordPayment, { id, kind: "charge", amount: 50000, method: "cash", paidAt: Date.now() });
    const d = await sonia.query(api.dashboard.bookingDetail, { id });
    expect(d!.status).toBe("confirmed");
    expect(d!.amountPaid).toBe(50000);
    expect(d!.balance).toBe(d!.total - 50000);
    expect(d!.payments[0].recordedBy).toBe("sonia@example.com");

    const overview = await sonia.query(api.dashboard.overview, {});
    expect(overview.stats.upcomingCount).toBeGreaterThan(0);
  });

  it("blocked dates disappear from the public calendar", async () => {
    const { t, dinner, date } = await setup();
    const sonia = t.withIdentity({ email: "sonia@example.com" });
    await sonia.mutation(api.admin.blockDate, { date });
    const days = await t.query(api.public.availableDays, { serviceId: dinner._id, days: 60 });
    expect(days).not.toContain(date);
  });
});
