"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import {
  addDays, addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, parse, startOfMonth, startOfWeek,
} from "date-fns";
import { Ban, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { PageTitle } from "@/components/dashboard/shell";
import { BookingRow } from "@/components/dashboard/booking-row";
import type { DashBooking } from "@/components/dashboard/types";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, Skeleton } from "@/components/ui/card";
import { formatDateLong, formatTime12, todayInAccra } from "@/lib/domain/time";
import { cn } from "@/lib/utils";

type View = "month" | "week" | "list";

const chip: Record<string, string> = {
  pending: "bg-amber-100 text-amber-900 border-l-amber-500",
  confirmed: "bg-sky-mist text-harbour-deep border-l-harbour",
  completed: "bg-emerald-50 text-emerald-900 border-l-emerald-600",
  cancelled: "bg-slate-100 text-slate-500 border-l-slate-400 line-through",
  declined: "bg-rose-50 text-rose-700 border-l-rose-400 line-through",
};

function BookingChip({ b }: { b: DashBooking }) {
  return (
    <Link
      href={`/dashboard/bookings/${b._id}`}
      className={cn("block truncate rounded-md border-l-[3px] px-1.5 py-0.5 text-[11px] font-semibold sm:text-xs", chip[b.status], b.awaitingPayment && "opacity-60")}
      title={`${b.customerName} · ${b.serviceName}`}
    >
      <span className="hidden sm:inline">{formatTime12(b.startTime).replace(":00", "")} </span>
      {b.customerName.split(" ")[0]}
    </Link>
  );
}

export default function CalendarPage() {
  const today = todayInAccra();
  const [view, setView] = useState<View>("month");
  const [cursor, setCursor] = useState(() => parse(today, "yyyy-MM-dd", new Date()));

  const range = useMemo(() => {
    if (view === "week") {
      const s = startOfWeek(cursor, { weekStartsOn: 1 });
      return { start: s, end: endOfWeek(cursor, { weekStartsOn: 1 }) };
    }
    if (view === "list") return { start: cursor, end: addDays(cursor, 60) };
    return { start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }) };
  }, [cursor, view]);

  const from = format(range.start, "yyyy-MM-dd");
  const to = format(range.end, "yyyy-MM-dd");
  const data = useQuery(api.dashboard.bookingsInRange, { from, to });

  const byDate = useMemo(() => {
    const m = new Map<string, DashBooking[]>();
    for (const b of data?.bookings ?? []) m.set(b.date, [...(m.get(b.date) ?? []), b]);
    return m;
  }, [data]);
  const blocked = useMemo(() => new Map((data?.blockedDates ?? []).map((b) => [b.date, b.reason])), [data]);
  const days = eachDayOfInterval(range);

  const step = (dir: 1 | -1) =>
    setCursor((c) => (view === "month" ? addMonths(c, dir) : view === "week" ? addWeeks(c, dir) : addDays(c, 60 * dir)));
  const label =
    view === "month" ? format(cursor, "MMMM yyyy") : view === "week" ? `${format(range.start, "d MMM")} – ${format(range.end, "d MMM yyyy")}` : `From ${format(cursor, "d MMM yyyy")}`;

  return (
    <>
      <PageTitle title="Calendar" subtitle="See which days you're booked at a glance." />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={() => step(-1)} aria-label="Previous"><ChevronLeft /></Button>
          <Button variant="outline" size="icon" onClick={() => step(1)} aria-label="Next"><ChevronRight /></Button>
          <Button variant="ghost" size="sm" onClick={() => setCursor(parse(today, "yyyy-MM-dd", new Date()))}>Today</Button>
          <p className="ml-2 font-display text-xl" aria-live="polite">{label}</p>
        </div>
        <div className="flex rounded-full bg-white p-1 ring-1 ring-horizon" role="tablist" aria-label="Calendar view">
          {(["month", "week", "list"] as const).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)} className={cn("rounded-full px-4 py-1.5 text-sm font-semibold capitalize", view === v ? "bg-harbour text-white" : "text-night-sky/70")}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted">
        {[["Confirmed", "bg-harbour"], ["Pending", "bg-amber-500"], ["Completed", "bg-emerald-600"], ["Free day", "bg-white ring-1 ring-horizon"], ["Blocked", "bg-slate-300"]].map(([l, c]) => (
          <span key={l} className="flex items-center gap-1.5"><span className={cn("size-3 rounded-sm", c)} />{l}</span>
        ))}
      </div>

      {!data ? (
        <Skeleton className="h-[520px]" />
      ) : view === "list" ? (
        data.bookings.length === 0 ? (
          <EmptyState title="Nothing in the next 60 days" body="New bookings show up here in real time." />
        ) : (
          <div className="space-y-4">
            {[...byDate.entries()].map(([date, list]) => (
              <Card key={date}>
                <p className="border-b border-horizon px-5 py-3 font-semibold">{formatDateLong(date)}</p>
                <div className="divide-y divide-horizon">{list.map((b) => <BookingRow key={b._id} b={b} />)}</div>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card className="overflow-hidden">
          {view === "month" && (
            <div className="grid grid-cols-7 border-b border-horizon bg-cloud text-center text-xs font-semibold uppercase text-muted">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-2">{d}</div>)}
            </div>
          )}
          <div className={cn("grid", view === "month" ? "grid-cols-7" : "grid-cols-1 sm:grid-cols-7")}>
            {days.map((d) => {
              const key = format(d, "yyyy-MM-dd");
              const list = byDate.get(key) ?? [];
              const active = list.filter((b) => b.status === "pending" || b.status === "confirmed" || b.status === "completed");
              const isBlocked = blocked.has(key);
              const out = view === "month" && !isSameMonth(d, cursor);
              return (
                <div
                  key={key}
                  className={cn(
                    "border-b border-r border-horizon p-1.5 sm:p-2",
                    view === "month" ? "min-h-20 sm:min-h-28" : "min-h-24 sm:min-h-72",
                    out && "bg-cloud/60 text-night-sky/35",
                    isBlocked && "bg-[repeating-linear-gradient(135deg,#eef2f6,#eef2f6_6px,#e2e8f0_6px,#e2e8f0_12px)]",
                    active.length > 0 && !out && "bg-sky-mist/30",
                  )}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <span className={cn("flex size-7 items-center justify-center rounded-full text-sm font-semibold", key === today && "bg-sunlight text-night-sky")}>
                      {view === "week" ? format(d, "EEE d") : format(d, "d")}
                    </span>
                    {isBlocked && <Ban className="size-3.5 text-slate-500" aria-label={`Blocked: ${blocked.get(key) ?? ""}`} />}
                  </div>
                  <div className="space-y-1">{list.map((b) => <BookingChip key={b._id} b={b} />)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </>
  );
}
