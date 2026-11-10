"use client";
import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { ArrowDownUp, Search } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { PageTitle } from "@/components/dashboard/shell";
import { Card, EmptyState } from "@/components/ui/card";
import { DashboardTableSkeleton } from "@/components/dashboard/skeletons";
import { Input, Select } from "@/components/ui/field";
import { StatusBadge, PaymentBadge } from "@/components/ui/status-badge";
import { formatMoney } from "@/lib/domain/money";
import { formatDateShort, formatTime12, todayInAccra } from "@/lib/domain/time";
import { BOOKING_STATUSES, PAYMENT_STATUSES } from "@/lib/domain/status";
import { paymentStatusColors, statusColors } from "@/brand/tokens";
import { BookingRow } from "@/components/dashboard/booking-row";

type SortKey = "date" | "created" | "balance" | "client";

function BookingsList() {
  const params = useSearchParams();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(params.get("status") ?? "all");
  const [payment, setPayment] = useState(params.get("payment") ?? "all");
  const [when, setWhen] = useState<"upcoming" | "past" | "all">("upcoming");
  const [sort, setSort] = useState<SortKey>("date");
  const [desc, setDesc] = useState(false);
  const [showAbandoned, setShowAbandoned] = useState(false);
  const rows = useQuery(api.dashboard.listBookings, { includeAbandoned: showAbandoned });
  const today = todayInAccra();

  const filtered = useMemo(() => {
    if (!rows) return [];
    const term = q.trim().toLowerCase();
    const out = rows.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (payment === "open" ? b.balance === 0 || b.status === "cancelled" || b.status === "declined" : payment !== "all" && b.paymentStatus !== payment) return false;
      if (when === "upcoming" && b.date < today) return false;
      if (when === "past" && b.date >= today) return false;
      if (term && ![b.customerName, b.customerEmail, b.customerPhone, b.reference, b.serviceName, b.address].some((s) => s.toLowerCase().includes(term))) return false;
      return true;
    });
    const dir = desc ? -1 : 1;
    out.sort((a, b) => {
      switch (sort) {
        case "created": return (a.createdAt - b.createdAt) * dir;
        case "balance": return (a.balance - b.balance) * dir;
        case "client": return a.customerName.localeCompare(b.customerName) * dir;
        default: return (a.startAt - b.startAt) * dir;
      }
    });
    return out;
  }, [rows, q, status, payment, when, sort, desc, today]);

  const sortHeader = (key: SortKey, label: string) => (
    <button className="inline-flex items-center gap-1 font-semibold" onClick={() => (sort === key ? setDesc(!desc) : (setSort(key), setDesc(false)))}>
      {label}<ArrowDownUp className={sort === key ? "size-3.5 text-harbour" : "size-3.5 opacity-40"} />
    </button>
  );

  return (
    <>
      <PageTitle title="Bookings" subtitle={rows ? `${filtered.length} of ${rows.length}` : undefined} />
      <Card className="mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <label className="relative sm:col-span-2 lg:col-span-1">
          <span className="sr-only">Search</span>
          <Search className="absolute left-3 top-3.5 size-4 text-muted" />
          <Input className="pl-9" placeholder="Name, phone, reference…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{statusColors[s].label}</option>)}
        </Select>
        <Select aria-label="Payment" value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option value="all">All payments</option>
          <option value="open">Balance outstanding</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{paymentStatusColors[s].label}</option>)}
        </Select>
        <Select aria-label="When" value={when} onChange={(e) => setWhen(e.target.value as typeof when)}>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="all">All dates</option>
        </Select>
        <Select aria-label="Sort" value={`${sort}:${desc ? "desc" : "asc"}`} onChange={(e) => { const [s, d] = e.target.value.split(":"); setSort(s as SortKey); setDesc(d === "desc"); }}>
          <option value="date:asc">Date (soonest)</option>
          <option value="date:desc">Date (latest)</option>
          <option value="created:desc">Newest booked</option>
          <option value="balance:desc">Highest balance</option>
          <option value="client:asc">Client A–Z</option>
        </Select>
        <label className="flex items-center gap-2 text-sm text-muted sm:col-span-2 lg:col-span-5">
          <input type="checkbox" className="accent-harbour" checked={showAbandoned} onChange={(e) => setShowAbandoned(e.target.checked)} />
          Show abandoned online checkouts
        </label>
      </Card>

      {!rows ? (
        <DashboardTableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState title={rows.length === 0 ? "No bookings yet" : "No matches"} body={rows.length === 0 ? "When clients book, they'll appear here instantly." : "Try clearing a filter."} />
      ) : (
        <>
          {/* Mobile list */}
          <Card className="divide-y divide-horizon md:hidden">{filtered.map((b) => <BookingRow key={b._id} b={b} />)}</Card>
          {/* Desktop table */}
          <Card className="hidden overflow-hidden md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-cloud text-night-sky/70">
                <tr>
                  <th className="px-4 py-3">{sortHeader("date", "Date")}</th>
                  <th className="px-4 py-3">{sortHeader("client", "Client")}</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">{sortHeader("balance", "Balance")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-horizon">
                {filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-cloud">
                    <td className="px-4 py-3"><Link href={`/dashboard/bookings/${b._id}`} className="font-semibold hover:text-harbour">{formatDateShort(b.date)}</Link><p className="text-muted">{formatTime12(b.startTime)}</p></td>
                    <td className="px-4 py-3"><Link href={`/dashboard/bookings/${b._id}`} className="font-semibold hover:text-harbour">{b.customerName}</Link><p className="font-mono text-xs text-muted">{b.reference}</p></td>
                    <td className="px-4 py-3">{b.serviceName}<p className="text-muted">{b.guests} guests</p></td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} awaitingPayment={b.awaitingPayment} /></td>
                    <td className="px-4 py-3"><PaymentBadge status={b.paymentStatus} /></td>
                    <td className="px-4 py-3 text-right">{formatMoney(b.total)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatMoney(b.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<DashboardTableSkeleton />}>
      <BookingsList />
    </Suspense>
  );
}
