"use client";
import { use } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { format } from "date-fns";
import { ArrowLeft, Printer } from "lucide-react";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/card";
import { Wordmark } from "@/components/site/logo";
import { formatMoney } from "@/lib/domain/money";
import { formatDateLong, formatTime12 } from "@/lib/domain/time";
import { paymentStatusColors } from "@/brand/tokens";

const methodLabel: Record<string, string> = { card: "Card", mobile_money: "Mobile money", cash: "Cash", bank_transfer: "Bank transfer", other: "Other" };

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const b = useQuery(api.dashboard.bookingDetail, { id: id as Id<"bookings"> });
  if (!b) return <Skeleton className="h-[700px]" />;
  const isPaid = b.balance === 0;
  const rows = b.payments.filter((p) => p.status === "succeeded");
  return (
    <>
      <div className="no-print mb-4 flex justify-between">
        <Link href={`/dashboard/bookings/${b._id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-harbour"><ArrowLeft className="size-4" />Back</Link>
        <Button onClick={() => window.print()}><Printer />Print / Save PDF</Button>
      </div>
      <article className="mx-auto max-w-3xl rounded-2xl border border-horizon bg-white p-8 print:border-0 print:p-0 sm:p-12">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b-4 border-sky pb-6">
          <Wordmark />
          <div className="text-right">
            <p className="font-display text-3xl">{isPaid ? "Receipt" : "Invoice"}</p>
            <p className="font-mono text-sm text-harbour">{b.reference}</p>
            <p className="text-sm text-muted">Issued {format(new Date(), "d MMMM yyyy")}</p>
          </div>
        </header>
        <section className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Billed to</p>
            <p className="mt-1 font-semibold">{b.customerName}</p>
            <p className="text-sm">{b.customerPhone}</p>
            <p className="text-sm">{b.customerEmail}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Event</p>
            <p className="mt-1 font-semibold">{b.serviceName} · {b.guests} guests</p>
            <p className="text-sm">{formatDateLong(b.date)}, {formatTime12(b.startTime)}</p>
            <p className="text-sm">{b.address}</p>
          </div>
        </section>
        <table className="mt-8 w-full text-left text-[15px]">
          <thead className="border-b border-horizon text-sm text-muted"><tr><th className="py-2">Item</th><th className="py-2 text-right">Qty</th><th className="py-2 text-right">Unit</th><th className="py-2 text-right">Amount</th></tr></thead>
          <tbody>
            {b.lineItems.map((li) => (
              <tr key={li.label} className="border-b border-horizon/60"><td className="py-2.5">{li.label}</td><td className="py-2.5 text-right">{li.quantity}</td><td className="py-2.5 text-right">{formatMoney(li.unitAmount)}</td><td className="py-2.5 text-right">{formatMoney(li.amount)}</td></tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3} className="pt-4 text-right font-semibold">Total</td><td className="pt-4 text-right font-semibold">{formatMoney(b.total)}</td></tr>
            {rows.map((p) => (
              <tr key={p._id} className="text-sm text-muted"><td colSpan={3} className="pt-1 text-right">{p.kind === "refund" ? "Refund" : "Paid"} · {methodLabel[p.method]} · {p.paidAt ? format(new Date(p.paidAt), "d MMM yyyy") : ""}</td><td className="pt-1 text-right">{p.kind === "refund" ? "+" : "−"}{formatMoney(p.amount)}</td></tr>
            ))}
            <tr><td colSpan={3} className="pt-3 text-right font-display text-xl">Balance due</td><td className="pt-3 text-right font-display text-xl">{formatMoney(b.balance)}</td></tr>
          </tfoot>
        </table>
        <p className="mt-6 inline-block rounded-full bg-sky-mist px-3 py-1 text-sm font-semibold text-harbour-deep">{paymentStatusColors[b.paymentStatus].label}</p>
        <footer className="mt-10 border-t border-horizon pt-6 text-sm text-muted">
          <p>{b.business.name} · {b.business.phone} · {b.business.email} · {b.business.serviceArea}</p>
          <p className="mt-2">{b.business.cancellationPolicy}</p>
          <p className="mt-4 font-display text-lg text-night-sky">Thank you for having me at your table.</p>
        </footer>
      </article>
    </>
  );
}
