"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Archive, ArchiveRestore, Loader2, Pencil, Plus } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";
import { PageTitle } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Badge, Card, EmptyState } from "@/components/ui/card";
import { DashboardTableSkeleton } from "@/components/dashboard/skeletons";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Field, Input, Textarea } from "@/components/ui/field";
import { cedisToPesewas, formatMoney } from "@/lib/domain/money";
import { toast } from "@/components/ui/toaster";
import { errorMessage } from "@/lib/utils";

type Form = { id?: Id<"services">; name: string; description: string; basePrice: string; pricePerGuest: string; minGuests: string; maxGuests: string; hours: string; sortOrder: string };
const empty: Form = { name: "", description: "", basePrice: "0", pricePerGuest: "0", minGuests: "1", maxGuests: "10", hours: "4", sortOrder: "10" };

function toForm(s: Doc<"services">): Form {
  return { id: s._id, name: s.name, description: s.description, basePrice: String(s.basePrice / 100), pricePerGuest: String(s.pricePerGuest / 100), minGuests: String(s.minGuests), maxGuests: String(s.maxGuests), hours: String(s.durationMinutes / 60), sortOrder: String(s.sortOrder) };
}

export default function ServicesAdminPage() {
  const services = useQuery(api.admin.listServices);
  const save = useMutation(api.admin.saveService);
  const archive = useMutation(api.admin.setServiceArchived);
  const [form, setForm] = useState<Form | null>(null);
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => f && { ...f, [k]: e.target.value });

  async function submit() {
    if (!form) return;
    setBusy(true);
    setErr(undefined);
    try {
      await save({
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim(),
        basePrice: cedisToPesewas(Number(form.basePrice)),
        pricePerGuest: cedisToPesewas(Number(form.pricePerGuest)),
        minGuests: Number(form.minGuests),
        maxGuests: Number(form.maxGuests),
        durationMinutes: Math.round(Number(form.hours) * 60),
        sortOrder: Number(form.sortOrder),
      });
      toast.success(form.id ? `${form.name.trim()} updated.` : `${form.name.trim()} added.`);
      setForm(null);
    } catch (e) {
      setErr(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageTitle title="Services & pricing" subtitle="What clients can book, and what it costs." actions={<Button onClick={() => { setErr(undefined); setForm({ ...empty }); }}><Plus />New service</Button>} />
      {!services ? <DashboardTableSkeleton rows={4} /> : services.length === 0 ? (
        <EmptyState title="No services yet" body="Add your first service so clients can book." action={<Button onClick={() => setForm({ ...empty })}><Plus />New service</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((s) => (
            <Card key={s._id} className={s.archived ? "p-5 opacity-60" : "p-5"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl">{s.name}</h2>
                  {s.archived && <Badge className="mt-1 bg-slate-100 text-slate-600 ring-slate-300">Archived</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" aria-label={`Edit ${s.name}`} onClick={() => { setErr(undefined); setForm(toForm(s)); }}><Pencil /></Button>
                  <Button size="icon" variant="ghost" aria-label={s.archived ? `Restore ${s.name}` : `Archive ${s.name}`} onClick={() => archive({ id: s._id, archived: !s.archived }).then(() => toast.success(s.archived ? `${s.name} is bookable again.` : `${s.name} archived.`), (e) => toast.error(errorMessage(e)))}>{s.archived ? <ArchiveRestore /> : <Archive />}</Button>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted">{s.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div><dt className="text-muted">Booking fee</dt><dd className="font-semibold">{formatMoney(s.basePrice)}</dd></div>
                <div><dt className="text-muted">Per guest</dt><dd className="font-semibold">{formatMoney(s.pricePerGuest)}</dd></div>
                <div><dt className="text-muted">Guests</dt><dd className="font-semibold">{s.minGuests}–{s.maxGuests}</dd></div>
                <div><dt className="text-muted">Duration</dt><dd className="font-semibold">{s.durationMinutes / 60}h</dd></div>
              </dl>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={form !== null} onOpenChange={(o) => !o && setForm(null)}>
        {form && (
          <DialogContent title={form.id ? "Edit service" : "New service"} description="Changes apply to new bookings. Existing bookings keep their price.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" htmlFor="sn" className="sm:col-span-2"><Input id="sn" value={form.name} onChange={set("name")} /></Field>
              <Field label="Description" htmlFor="sd" className="sm:col-span-2"><Textarea id="sd" rows={3} value={form.description} onChange={set("description")} /></Field>
              <Field label="Booking fee (GH₵)" htmlFor="sb"><Input id="sb" type="number" min="0" inputMode="decimal" value={form.basePrice} onChange={set("basePrice")} /></Field>
              <Field label="Price per guest (GH₵)" htmlFor="sp"><Input id="sp" type="number" min="0" inputMode="decimal" value={form.pricePerGuest} onChange={set("pricePerGuest")} /></Field>
              <Field label="Min guests" htmlFor="smin"><Input id="smin" type="number" min="1" value={form.minGuests} onChange={set("minGuests")} /></Field>
              <Field label="Max guests" htmlFor="smax"><Input id="smax" type="number" min="1" value={form.maxGuests} onChange={set("maxGuests")} /></Field>
              <Field label="Duration (hours)" htmlFor="sh" hint="How long you're at the client's, including setup and cleanup."><Input id="sh" type="number" min="0.5" step="0.5" value={form.hours} onChange={set("hours")} /></Field>
              <Field label="Display order" htmlFor="so"><Input id="so" type="number" value={form.sortOrder} onChange={set("sortOrder")} /></Field>
            </div>
            {err && <p role="alert" className="mt-3 text-sm text-ember">{err}</p>}
            <Button className="mt-5 w-full" disabled={busy} onClick={submit}>{busy && <Loader2 className="animate-spin" />}Save service</Button>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
