import { describe, expect, it } from "vitest";
import { computeDeposit, computeQuote, PricingError } from "../../src/lib/domain/pricing";
import { derivePaymentStatus, canTransition } from "../../src/lib/domain/status";

const dinner = {
  name: "Private Dinner",
  basePrice: 50000, // GH₵500
  pricePerGuest: 25000, // GH₵250
  minGuests: 2,
  maxGuests: 12,
};

describe("computeQuote", () => {
  it("adds base price and per-guest price", () => {
    const q = computeQuote(dinner, 4, 30);
    expect(q.total).toBe(50000 + 4 * 25000);
    expect(q.lineItems).toHaveLength(2);
    expect(q.lineItems[1]).toMatchObject({ quantity: 4, amount: 100000 });
  });

  it("rounds the deposit up to a whole cedi", () => {
    expect(computeDeposit(10050, 30)).toBe(3100); // 30.15 -> 31
    expect(computeDeposit(150000, 30)).toBe(45000);
  });

  it("caps deposit at the total and handles 0 / 100 percent", () => {
    expect(computeDeposit(9999, 100)).toBe(9999);
    expect(computeDeposit(9999, 0)).toBe(0);
  });

  it("rejects guest counts outside the service range", () => {
    expect(() => computeQuote(dinner, 1, 30)).toThrow(PricingError);
    expect(() => computeQuote(dinner, 13, 30)).toThrow(PricingError);
    expect(() => computeQuote(dinner, 2.5, 30)).toThrow(PricingError);
  });

  it("omits zero-value line items", () => {
    const q = computeQuote({ ...dinner, basePrice: 0 }, 2, 30);
    expect(q.lineItems).toHaveLength(1);
  });
});

describe("derivePaymentStatus", () => {
  const base = { total: 100000, depositDue: 30000 };
  it("covers every state", () => {
    expect(derivePaymentStatus({ ...base, paid: 0, refunded: 0 })).toBe("unpaid");
    expect(derivePaymentStatus({ ...base, paid: 10000, refunded: 0 })).toBe("unpaid");
    expect(derivePaymentStatus({ ...base, paid: 30000, refunded: 0 })).toBe("deposit_paid");
    expect(derivePaymentStatus({ ...base, paid: 100000, refunded: 0 })).toBe("paid");
    expect(derivePaymentStatus({ ...base, paid: 100000, refunded: 20000 })).toBe("partially_refunded");
    expect(derivePaymentStatus({ ...base, paid: 30000, refunded: 30000 })).toBe("refunded");
  });
});

describe("status transitions", () => {
  it("only allows the defined lifecycle", () => {
    expect(canTransition("pending", "confirmed")).toBe(true);
    expect(canTransition("confirmed", "completed")).toBe(true);
    expect(canTransition("pending", "completed")).toBe(false);
    expect(canTransition("completed", "cancelled")).toBe(false);
    expect(canTransition("declined", "confirmed")).toBe(false);
  });
});
