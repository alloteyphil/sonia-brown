"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAction, useQuery } from "convex/react";
import { CalendarPlus, CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/card";
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

  if (booking === undefined) return <Skeleton className="h-96" />;
  if (booking === null) {
    return (
      <div className="rounded-2xl border border-horizon bg-white p-8 text-center">
        <h1 className="text-3xl">We couldn&apos;t find that booking</h1>
        <p className="mt-2 text-muted">Please use the link from your confirmation email, or contact me on WhatsApp.</p>
        <Button asChild className="mt-6"><Link href="/book">Make a booking</Link></Button>
      </div>
    );
  }

  const paidOnline = booking.amountPaid > 0;
  const awaitingOnline = booking.paymentChoice !== "later" && !paidOnline && booking.status === "pending";
  const expired = booking.status === "cancelled" && booking.cancellationReason?.startsWith("Payment not");

  let icon = <CheckCircle2 className="size-14 text-meadow" />;
  let title = `You're booked, ${booking.firstName}!`;
  let body = "I've emailed your confirmation. I'll be in touch to plan the menu.";
  if (booking.status === "pending" && booking.paymentChoice === "later") {
    icon = <Clock3 className="size-14 text-harbour" />;
    title = `Request received, ${booking.firstName}!`;
    body = "I'll confirm within 24 hours. You'll get an email, and you can pay in person or by mobile money.";
  } else if (booking.status === "pending" && paidOnline) {
    title = `Payment received, ${booking.firstName}!`;
    body = "I'll confirm the details with you shortly.";
  } else if (awaitingOnline) {
    icon = <Loader2 className="size-14 animate-spin text-harbour" />;
    title = verifying ? "Confirming your payment…" : "Waiting for your payment";
    body = "This page updates automatically as soon as Paystack confirms. Don't close it yet.";
  } else if (expired) {
    icon = <XCircle className="size-14 text-ember" />;
    title = "Payment wasn't completed";
    body = "Your slot hold expired, so the date has been released. You can start again, and it only takes a minute.";
  } else if (booking.status === "declined" || booking.status === "cancelled") {
    icon = <XCircle className="size-14 text-ember" />;
    title = booking.status === "declined" ? "I can't take this booking" : "This booking was cancelled";
    body = booking.cancellationReason ?? "Message me on WhatsApp and we'll find another date.";
  }

  const t = encodeURIComponent(token);
  return (
    <div>
      <div className="rounded-[2rem] border border-horizon bg-white p-8 text-center" aria-live="polite">
        <div className="flex justify-center">{icon}</div>
        <h1 className="mt-4 text-4xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-muted">{body}</p>
        <p className="mt-5 inline-block rounded-full bg-sky-mist px-4 py-1.5 font-mono text-sm font-semibold tracking-wider text-harbour-deep">
          {booking.reference}
        </p>
      </div>

      <div className="mt-6 rounded-[2rem] border border-horizon bg-white p-6 sm:p-8">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-muted">Service</dt><dd className="font-semibold">{booking.serviceName}</dd></div>
          <div><dt className="text-sm text-muted">Guests</dt><dd className="font-semibold">{booking.guests}</dd></div>
          <div><dt className="text-sm text-muted">Date</dt><dd className="font-semibold">{formatDateLong(booking.date)}</dd></div>
          <div><dt className="text-sm text-muted">Time</dt><dd className="font-semibold">{formatTime12(booking.startTime)} – {formatTime12(booking.endTime)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-sm text-muted">Address</dt><dd className="font-semibold">{booking.address}</dd></div>
        </dl>
        <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-cloud p-4 text-center">
          <div><p className="text-xs text-muted">Total</p><p className="font-display text-xl">{formatMoney(booking.total)}</p></div>
          <div><p className="text-xs text-muted">Paid</p><p className="font-display text-xl text-meadow">{formatMoney(booking.amountPaid)}</p></div>
          <div><p className="text-xs text-muted">Balance</p><p className="font-display text-xl">{formatMoney(booking.balance)}</p></div>
        </div>
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
      <p className="mt-6 text-center text-sm text-muted">{booking.cancellationPolicy}</p>
    </div>
  );
}
