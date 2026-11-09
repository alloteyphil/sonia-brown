"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useAction, useMutation, useQuery } from "convex/react";
import {
  AlertTriangle, ArrowLeft, CalendarClock, Check, CircleSlash, FileText, Mail, MapPin, MessageCircle, Phone, Plus, RotateCcw, Trash2, UtensilsCrossed, X, Loader2,
} from "lucide-react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import type { BookingDetail } from "@/components/dashboard/types";
import { Button } from "@/components/ui/button";
import { Card, Skeleton, EmptyState } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { StatusBadge, PaymentBadge } from "@/components/ui/status-badge";
import { ALLOWED_TRANSITIONS, type BookingStatus } from "@/lib/domain/status";
import { cedisToPesewas, formatMoney } from "@/lib/domain/money";
import { formatDateLong, formatTime12, todayInAccra, toEpoch } from "@/lib/domain/time";
import { errorMessage, whatsappLink } from "@/lib/utils";
import { format } from "date-fns";

const actionMeta: Record<Exclude<BookingStatus, "pending">, { label: string; icon: React.ComponentType<{ className?: string }>; variant: "primary" | "outline" | "danger" | "secondary" }> = {
  confirmed: { label: "Confirm", icon: Check, variant: "primary" },
  completed: { label: "Mark completed", icon: Check, variant: "primary" },
  declined: { label: "Decline", icon: X, variant: "outline" },
  cancelled: { label: "Cancel booking", icon: CircleSlash, variant: "outline" },
};

const methodLabel: Record<string, string> = { card: "Card", mobile_money: "Mobile money", cash: "Cash", bank_transfer: "Bank transfer", other: "Other" };

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const booking = useQuery(api.dashboard.bookingDetail, { id: id as Id<"bookings"> });
  if (booking === undefined) return <Skeleton className="h-[600px]" />;
  if (booking === null) return <EmptyState title="Booking not found" action={<Button asChild><Link href="/dashboard/bookings">Back to bookings</Link></Button>} />;
  return <Detail b={booking} />;
}

