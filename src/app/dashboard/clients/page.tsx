"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { MessageCircle, Phone, Search } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { PageTitle } from "@/components/dashboard/shell";
import { Card, EmptyState } from "@/components/ui/card";
import { Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { DashboardTableSkeleton } from "@/components/dashboard/skeletons";
import { formatMoney } from "@/lib/domain/money";
import { formatDateShort } from "@/lib/domain/time";
import { whatsappLink } from "@/lib/utils";

export default function ClientsPage() {
  const clients = useQuery(api.admin.listClients);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (clients ?? []).filter((c) => !t || [c.name, c.email, c.phone].some((s) => s.toLowerCase().includes(t)));
  }, [clients, q]);

  return (
    <>
      <PageTitle title="Clients" subtitle={clients ? `${clients.length} people have booked with you` : undefined} />
      <label className="relative mb-4 block max-w-md">
        <span className="sr-only">Search clients</span>
        <Search className="absolute left-3 top-3.5 size-4 text-muted" />
        <Input className="pl-9" placeholder="Search by name, phone or email" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>
      {!clients ? <DashboardTableSkeleton /> : list.length === 0 ? (
        <EmptyState title={clients.length ? "No matches" : "No clients yet"} body="Clients are added automatically when they book." />
      ) : (
        <Card className="divide-y divide-horizon">
          {list.map((c) => (
            <div key={c._id} className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-4">
                <button className="flex flex-1 items-center gap-3 text-left" onClick={() => setOpen(open === c._id ? null : c._id)} aria-expanded={open === c._id}>
                  <span className="flex size-11 items-center justify-center rounded-full bg-sky-mist font-display text-lg text-harbour">{c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
                  <span>
                    <span className="block font-semibold">{c.name}</span>
                    <span className="block text-sm text-muted">{c.bookingCount} booking{c.bookingCount === 1 ? "" : "s"} · {formatMoney(c.totalSpent)} paid{c.lastBooking && ` · last ${formatDateShort(c.lastBooking.date)}`}</span>
                  </span>
                </button>
                <div className="flex gap-2">
                  <a className="rounded-full bg-[#1f8a5a] p-2.5 text-white" aria-label={`WhatsApp ${c.name}`} href={whatsappLink(c.phone.replace(/^0/, "233"))}><MessageCircle className="size-4" /></a>
                  <a className="rounded-full bg-cloud p-2.5 ring-1 ring-horizon" aria-label={`Call ${c.name}`} href={`tel:${c.phone.replace(/\s/g, "")}`}><Phone className="size-4" /></a>
                </div>
              </div>
              {open === c._id && (
                <div className="mt-4 rounded-xl bg-cloud p-4">
                  <p className="text-sm text-muted">{c.phone} · {c.email}</p>
                  <ul className="mt-3 space-y-2">
                    {c.bookings.map((b) => (
                      <li key={b._id}><Link className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 hover:ring-1 hover:ring-sky" href={`/dashboard/bookings/${b._id}`}><span>{formatDateShort(b.date)} · {b.serviceName}</span><StatusBadge status={b.status} /></Link></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
