/**
 * Pricing. Bookings carry line items so a future menu/packages feature can add
 * lines (e.g. "Tasting menu x 8") without changing how totals are computed.
 */
export type PricedService = {
  name: string;
  basePrice: number; // pesewas
  pricePerGuest: number; // pesewas
  minGuests: number;
  maxGuests: number;
};

export type LineItem = {
  label: string;
  quantity: number;
  unitAmount: number; // pesewas
  amount: number; // pesewas
};

export type Quote = {
  lineItems: LineItem[];
  total: number;
  depositDue: number;
  depositPercent: number;
};

export class PricingError extends Error {}

export function assertGuestCount(service: PricedService, guests: number): void {
  if (!Number.isInteger(guests) || guests < 1) {
    throw new PricingError("Guest count must be a whole number of at least 1.");
  }
  if (guests < service.minGuests) {
    throw new PricingError(`${service.name} needs at least ${service.minGuests} guests.`);
  }
  if (guests > service.maxGuests) {
    throw new PricingError(`${service.name} is for up to ${service.maxGuests} guests.`);
  }
}

/**
 * Deposit is rounded UP to the nearest whole cedi so clients never see odd
 * pesewa amounts, and is never more than the total.
 */
export function computeDeposit(total: number, depositPercent: number): number {
  if (depositPercent <= 0) return 0;
  if (depositPercent >= 100) return total;
  const raw = (total * depositPercent) / 100;
  return Math.min(total, Math.ceil(raw / 100) * 100);
}

export function computeQuote(
  service: PricedService,
  guests: number,
  depositPercent: number,
): Quote {
  assertGuestCount(service, guests);
  const lineItems: LineItem[] = [];
  if (service.basePrice > 0) {
    lineItems.push({
      label: `${service.name} (booking fee)`,
      quantity: 1,
      unitAmount: service.basePrice,
      amount: service.basePrice,
    });
  }
  if (service.pricePerGuest > 0) {
    lineItems.push({
      label: `Per guest`,
      quantity: guests,
      unitAmount: service.pricePerGuest,
      amount: service.pricePerGuest * guests,
    });
  }
  const total = lineItems.reduce((sum, li) => sum + li.amount, 0);
  return { lineItems, total, depositDue: computeDeposit(total, depositPercent), depositPercent };
}