function Detail({ b }: { b: BookingDetail }) {
  const setStatus = useMutation(api.dashboard.setStatus);
  const clearAttention = useMutation(api.dashboard.clearAttention);
  const [reasonFor, setReasonFor] = useState<"declined" | "cancelled" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string>();

  async function changeStatus(status: "confirmed" | "completed" | "declined" | "cancelled", reason?: string) {
    setBusy(status);
    setError(undefined);
    try {
      await setStatus({ id: b._id, status, reason });
      setReasonFor(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(null);
    }
  }

  const transitions = ALLOWED_TRANSITIONS[b.status].filter((s): s is Exclude<BookingStatus, "pending"> => s !== "pending");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address)}`;

  return (
    <>
      <Link href="/dashboard/bookings" className="no-print mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-harbour"><ArrowLeft className="size-4" />Bookings</Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-semibold tracking-wider text-harbour">{b.reference}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{b.customerName}</h1>
          <p className="mt-1 text-muted">{b.serviceName} · {formatDateLong(b.date)} · {formatTime12(b.startTime)}–{formatTime12(b.endTime)}</p>
          <div className="mt-3 flex flex-wrap gap-2"><StatusBadge status={b.status} awaitingPayment={b.awaitingPayment} /><PaymentBadge status={b.paymentStatus} /></div>
        </div>
        <div className="flex flex-wrap gap-2">
          {transitions.map((s) => {
            const m = actionMeta[s];
            return (
              <Button key={s} variant={m.variant} disabled={!!busy} onClick={() => (s === "declined" || s === "cancelled" ? setReasonFor(s) : changeStatus(s))}>
                {busy === s ? <Loader2 className="animate-spin" /> : <m.icon />}{m.label}
              </Button>
            );
          })}
          {(b.status === "pending" || b.status === "confirmed") && <RescheduleDialog b={b} />}
          <Button asChild variant="ghost"><Link href={`/dashboard/bookings/${b._id}/receipt`}><FileText />Receipt</Link></Button>
        </div>
      </div>

      {b.awaitingPayment && (
        <div className="mb-4 rounded-2xl border border-horizon bg-white p-4 text-sm text-muted">The client is on the payment page. This slot is held until {b.holdExpiresAt ? format(new Date(b.holdExpiresAt), "h:mm a") : "soon"}; if they don&apos;t pay, it&apos;s released automatically.</div>
      )}
      {b.needsAttention && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <p className="flex-1 text-sm">{b.needsAttention}</p>
          <Button size="sm" variant="outline" onClick={() => clearAttention({ id: b._id })}>Resolved</Button>
        </div>
      )}
      {error && <p role="alert" className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-ember">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <h2 className="text-2xl">Event</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><dt className="text-sm text-muted">Guests</dt><dd className="font-semibold">{b.guests}</dd></div>
              <div><dt className="text-sm text-muted">Occasion</dt><dd className="font-semibold">{b.occasion || "—"}</dd></div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted">Address</dt>
                <dd className="font-semibold">{b.address}</dd>
                <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-harbour hover:underline"><MapPin className="size-4" />Open in Maps</a>
              </div>
            </dl>
            <div className="mt-5 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-900"><UtensilsCrossed className="size-4" />Allergies & dietary</p>
              <p className="mt-1 whitespace-pre-wrap">{b.dietaryNotes || "None given"}</p>
            </div>
            {b.notes && (<div className="mt-4"><p className="text-sm text-muted">Client notes</p><p className="whitespace-pre-wrap">{b.notes}</p></div>)}
            {b.cancellationReason && (<div className="mt-4"><p className="text-sm text-muted">Reason</p><p>{b.cancellationReason}</p></div>)}
          </Card>

          <PaymentsCard b={b} />
          <NotesCard key={b._id} b={b} />
        </div>

        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <h2 className="text-2xl">Client</h2>
            <p className="mt-3 font-semibold">{b.customerName}</p>
            <div className="mt-4 grid gap-2">
              <Button asChild variant="whatsapp"><a href={whatsappLink(b.customerPhone.replace(/^0/, "233"), `Hi ${b.customerName.split(" ")[0]}, it's Sonia about your booking ${b.reference}.`)}><MessageCircle />WhatsApp</a></Button>
              <Button asChild variant="outline"><a href={`tel:${b.customerPhone.replace(/\s/g, "")}`}><Phone />{b.customerPhone}</a></Button>
              <Button asChild variant="outline"><a href={`mailto:${b.customerEmail}`}><Mail /><span className="truncate">{b.customerEmail}</span></a></Button>
            </div>
          </Card>
          <Card className="p-5 sm:p-6">
            <h2 className="text-2xl">Money</h2>
            <dl className="mt-4 space-y-2 text-[15px]">
              {b.lineItems.map((li) => (
                <div key={li.label} className="flex justify-between gap-4 text-muted"><dt>{li.label}{li.quantity > 1 && ` × ${li.quantity}`}</dt><dd>{formatMoney(li.amount)}</dd></div>
              ))}
              <div className="flex justify-between border-t border-horizon pt-2 font-semibold"><dt>Total</dt><dd>{formatMoney(b.total)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Deposit due</dt><dd>{formatMoney(b.depositDue)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Paid</dt><dd className="text-meadow">{formatMoney(b.amountPaid)}</dd></div>
              {b.amountRefunded > 0 && <div className="flex justify-between"><dt className="text-muted">Refunded</dt><dd className="text-ember">−{formatMoney(b.amountRefunded)}</dd></div>}
              <div className="flex justify-between rounded-xl bg-sky-mist px-3 py-2 font-semibold"><dt>Balance</dt><dd className="font-display text-xl">{formatMoney(b.balance)}</dd></div>
            </dl>
          </Card>
        </div>
      </div>

      <Dialog open={reasonFor !== null} onOpenChange={(o) => !o && setReasonFor(null)}>
        {reasonFor && (
          <ReasonForm
            kind={reasonFor}
            busy={busy === reasonFor}
            paid={b.amountPaid - b.amountRefunded}
            onSubmit={(reason) => changeStatus(reasonFor, reason)}
          />
        )}
      </Dialog>
    </>
  );
}

function ReasonForm({ kind, busy, paid, onSubmit }: { kind: "declined" | "cancelled"; busy: boolean; paid: number; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <DialogContent title={kind === "declined" ? "Decline this request?" : "Cancel this booking?"} description="The client gets an email with your note.">
      <Field label="Note to the client (optional)" htmlFor="reason">
        <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={kind === "declined" ? "I'm already booked for an event that day." : "As discussed on WhatsApp…"} />
      </Field>
      {paid > 0 && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{formatMoney(paid)} has been paid. Record a refund in Payments if you return it.</p>}
      <Button variant="danger" className="mt-5 w-full" disabled={busy} onClick={() => onSubmit(reason.trim())}>
        {busy && <Loader2 className="animate-spin" />}{kind === "declined" ? "Decline request" : "Cancel booking"}
      </Button>
    </DialogContent>
  );
}

