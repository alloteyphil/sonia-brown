import type { Metadata } from "next";
import { Suspense } from "react";
import { Confirmation } from "@/components/booking/confirmation";
import { Skeleton } from "@/components/ui/card";

export const metadata: Metadata = { title: "Your booking", robots: { index: false } };

export default async function ConfirmationPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  return (
    <section className="mx-auto max-w-3xl px-5 pt-12 sm:px-8 sm:pt-16">
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Confirmation reference={ref} />
      </Suspense>
    </section>
  );
}
