"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { AlertTriangle, CalendarCheck, Inbox, TrendingUp, Wallet } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { PageTitle } from "@/components/dashboard/shell";
import { BookingRow } from "@/components/dashboard/booking-row";
import { Card, EmptyState } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardPanelSkeleton } from "@/components/dashboard/skeletons";
import { formatMoney } from "@/lib/domain/money";
import { formatDateLong, todayInAccra } from "@/lib/domain/time";

function Stat({ label, value, icon: Icon, href }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; href?: string }) {
  const inner = (
    <Card className="p-5 transition hover:border-sky">
      <div className="flex items-center justify-between"><p className="text-sm text-muted">{label}</p><Icon className="size-5 text-harbour" /></div>
      <p className="mt-2 font-display text-3xl">{value}</p>
    </Card>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function OverviewPage() {
  const data = useQuery(api.dashboard.overview);
  if (!data) return <DashboardPanelSkeleton />;
  const { stats } = data;
  return (
    <>
      <PageTitle title="Good to see you, Sonia" subtitle={formatDateLong(todayInAccra())} actions={<Button asChild variant="outline"><Link href="/dashboard/calendar">Open calendar</Link></Button>} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue this month" value={formatMoney(stats.revenueThisMonth)} icon={TrendingUp} />
        <Stat label="Outstanding balances" value={formatMoney(stats.outstanding)} icon={Wallet} href="/dashboard/bookings?payment=open" />
        <Stat label="Upcoming bookings" value={String(stats.upcomingCount)} icon={CalendarCheck} href="/dashboard/calendar" />
        <Stat label="Requests to review" value={String(stats.pendingCount)} icon={Inbox} href="/dashboard/bookings?status=pending" />
      </div>

      {data.attention.length > 0 && (
        <Card className="mt-6 border-amber-300 bg-amber-50">
          <div className="flex items-center gap-2 px-5 pt-4 font-semibold text-amber-900"><AlertTriangle className="size-5" />Needs your attention</div>
          <div className="divide-y divide-amber-200">{data.attention.map((b) => <BookingRow key={b._id} b={b} />)}</div>
        </Card>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-2xl">Requests to review</h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-sm font-semibold text-amber-900">{data.pendingRequests.length}</span>
          </div>
          <div className="mt-3 divide-y divide-horizon">
            {data.pendingRequests.length === 0 ? (
              <p className="px-5 pb-6 pt-2 text-muted">You&apos;re all caught up. New requests appear here instantly.</p>
            ) : (
              data.pendingRequests.map((b) => <BookingRow key={b._id} b={b} showBalance={false} />)
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between px-5 pt-5">
            <h2 className="text-2xl">Today</h2>
          </div>
          <div className="mt-3 divide-y divide-horizon">
            {data.today.length === 0 ? <p className="px-5 pb-6 pt-2 text-muted">Nothing booked today.</p> : data.today.map((b) => <BookingRow key={b._id} b={b} />)}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-2xl">Next 7 days</h2>
          <Link href="/dashboard/bookings" className="text-sm font-semibold text-harbour hover:underline">All bookings</Link>
        </div>
        <div className="mt-3 divide-y divide-horizon">
          {data.thisWeek.length === 0 ? (
            <div className="p-5"><EmptyState title="A quiet week" body="No bookings in the next 7 days yet. Share your booking link on Instagram and WhatsApp." /></div>
          ) : (
            data.thisWeek.map((b) => <BookingRow key={b._id} b={b} />)
          )}
        </div>
      </Card>
    </>
  );
}
