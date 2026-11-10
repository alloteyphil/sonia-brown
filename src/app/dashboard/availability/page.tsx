"use client";
import { useState } from "react";
import type { FunctionReturnType } from "convex/server";
import { useMutation, useQuery } from "convex/react";
import { Ban, Loader2, Trash2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { PageTitle } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { DashboardFormSkeleton } from "@/components/dashboard/skeletons";
import { formatDateLong, todayInAccra } from "@/lib/domain/time";
import { toast } from "@/components/ui/toaster";
import { errorMessage } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
type Rule = { weekday: number; enabled: boolean; start: string; end: string };

type AvailabilityData = NonNullable<FunctionReturnType<typeof api.admin.getAvailability>>;

export default function AvailabilityPage() {
  const data = useQuery(api.admin.getAvailability);
  if (!data) return <DashboardFormSkeleton />;
  return <AvailabilityForm data={data} />;
}

function AvailabilityForm({ data }: { data: AvailabilityData }) {
  const save = useMutation(api.admin.saveAvailability);
  const block = useMutation(api.admin.blockDate);
  const unblock = useMutation(api.admin.unblockDate);
  const [rules, setRules] = useState<Rule[]>(data.rules);
  const [nums, setNums] = useState({
    leadTimeHours: String(data.leadTimeHours),
    maxBookingsPerDay: String(data.maxBookingsPerDay),
    bufferMinutes: String(data.bufferMinutes),
    slotIntervalMinutes: String(data.slotIntervalMinutes),
    maxAdvanceDays: String(data.maxAdvanceDays),
  });
  const [blockDate, setBlockDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [blocking, setBlocking] = useState(false);


  const order = [1, 2, 3, 4, 5, 6, 0];
  const upd = (wd: number, patch: Partial<Rule>) => setRules((rs) => rs.map((r) => (r.weekday === wd ? { ...r, ...patch } : r)));

  async function submit() {
    setBusy(true);
    try {
      await save({
        rules,
        leadTimeHours: Number(nums.leadTimeHours),
        maxBookingsPerDay: Number(nums.maxBookingsPerDay),
        bufferMinutes: Number(nums.bufferMinutes),
        slotIntervalMinutes: Number(nums.slotIntervalMinutes),
        maxAdvanceDays: Number(nums.maxAdvanceDays),
      });
      toast.success("Saved. The booking calendar has updated.");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="Availability" subtitle="When clients can book you. Changes show on the site instantly." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <h2 className="text-2xl">Working hours</h2>
            <p className="mt-1 text-sm text-muted">The end time is the latest a booking can finish.</p>
            <ul className="mt-4 divide-y divide-horizon">
              {order.map((wd) => {
                const r = rules.find((x) => x.weekday === wd);
                if (!r) return null;
                return (
                  <li key={wd} className="flex flex-wrap items-center gap-3 py-3">
                    <label className="flex w-36 items-center gap-2 font-semibold">
                      <input type="checkbox" className="size-4 accent-harbour" checked={r.enabled} onChange={(e) => upd(wd, { enabled: e.target.checked })} />
                      {DAYS[wd]}
                    </label>
                    {r.enabled ? (
                      <div className="flex items-center gap-2">
                        <Input aria-label={`${DAYS[wd]} start`} type="time" className="w-32" value={r.start} onChange={(e) => upd(wd, { start: e.target.value })} />
                        <span className="text-muted">to</span>
                        <Input aria-label={`${DAYS[wd]} end`} type="time" className="w-32" value={r.end} onChange={(e) => upd(wd, { end: e.target.value })} />
                      </div>
                    ) : <span className="text-sm text-muted">Not working</span>}
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card className="p-5 sm:p-6">
            <h2 className="text-2xl">Booking rules</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Minimum notice (hours)" htmlFor="lead" hint="e.g. 48 = no bookings within 2 days"><Input id="lead" type="number" min="0" value={nums.leadTimeHours} onChange={(e) => setNums({ ...nums, leadTimeHours: e.target.value })} /></Field>
              <Field label="Max bookings per day" htmlFor="max"><Input id="max" type="number" min="1" value={nums.maxBookingsPerDay} onChange={(e) => setNums({ ...nums, maxBookingsPerDay: e.target.value })} /></Field>
              <Field label="Gap between bookings (min)" htmlFor="buf" hint="Travel, shopping and rest"><Input id="buf" type="number" min="0" step="15" value={nums.bufferMinutes} onChange={(e) => setNums({ ...nums, bufferMinutes: e.target.value })} /></Field>
              <Field label="Start times every (min)" htmlFor="int"><Input id="int" type="number" min="15" step="15" value={nums.slotIntervalMinutes} onChange={(e) => setNums({ ...nums, slotIntervalMinutes: e.target.value })} /></Field>
              <Field label="Book up to (days ahead)" htmlFor="adv"><Input id="adv" type="number" min="7" value={nums.maxAdvanceDays} onChange={(e) => setNums({ ...nums, maxAdvanceDays: e.target.value })} /></Field>
            </div>
          </Card>
          <div className="flex items-center gap-4">
            <Button size="lg" onClick={submit} disabled={busy}>{busy && <Loader2 className="animate-spin" />}Save availability</Button>
          </div>
        </div>

        <Card className="h-fit p-5 sm:p-6">
          <h2 className="text-2xl">Blocked dates</h2>
          <p className="mt-1 text-sm text-muted">Holidays, personal days or private events.</p>
          <form
            className="mt-4 grid gap-3"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!blockDate) return;
              setBlocking(true);
              try {
                await block({ date: blockDate, reason: blockReason || undefined });
                toast.success(`${formatDateLong(blockDate)} is blocked.`);
                setBlockDate("");
                setBlockReason("");
              } catch (err) {
                toast.error(errorMessage(err));
              } finally {
                setBlocking(false);
              }
            }}
          >
            <Field label="Date" htmlFor="bd"><Input id="bd" type="date" min={todayInAccra()} value={blockDate} onChange={(e) => setBlockDate(e.target.value)} required /></Field>
            <Field label="Reason (private)" htmlFor="br"><Input id="br" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Family wedding" /></Field>
            <Button type="submit" variant="dark" disabled={blocking}>{blocking ? <Loader2 className="animate-spin" /> : <Ban />}Block date</Button>
          </form>
          <ul className="mt-5 divide-y divide-horizon">
            {data.blocked.filter((b) => b.date >= todayInAccra()).length === 0 && <li className="py-3 text-sm text-muted">No upcoming blocked dates.</li>}
            {data.blocked.filter((b) => b.date >= todayInAccra()).map((b) => (
              <li key={b._id} className="flex items-center justify-between gap-3 py-3">
                <div><p className="font-semibold">{formatDateLong(b.date)}</p>{b.reason && <p className="text-sm text-muted">{b.reason}</p>}</div>
                <button aria-label={`Unblock ${b.date}`} className="rounded-full p-2 text-muted hover:bg-rose-50 hover:text-ember" onClick={() => unblock({ id: b._id }).then(() => toast.success(`${formatDateLong(b.date)} is open again.`), (e) => toast.error(errorMessage(e)))}><Trash2 className="size-4" /></button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
