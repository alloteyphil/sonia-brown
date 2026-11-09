import { Badge } from "./card";
import { statusColors, paymentStatusColors } from "@/brand/tokens";
import type { BookingStatus, PaymentStatus } from "@/lib/domain/status";

export function StatusBadge({ status, awaitingPayment }: { status: BookingStatus; awaitingPayment?: boolean }) {
  if (awaitingPayment) return <Badge className="bg-white text-muted ring-horizon">Awaiting payment</Badge>;
  const s = statusColors[status];
  return <Badge className={s.className}>{s.label}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const s = paymentStatusColors[status];
  return <Badge className={s.className}>{s.label}</Badge>;
}
