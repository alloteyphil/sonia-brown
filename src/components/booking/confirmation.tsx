"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { CalendarPlus, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ActionSpinner, Spinner } from "@/components/ui/spinner";
import { formatMoney } from "@/lib/domain/money";
import { formatDateLong, formatTime12 } from "@/lib/domain/time";
import { whatsappLink } from "@/lib/utils";

export function Confirmation({ reference }: { reference: string }) {
  const params = useSearchParams();
  const token = params.get("t") ?? "";
  const cameFromPaystack = params.has("reference") || params.has("trxref");
  const booking = useQuery(api.public.bookingByReference, { reference, token });
  const confirmPayment = useAction(api.bookings.confirmPayment);
  const [verifyDone, setVerifyDone] = useState(false);
  const tried = useRef(false);
  const needsVerify = !!booking && booking.amountPaid === 0 && booking.paymentChoice !== "later" && cameFromPaystack;
  const verifying = needsVerify && !verifyDone;

  // After Paystack redirects back, ask the server to verify with Paystack directly.
  useEffect(() => {
    if (!needsVerify || tried.current) return;
    tried.current = true;
    confirmPayment({ reference, token }).finally(() => setVerifyDone(true));
  }, [needsVerify, confirmPayment, reference, token]);

  if (booking === undefined) {
    return (
      <ActionSpinner
        label={cameFromPaystack ? "Confirming your payment…" : "Loading your booking…"}
        detail={
          cameFromPaystack
            ? "Paystack is verifying the charge. This only takes a moment — keep this page open."
            : "Fetching your confirmation details."
        }
      />
    );
  }
  if (booking === null) {
    return (
      <div className="rounded-[var(--radius-card)] border border-horizon bg-white p-8 text-center">
        <h1 className="text-3xl">We couldn&apos;t find that booking</h1>
        <p className="mt-2 text-muted">Please use the link from your confirmation email, or contact me on WhatsApp.</p>
        <Button asChild className="mt-6"><Link href="/book">Make a booking</Link></Button>
      </div>
    );
  }

  const paidOnline = booking.amountPaid > 0;
  const awaitingOnline = booking.paymentChoice !== "later" && !paidOnline && booking.status === "pending";
  const expired = booking.status === "cancelled" && booking.cancellationReason?.startsWith("Payment not");

  let icon = <CheckCircle2 className="size-10 text-meadow" strokeWidth={1.5} />;
  let title = `You're booked, ${booking.firstName}`;
  let body = "I've emailed your confirmation. I'll be in touch to plan the menu.";
  if (booking.status === "pending" && booking.paymentChoice === "later") {
    icon = <Clock3 className="size-10 text-harbour" strokeWidth={1.5} />;
    title = `Request received, ${booking.firstName}`;
    body = "I'll confirm within 24 hours. You'll get an email, and you can pay in person or by mobile money.";
  } else if (booking.status === "pending" && paidOnline) {
    title = `Payment received, ${booking.firstName}`;
    body = "I'll confirm the details with you shortly.";
  } else if (awaitingOnline) {
    icon = <Spinner className="size-10" label={verifying ? "Confirming payment" : "Waiting for payment"} />;
    title = verifying ? "Confirming your payment…" : "Waiting for your payment";
    body = "This page updates automatically as soon as Paystack confirms. Don't close it yet.";
  } else if (expired) {
    icon = <XCircle className="size-10 text-ember" strokeWidth={1.5} />;
    title = "Payment wasn't completed";
    body = "Your slot hold expired, so the date has been released. You can start again, and it only takes a minute.";
  } else if (booking.status === "declined" || booking.status === "cancelled") {
    icon = <XCircle className="size-10 text-ember" strokeWidth={1.5} />;
    title = booking.status === "declined" ? "I can't take this booking" : "This booking was cancelled";
    body = booking.cancellationReason ?? "Message me on WhatsApp and we'll find another date.";
  }

  const t = encodeURIComponent(token);
  return (
    <div>
      <div className="enter" aria-live="polite">
        <div>{icon}</div>
        <h1 className="mt-4 text-4xl leading-[1.1] sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-md text-lg text-muted">{body}</p>
      </div>

      {/* The booking slip: same card as the sample menus. */}
      <div className="menu-card mt-10 p-7 sm:p-9">
        <div className="flex items-baseline justify-between gap-4 border-b border-horizon pb-4">
          <p className="font-display text-xl">Your booking</p>
          <p className="font-mono text-sm tracking-wider text-night-sky/80">{booking.reference}</p>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-muted">Service</dt><dd className="font-medium">{booking.serviceName}</dd></div>
          <div><dt className="text-sm text-muted">Guests</dt><dd className="font-medium tabular-nums">{booking.guests}</dd></div>
          <div><dt className="text-sm text-muted">Date</dt><dd className="font-medium">{formatDateLong(booking.date)}</dd></div>
          <div><dt className="text-sm text-muted">Time</dt><dd className="font-medium tabular-nums">{formatTime12(booking.startTime)} – {formatTime12(booking.endTime)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-sm text-muted">Address</dt><dd className="font-medium">{booking.address}</dd></div>
        </dl>
        <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-horizon py-4 tabular-nums">
          <div><dt className="text-sm text-muted">Total</dt><dd className="text-xl font-medium">{formatMoney(booking.total)}</dd></div>
          <div><dt className="text-sm text-muted">Paid</dt><dd className="text-xl font-medium text-meadow">{formatMoney(booking.amountPaid)}</dd></div>
          <div><dt className="text-sm text-muted">Balance</dt><dd className="text-xl font-medium">{formatMoney(booking.balance)}</dd></div>
        </dl>
        <div className="mt-6 flex flex-wrap gap-3">
          {!expired && booking.status !== "declined" && booking.status !== "cancelled" && (
            <Button asChild variant="outline">
              <a href={`/api/ics/${booking.reference}?t=${t}`}><CalendarPlus />Add to calendar</a>
            </Button>
          )}
          <Button asChild variant="whatsapp">
            <a href={whatsappLink(booking.whatsapp, `Hi Sonia, about my booking ${booking.reference}`)}>Chat on WhatsApp</a>
          </Button>
          {expired && <Button asChild><Link href="/book">Start again</Link></Button>}
        </div>
      </div>
      <p className="mt-6 text-sm text-muted">{booking.cancellationPolicy}</p>
    </div>
  );
}