function RescheduleDialog({ b }: { b: BookingDetail }) {
  const reschedule = useMutation(api.dashboard.reschedule);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(b.date);
  const [time, setTime] = useState(b.startTime);
  const [override, setOverride] = useState(false);
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}><CalendarClock />Reschedule</Button>
      <DialogContent title="Reschedule" description="The client is emailed the new date.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New date" htmlFor="rd"><Input id="rd" type="date" min={todayInAccra()} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Field label="Start time" htmlFor="rt"><Input id="rt" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} /></Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" className="accent-harbour" checked={override} onChange={(e) => setOverride(e.target.checked)} />Ignore my availability rules for this one</label>
        {err && <p role="alert" className="mt-3 text-sm text-ember">{err}</p>}
        <Button
          className="mt-5 w-full"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setErr(undefined);
            try {
              await reschedule({ id: b._id, date, startTime: time, override });
              setOpen(false);
            } catch (e) {
              setErr(errorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy && <Loader2 className="animate-spin" />}Save new date
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function PaymentsCard({ b }: { b: BookingDetail }) {
  const record = useMutation(api.dashboard.recordPayment);
  const remove = useMutation(api.dashboard.deletePayment);
  const refundOnline = useAction(api.dashboard.refundViaPaystack);
  const [mode, setMode] = useState<"charge" | "refund" | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("mobile_money");
  const [date, setDate] = useState(todayInAccra());
  const [note, setNote] = useState("");
  const [viaPaystack, setViaPaystack] = useState(false);
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);
  const hasOnline = b.payments.some((p) => p.provider === "paystack" && p.status === "succeeded" && p.kind === "charge");

  const openForm = (m: "charge" | "refund") => {
    setMode(m);
    setErr(undefined);
    setNote("");
    setViaPaystack(false);
    setAmount(m === "charge" ? String(b.balance / 100) : "");
    setMethod(m === "charge" ? "mobile_money" : "mobile_money");
  };

  async function save() {
    const value = cedisToPesewas(Number(amount));
    if (!value || value <= 0) return setErr("Enter an amount.");
    setBusy(true);
    setErr(undefined);
    try {
      if (mode === "refund" && viaPaystack) {
        await refundOnline({ id: b._id, amount: value, note: note || undefined });
      } else {
        await record({ id: b._id, kind: mode!, amount: value, method: method as "cash", paidAt: toEpoch(date, "12:00"), note: note || undefined });
      }
      setMode(null);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const rows = b.payments.filter((p) => p.status === "succeeded");
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">Payments</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openForm("charge")}><Plus />Record payment</Button>
          {b.amountPaid - b.amountRefunded > 0 && <Button size="sm" variant="outline" onClick={() => openForm("refund")}><RotateCcw />Refund</Button>}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="mt-4 text-muted">No payments yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-horizon">
          {rows.map((p) => (
            <li key={p._id} className="flex items-center gap-3 py-3">
              <div className="flex-1">
                <p className="font-semibold">{p.kind === "refund" ? "Refund" : "Payment"} · {methodLabel[p.method]}{p.provider === "paystack" && " (Paystack)"}</p>
                <p className="text-sm text-muted">{p.paidAt ? format(new Date(p.paidAt), "d MMM yyyy") : ""}{p.note && ` · ${p.note}`}{p.providerRef && p.provider === "paystack" && ` · ${p.providerRef}`}</p>
              </div>
              <p className={p.kind === "refund" ? "font-semibold text-ember" : "font-semibold text-meadow"}>{p.kind === "refund" ? "−" : "+"}{formatMoney(p.amount)}</p>
              {p.provider === "manual" && (
                <button className="rounded-full p-2 text-muted hover:bg-rose-50 hover:text-ember" aria-label="Delete payment" onClick={() => confirm("Delete this payment record?") && remove({ paymentId: p._id })}><Trash2 className="size-4" /></button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Dialog open={mode !== null} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent title={mode === "refund" ? "Record a refund" : "Record a payment"} description={mode === "refund" ? undefined : `Balance due: ${formatMoney(b.balance)}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Amount (GH₵)" htmlFor="amt"><Input id="amt" type="number" inputMode="decimal" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
            <Field label="Method" htmlFor="m">
              <Select id="m" value={method} onChange={(e) => setMethod(e.target.value)} disabled={viaPaystack}>
                <option value="mobile_money">Mobile money</option><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="card">Card</option><option value="other">Other</option>
              </Select>
            </Field>
            <Field label="Date" htmlFor="pd"><Input id="pd" type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={viaPaystack} /></Field>
            <Field label="Note (optional)" htmlFor="pn"><Input id="pn" value={note} onChange={(e) => setNote(e.target.value)} placeholder="MoMo ref, who paid…" /></Field>
          </div>
          {mode === "refund" && hasOnline && (
            <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" className="accent-harbour" checked={viaPaystack} onChange={(e) => setViaPaystack(e.target.checked)} />Send this refund through Paystack to the original card/MoMo</label>
          )}
          {err && <p role="alert" className="mt-3 text-sm text-ember">{err}</p>}
          <Button className="mt-5 w-full" disabled={busy} onClick={save}>{busy && <Loader2 className="animate-spin" />}Save</Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function NotesCard({ b }: { b: BookingDetail }) {
  const save = useMutation(api.dashboard.updateNotes);
  const [value, setValue] = useState(b.internalNotes ?? "");
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl">Private notes</h2><span className="text-xs text-muted" aria-live="polite">{state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Only you can see these"}</span></div>
      <Textarea
        className="mt-3"
        rows={4}
        aria-label="Private notes"
        value={value}
        placeholder="Menu ideas, shopping list, gate code…"
        onChange={(e) => { setValue(e.target.value); setState("idle"); }}
        onBlur={async () => {
          if (value === (b.internalNotes ?? "")) return;
          setState("saving");
          await save({ id: b._id, internalNotes: value });
          setState("saved");
        }}
      />
    </Card>
  );
}
