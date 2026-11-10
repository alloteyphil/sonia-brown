"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { addDays, parse, startOfMonth } from "date-fns";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/card";
import { ActionSpinner, Spinner } from "@/components/ui/spinner";
import { MonthCalendar } from "./month-calendar";
import { bookingDetailsSchema } from "@/lib/domain/validation";
import { computeQuote, PricingError } from "@/lib/domain/pricing";
import { formatMoney } from "@/lib/domain/money";
import { formatDateLong, formatTime12, todayInAccra } from "@/lib/domain/time";
import { cn, errorMessage, whatsappLink } from "@/lib/utils";
import { findSampleMenu } from "@/brand/content";

type Details = z.output<typeof bookingDetailsSchema>;
type DetailsInput = z.input<typeof bookingDetailsSchema>;
type PaymentChoice = "deposit" | "full" | "later";

const STEPS = ["Service", "Date & time", "Your details", "Review & pay"] as const;

export function BookingWizard() {
  const params = useSearchParams();
  const router = useRouter();
  const services = useQuery(api.public.services);
  const info = useQuery(api.public.businessInfo);
  const start = useAction(api.bookings.start);

  const presetSlug = params.get("service");
  // A sample menu can be passed with ?menu=slug ("Start from this menu" on /services).
  const presetMenu = findSampleMenu(params.get("menu"));
  const [step, setStep] = useState(presetSlug ? 1 : 0);
  const [chosenServiceId, setServiceId] = useState<Id<"services"> | null>(null);
  const [date, setDate] = useState<string>();
  const [chosenTime, setTime] = useState<string>();
  const [details, setDetails] = useState<Details>();
  const [payment, setPayment] = useState<PaymentChoice>("deposit");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const today = todayInAccra();
  const [chosenMonth, setMonth] = useState<Date | null>(null);

  // A service can be preselected with ?service=slug (from the services page).
  const serviceId = chosenServiceId ?? services?.find((s) => s.slug === presetSlug)?._id ?? null;
  const service = services?.find((s) => s._id === serviceId);
  const days = useQuery(api.public.availableDays, serviceId ? { serviceId, from: today, days: 120 } : "skip");
  const slots = useQuery(api.public.slots, serviceId && date ? { serviceId, date } : "skip");
  const available = useMemo(() => new Set(days ?? []), [days]);

  // If the chosen time disappears (someone else just booked it), treat it as unselected.
  const time = chosenTime && slots && !slots.some((s) => s.start === chosenTime) ? undefined : chosenTime;

  // Open the calendar on the first month with availability.
  const month =
    chosenMonth ??
    startOfMonth(parse(days && days.length ? days[0] : today, "yyyy-MM-dd", new Date()));

  const form = useForm<DetailsInput, unknown, Details>({
    resolver: zodResolver(bookingDetailsSchema),
    mode: "onTouched",
    defaultValues: { guests: service?.minGuests ?? 2, address: "", occasion: "", dietaryNotes: "", notes: presetMenu ? `I'd like to start from your "${presetMenu.title}" sample menu.` : "", name: "", phone: "", email: "" },
  });

  useEffect(() => {
    if (service) form.setValue("guests", Math.max(service.minGuests, Number(form.getValues("guests")) || service.minGuests));
  }, [service, form]);

  const depositPercent = info?.depositPercent ?? 30;
  const quote = useMemo(() => {
    if (!service || !details) return null;
    try {
      return computeQuote(service, details.guests, depositPercent);
    } catch {
      return null;
    }
  }, [service, details, depositPercent]);

  if (services === undefined) {
    return (
      <div className="space-y-4" role="status" aria-live="polite" aria-busy="true">
        <span className="sr-only">Loading services</span>
        <Skeleton className="h-4 w-40" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      </div>
    );
  }

  const onDetails = form.handleSubmit((values) => {
    if (service) {
      try {
        computeQuote(service, values.guests, depositPercent);
      } catch (e) {
        if (e instanceof PricingError) {
          form.setError("guests", { message: e.message });
          return;
        }
      }
    }
    setDetails(values);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  async function submit() {
    if (!service || !date || !time || !details) return;
    setSubmitting(true);
    setSubmitError(undefined);
    try {
      const res = await start({
        serviceId: service._id,
        date,
        startTime: time,
        guests: details.guests,
        address: details.address,
        occasion: details.occasion || undefined,
        dietaryNotes: details.dietaryNotes || undefined,
        notes: details.notes || undefined,
        name: details.name,
        phone: details.phone,
        email: details.email,
        paymentChoice: payment,
      });
      if (res.kind === "redirect") {
        window.location.href = res.url;
      } else {
        const u = new URL(res.url);
        router.push(u.pathname + u.search);
      }
    } catch (e) {
      const msg = errorMessage(e);
      setSubmitError(msg);
      if (/taken|no longer available|isn't taking/i.test(msg)) {
        setTime(undefined);
      }
      setSubmitting(false);
    }
  }

  const currentStep = service ? step : 0;
  const go = (n: number) => {
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        {/* Progress */}
        <ol className="mb-8 flex gap-2" aria-label="Booking steps">
          {STEPS.map((label, i) => (
            <li key={label} className="flex-1">
              <div className={cn("h-1 rounded-full transition-colors duration-200", i <= currentStep ? "bg-harbour" : "bg-night-sky/10")} />
              <p className={cn("mt-2 hidden text-[13px] sm:block", i === currentStep ? "font-medium text-night-sky" : "text-muted")}>
                {i + 1}. {label}
              </p>
            </li>
          ))}
        </ol>
        <p className="sr-only" aria-live="polite">Step {currentStep + 1} of 4: {STEPS[currentStep]}</p>

        {submitting && (
          <ActionSpinner
            label={payment === "later" ? "Sending your booking request…" : "Opening secure payment…"}
            detail={
              payment === "later"
                ? "I'm locking in your request. You'll get a confirmation on the next screen."
                : "Hold on — Paystack will open so you can pay by card or mobile money."
            }
          />
        )}

        {!submitting && currentStep === 0 && (
          <section>
            <h2 className="text-3xl">What would you like me to cook?</h2>
            <div className="mt-6 grid gap-4">
              {services.length === 0 && <p className="text-muted">No services are open for booking right now.</p>}
              {services.map((s) => (
                <button
                  key={s._id}
                  type="button"
                  onClick={() => {
                    if (s._id !== serviceId) {
                      setDate(undefined);
                      setTime(undefined);
                    }
                    setServiceId(s._id);
                    go(1);
                  }}
                  className={cn(
                    "flex w-full items-start gap-6 rounded-[var(--radius-card)] border bg-white p-5 text-left transition-colors duration-150 hover:border-harbour sm:p-6",
                    serviceId === s._id ? "border-harbour ring-2 ring-sky/50" : "border-horizon",
                  )}
                >
                  <div className="flex-1">
                    <p className="font-display text-2xl">{s.name}</p>
                    <p className="mt-1 text-muted">{s.description}</p>
                    <p className="mt-3 text-sm text-muted">{s.minGuests} to {s.maxGuests} guests, about {s.durationMinutes / 60} hours</p>
                  </div>
                  <div className="text-right text-sm text-muted">
                    From
                    <p className="text-xl font-medium tabular-nums text-night-sky">{formatMoney(s.basePrice + s.pricePerGuest * s.minGuests)}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {!submitting && currentStep === 1 && service && (
          <section>
            <h2 className="text-3xl">Pick a date and time</h2>
            <p className="mt-1 text-muted">Showing dates I&apos;m free for a {service.name.toLowerCase()} ({service.durationMinutes / 60} hours).</p>
            <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_1fr]">
              <div className="rounded-[var(--radius-card)] border border-horizon bg-white p-5">
                <MonthCalendar
                  month={month}
                  onMonthChange={setMonth}
                  available={available}
                  selected={date}
                  onSelect={(d) => {
                    setDate(d);
                    setTime(undefined);
                  }}
                  minMonth={parse(today, "yyyy-MM-dd", new Date())}
                  maxMonth={addDays(parse(today, "yyyy-MM-dd", new Date()), 120)}
                  loading={days === undefined}
                />
                {days && days.length === 0 && (
                  <p className="mt-4 rounded-[10px] bg-raised p-3 text-sm">
                    I&apos;m fully booked for now.{" "}
                    {info && <a className="font-medium text-harbour-deep underline underline-offset-4" href={whatsappLink(info.whatsapp, "Hi Sonia, do you have any dates coming up?")}>Message me on WhatsApp</a>}{" "}
                    and I&apos;ll see what I can do.
                  </p>
                )}
              </div>
              <div className="rounded-[var(--radius-card)] border border-horizon bg-white p-5">
                <p className="font-medium">{date ? formatDateLong(date) : "Choose a date first"}</p>
                {date && slots === undefined && <Skeleton className="mt-4 h-32" />}
                {date && slots && slots.length === 0 && <p className="mt-3 text-sm text-muted">That day just filled up. Try another date.</p>}
                {date && slots && slots.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Start time">
                    {slots.map((s) => (
                      <button
                        key={s.start}
                        type="button"
                        role="radio"
                        aria-checked={time === s.start}
                        onClick={() => setTime(s.start)}
                        className={cn(
                          "h-11 rounded-[10px] border px-3 text-[15px] font-medium tabular-nums transition-colors duration-150",
                          time === s.start ? "border-harbour bg-harbour text-white" : "border-horizon hover:border-harbour",
                        )}
                      >
                        {formatTime12(s.start)}
                      </button>
                    ))}
                  </div>
                )}
                <p className="mt-4 text-[13px] text-muted">Times are start times in Accra (GMT). I arrive about an hour before to set up.</p>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => go(0)}><ArrowLeft />Back</Button>
              <Button onClick={() => go(2)} disabled={!date || !time}>Continue<ArrowRight /></Button>
            </div>
          </section>
        )}

        {!submitting && currentStep === 2 && service && (
          <form onSubmit={onDetails} noValidate>
            <h2 className="text-3xl">Tell me about your event</h2>
            <div className="mt-6 grid gap-5 rounded-[var(--radius-card)] border border-horizon bg-white p-5 sm:grid-cols-2 sm:p-6">
              <Field label={`Number of guests (${service.minGuests}–${service.maxGuests})`} htmlFor="guests" error={form.formState.errors.guests?.message}>
                <Input id="guests" type="number" inputMode="numeric" min={service.minGuests} max={service.maxGuests} aria-invalid={!!form.formState.errors.guests} {...form.register("guests")} />
              </Field>
              <Field label="Occasion (optional)" htmlFor="occasion">
                <Input id="occasion" placeholder="Birthday, anniversary…" {...form.register("occasion")} />
              </Field>
              <Field label="Where should I cook?" htmlFor="address" error={form.formState.errors.address?.message} hint="Full address or a landmark, e.g. House 12, Ringway Estates, Osu" className="sm:col-span-2">
                <Input id="address" autoComplete="street-address" aria-invalid={!!form.formState.errors.address} {...form.register("address")} />
              </Field>
              <Field label="Allergies & dietary needs" htmlFor="dietaryNotes" hint="Nut allergy, vegetarian, no pork… I plan around everything." className="sm:col-span-2">
                <Textarea id="dietaryNotes" rows={3} {...form.register("dietaryNotes")} />
              </Field>
              <Field label="Anything else? (optional)" htmlFor="notes" className="sm:col-span-2">
                <Textarea id="notes" rows={3} placeholder="Favourite dishes, kitchen access, parking…" {...form.register("notes")} />
              </Field>
              <div className="border-t border-horizon pt-5 sm:col-span-2"><p className="font-medium">Your contact details</p></div>
              <Field label="Full name" htmlFor="name" error={form.formState.errors.name?.message} className="sm:col-span-2">
                <Input id="name" autoComplete="name" aria-invalid={!!form.formState.errors.name} {...form.register("name")} />
              </Field>
              <Field label="Phone (WhatsApp if possible)" htmlFor="phone" error={form.formState.errors.phone?.message}>
                <Input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="024 123 4567" aria-invalid={!!form.formState.errors.phone} {...form.register("phone")} />
              </Field>
              <Field label="Email" htmlFor="email" error={form.formState.errors.email?.message}>
                <Input id="email" type="email" autoComplete="email" inputMode="email" aria-invalid={!!form.formState.errors.email} {...form.register("email")} />
              </Field>
            </div>
            <div className="mt-8 flex justify-between">
              <Button type="button" variant="ghost" onClick={() => go(1)}><ArrowLeft />Back</Button>
              <Button type="submit">Review booking<ArrowRight /></Button>
            </div>
          </form>
        )}

        {!submitting && currentStep === 3 && service && date && time && details && quote && (
          <section>
            <h2 className="text-3xl">Review and pay</h2>
            <div className="mt-6 rounded-[var(--radius-card)] border border-horizon bg-white p-5 sm:p-6">
              <table className="w-full text-[15px]">
                <caption className="sr-only">Price breakdown</caption>
                <tbody>
                  {quote.lineItems.map((li) => (
                    <tr key={li.label}>
                      <td className="py-1.5 text-muted">{li.label}{li.quantity > 1 && ` × ${li.quantity} (${formatMoney(li.unitAmount)} each)`}</td>
                      <td className="py-1.5 text-right tabular-nums">{formatMoney(li.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-horizon">
                    <td className="pt-3 font-medium">Total</td>
                    <td className="pt-3 text-right text-2xl font-medium tabular-nums">{formatMoney(quote.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <fieldset className="mt-6">
              <legend className="font-medium">How would you like to pay?</legend>
              <div className="mt-3 grid gap-3">
                {([
                  { v: "deposit", title: `Pay ${depositPercent}% deposit now`, amount: quote.depositDue, body: "Locks in your date instantly. Balance due on the day." },
                  { v: "full", title: "Pay in full now", amount: quote.total, body: "Nothing left to pay on the day." },
                  { v: "later", title: "Pay later / in person", amount: null, body: "Send a request. I'll confirm, then you pay by MoMo, transfer or cash." },
                ] as const).map((o) => (
                  <label
                    key={o.v}
                    className={cn(
                      "flex cursor-pointer items-start gap-4 rounded-[var(--radius-card)] border bg-white p-4 transition-colors duration-150",
                      payment === o.v ? "border-harbour ring-2 ring-sky/50" : "border-horizon hover:border-harbour",
                    )}
                  >
                    <input type="radio" name="payment" value={o.v} checked={payment === o.v} onChange={() => setPayment(o.v)} className="mt-1 size-4 accent-harbour" />
                    <span className="flex-1">
                      <span className="block font-medium">{o.title}</span>
                      <span className="block text-sm text-muted">{o.body}</span>
                    </span>
                    {o.amount !== null && <span className="text-xl font-medium tabular-nums">{formatMoney(o.amount)}</span>}
                  </label>
                ))}
              </div>
            </fieldset>

            {info && <p className="mt-5 text-sm text-muted"><span className="font-medium text-night-sky">Cancellation policy:</span> {info.cancellationPolicy}</p>}

            {submitError && (
              <div role="alert" className="mt-5 rounded-[10px] border border-ember/30 bg-rose-50 p-4 text-sm text-ember">
                {submitError}
                {!time && <Button variant="outline" size="sm" className="ml-3" onClick={() => go(1)}>Pick another time</Button>}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={() => go(2)} disabled={submitting}><ArrowLeft />Back</Button>
              <Button size="lg" onClick={submit} disabled={submitting || !time}>
                {submitting ? <Spinner className="size-4" label="Submitting" /> : payment === "later" ? <Check /> : <Lock />}
                {payment === "later" ? "Send booking request" : `Pay ${formatMoney(payment === "full" ? quote.total : quote.depositDue)} securely`}
              </Button>
            </div>
            {payment !== "later" && (
              <p className="mt-3 text-right text-[13px] text-muted">Card or mobile money via Paystack. Your slot is held for 15 minutes while you pay.</p>
            )}
          </section>
        )}
      </div>

      {/* Summary: a booking slip, set like one of Sonia's menu cards. */}
      <aside className="menu-card h-fit p-7 lg:sticky lg:top-24">
        <p className="font-display text-xl">Your booking</p>
        <dl className="mt-3 divide-y divide-horizon text-[15px]">
          <div className="flex justify-between gap-6 py-3">
            <dt className="text-muted">Service</dt>
            <dd className={cn("text-right", !service && "text-muted")}>{service?.name ?? "Not chosen yet"}</dd>
          </div>
          {presetMenu && (!service || service.slug === presetMenu.service) && (
            <div className="flex justify-between gap-6 py-3">
              <dt className="text-muted">Menu</dt>
              <dd className="text-right">Starting from &ldquo;{presetMenu.title}&rdquo;</dd>
            </div>
          )}
          <div className="flex justify-between gap-6 py-3">
            <dt className="text-muted">When</dt>
            <dd className={cn("text-right", !date && "text-muted")}>{date ? `${formatDateLong(date)}${time ? `, ${formatTime12(time)}` : ""}` : "Not chosen yet"}</dd>
          </div>
          <div className="flex justify-between gap-6 py-3">
            <dt className="text-muted">Guests</dt>
            <dd className={cn("text-right tabular-nums", !details && "text-muted")}>{details ? details.guests : "Not set yet"}</dd>
          </div>
          {quote && (
            <div className="flex items-baseline justify-between gap-6 pt-4">
              <dt className="font-medium">Total</dt>
              <dd className="text-2xl font-medium tabular-nums">{formatMoney(quote.total)}</dd>
            </div>
          )}
        </dl>
        {info && (
          <a
            className="mt-5 inline-block text-sm font-medium text-harbour-deep underline underline-offset-4 transition-colors hover:text-night-sky"
            href={whatsappLink(info.whatsapp, "Hi Sonia, I have a question about booking.")}
          >
            Questions? Chat on WhatsApp
          </a>
        )}
      </aside>
    </div>
  );
}
