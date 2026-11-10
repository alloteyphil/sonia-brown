"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import type { FunctionArgs } from "convex/server";
import { api } from "../../../../convex/_generated/api";
import { PageTitle } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/field";
import { toast } from "@/components/ui/toaster";
import { DashboardFormSkeleton } from "@/components/dashboard/skeletons";
import { errorMessage } from "@/lib/utils";

type S = FunctionArgs<typeof api.admin.saveSettings>;

export default function SettingsPage() {
  const data = useQuery(api.admin.getSettingsForOwner);
  if (!data) return <DashboardFormSkeleton />;
  return <SettingsForm initial={data} />;
}

function SettingsForm({ initial }: { initial: S }) {
  const save = useMutation(api.admin.saveSettings);
  const [s, setS] = useState<S>(initial);
  const [busy, setBusy] = useState(false);
  const text = (k: keyof S) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value });
  const toggle = (k: "autoConfirmPaid" | "notifyOnNewBooking" | "sendClientReminders", label: string, hint: string) => (
    <label className="flex items-start gap-3 rounded-xl p-2 hover:bg-cloud">
      <input type="checkbox" className="mt-1 size-4 accent-harbour" checked={s[k]} onChange={(e) => setS({ ...s, [k]: e.target.checked })} />
      <span><span className="block font-semibold">{label}</span><span className="block text-sm text-muted">{hint}</span></span>
    </label>
  );

  return (
    <>
      <PageTitle title="Settings" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="text-2xl">Business info</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Business name" htmlFor="bn"><Input id="bn" value={s.businessName} onChange={text("businessName")} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" htmlFor="ph"><Input id="ph" value={s.phone} onChange={text("phone")} /></Field>
              <Field label="WhatsApp number" htmlFor="wa" hint="With country code, e.g. 233241234567"><Input id="wa" value={s.whatsapp} onChange={text("whatsapp")} /></Field>
              <Field label="Email" htmlFor="em"><Input id="em" type="email" value={s.email} onChange={text("email")} /></Field>
              <Field label="Instagram handle" htmlFor="ig"><Input id="ig" value={s.instagram} onChange={text("instagram")} /></Field>
            </div>
            <Field label="Service area" htmlFor="sa"><Input id="sa" value={s.serviceArea} onChange={text("serviceArea")} /></Field>
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="text-2xl">Payments & policy</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Deposit (%)" htmlFor="dp" hint="Charged when a client chooses to pay a deposit online."><Input id="dp" type="number" min="0" max="100" value={s.depositPercent} onChange={(e) => setS({ ...s, depositPercent: Number(e.target.value) })} /></Field>
            <Field label="Cancellation policy" htmlFor="cp" hint="Shown at checkout and in emails."><Textarea id="cp" rows={5} value={s.cancellationPolicy} onChange={text("cancellationPolicy")} /></Field>
            {toggle("autoConfirmPaid", "Auto-confirm paid bookings", "Bookings with a deposit or full payment are confirmed straight away.")}
          </div>
        </Card>
        <Card className="p-5 sm:p-6 lg:col-span-2">
          <h2 className="text-2xl">Notifications</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {toggle("notifyOnNewBooking", "Email me about new bookings", "Sent as soon as a request or payment comes in.")}
            {toggle("sendClientReminders", "Send clients a reminder", "Two days before a confirmed booking.")}
            <Field label="Send my notifications to" htmlFor="ne" className="sm:col-span-2" hint="Leave blank to use your login email."><Input id="ne" type="email" value={s.notifyOwnerEmail} onChange={text("notifyOwnerEmail")} /></Field>
          </div>
        </Card>
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Button
          size="lg"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await save(s);
              toast.success("Settings saved.");
            } catch (e) {
              toast.error(errorMessage(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy && <Loader2 className="animate-spin" />}Save settings
        </Button>
      </div>
    </>
  );
}
