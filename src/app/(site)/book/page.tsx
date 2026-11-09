import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { Skeleton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBusinessInfo } from "@/lib/server-data";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Book Sonia",
  description: "Check Sonia Brown's availability and book a private dinner, meal prep or event catering in Accra.",
};

export default async function BookPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_CONVEX_URL);
  const info = await getBusinessInfo();
  return (
    <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-harbour">Book Sonia</p>
      <h1 className="mt-2 text-4xl sm:text-5xl">Let&apos;s get your date in the diary</h1>
      <div className="mt-10">
        {configured ? (
          <Suspense fallback={<Skeleton className="h-96" />}>
            <BookingWizard />
          </Suspense>
        ) : (
          <div className="rounded-2xl border border-horizon bg-white p-8">
            <p className="text-lg">Online booking is being set up. In the meantime, message me and I&apos;ll book you in personally.</p>
            <Button asChild variant="whatsapp" className="mt-5">
              <a href={whatsappLink(info.whatsapp, "Hi Sonia, I'd like to book.")}>Book on WhatsApp</a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
