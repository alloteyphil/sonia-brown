import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { derivePaymentStatus } from "../../src/lib/domain/status";

/** Recompute denormalised money fields on a booking from its payment rows. */
export async function recomputeBookingMoney(ctx: MutationCtx, bookingId: Id<"bookings">) {
  const booking = await ctx.db.get(bookingId);
  if (!booking) throw new Error("Booking not found");
  const rows = await ctx.db
    .query("payments")
    .withIndex("by_booking", (q) => q.eq("bookingId", bookingId))
    .collect();
  const ok = rows.filter((r) => r.status === "succeeded");
  const paid = ok.filter((r) => r.kind === "charge").reduce((s, r) => s + r.amount, 0);
  const refunded = ok.filter((r) => r.kind === "refund").reduce((s, r) => s + r.amount, 0);
  const paymentStatus = derivePaymentStatus({
    total: booking.total,
    depositDue: booking.depositDue,
    paid,
    refunded,
  });
  await ctx.db.patch(bookingId, {
    amountPaid: paid,
    amountRefunded: refunded,
    paymentStatus,
    updatedAt: Date.now(),
  });
  return { paid, refunded, paymentStatus };
}
