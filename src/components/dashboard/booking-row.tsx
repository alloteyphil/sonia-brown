import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { DashBooking } from "./types";
import { StatusBadge, PaymentBadge } from "@/components/ui/status-badge";
import { formatDateShort, formatTime12 } from "@/lib/domain/time";
import { formatMoney } from "@/lib/domain/money";

export function BookingRow({ b, showBalance = true }: { b: DashBooking; showBalance?: boolean }) {
  return (
    <Link href={`/dashboard/bookings/${b._id}`} className="flex items-center gap-4 px-4 py-3.5 hover:bg-cloud sm:px-5">
      <div className="w-14 shrink-0 rounded-xl bg-sky-mist py-1.5 text-center">
        <p className="text-[11px] font-semibold uppercase text-harbour">{formatDateShort(b.date).split(" ")[0]}</p>
        <p className="font-display text-xl leading-none">{b.date.slice(8)}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{b.customerName}</p>
        <p className="truncate text-sm text-muted">{b.serviceName} · {b.guests} guests · {formatTime12(b.startTime)}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <StatusBadge status={b.status} awaitingPayment={b.awaitingPayment} />
          <PaymentBadge status={b.paymentStatus} />
        </div>
      </div>
      {showBalance && (
        <div className="hidden text-right sm:block">
          <p className="text-xs text-muted">Balance</p>
          <p className="font-semibold">{formatMoney(b.balance)}</p>
        </div>
      )}
      <ChevronRight className="size-5 shrink-0 text-muted" />
    </Link>
  );
}
