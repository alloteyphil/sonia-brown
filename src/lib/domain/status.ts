export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "declined",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = [
  "unpaid",
  "deposit_paid",
  "paid",
  "refunded",
  "partially_refunded",
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** The only status changes allowed anywhere in the system. */
export const ALLOWED_TRANSITIONS: Record<BookingStatus, readonly BookingStatus[]> = {
  pending: ["confirmed", "declined", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  declined: [],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: BookingStatus, to: BookingStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`A ${from} booking can't be moved to ${to}.`);
  }
}

/** Statuses that occupy a slot on Sonia's calendar. */
export function isActive(status: BookingStatus): boolean {
  return status === "pending" || status === "confirmed";
}

/**
 * Derive payment status from money movements.
 * paid = sum of successful charges, refunded = sum of refunds.
 */
export function derivePaymentStatus(args: {
  total: number;
  depositDue: number;
  paid: number;
  refunded: number;
}): PaymentStatus {
  const { total, depositDue, paid, refunded } = args;
  if (refunded > 0) {
    return refunded >= paid ? "refunded" : "partially_refunded";
  }
  if (paid <= 0) return "unpaid";
  if (paid >= total) return "paid";
  if (paid >= depositDue) return "deposit_paid";
  return "unpaid";
}
