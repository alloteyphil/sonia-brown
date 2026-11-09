import type { Metadata } from "next";
import Image from "next/image";
import { images } from "@/brand/images";
import { container, CtaBand, Gallery, SectionHeading } from "@/components/site/sections";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Sonia",
  description: "Meet Sonia Brown, a private chef in Accra cooking Ghanaian classics, Southern soul food and international dishes in your home.",
};

const values = [
  { title: "Local first", body: "Fresh fish from the coast, produce from Makola and Madina, herbs I grow myself." },
  { title: "Personal menus", body: "No set packages. Every menu starts with a conversation about you and your guests." },
  { title: "Spotless kitchen", body: "I leave your kitchen cleaner than I found it. That's a promise." },
];

export default function AboutPage() {
  const photo = images.sonia ?? images.table;
  return (
    <>
      <section className={cn(container, "grid items-center gap-x-16 gap-y-10 pt-12 sm:pt-16 md:grid-cols-[1.1fr_1fr]")}>
        <div className="enter">
          <h1 className="text-4xl leading-[1.1] sm:text-5xl">Hi, I&apos;m Sonia</h1>
          <div className="mt-6 max-w-xl space-y-4 text-lg text-muted">
            <p>I learned to cook beside my grandmother, measuring by eye and tasting everything. Food was how our family said welcome, congratulations and I&apos;m sorry.</p>
            <p>After years cooking in restaurant and hotel kitchens around Accra, I started cooking privately so I could do what I love most: get to know the people I&apos;m feeding.</p>
            <p>My food is Ghanaian at heart, with a big helping of Southern soul food and a lot of curiosity: familiar flavours, beautifully plated, with a few surprises. Whether it&apos;s dinner for two or a naming ceremony for sixty, I&apos;ll make it feel effortless for you.</p>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-raised">
          <Image src={photo.src} alt={photo.alt} fill preload sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
        </div>
      </section>

      <section className={cn(container, "pt-16 sm:pt-24")}>
        <h2 className="sr-only">How I work</h2>
        <dl className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="border-t border-night-sky/15 pt-5">
              <dt className="font-display text-xl">{v.title}</dt>
              <dd className="mt-2 text-muted">{v.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={cn(container, "pt-16 sm:pt-24")}>
        <SectionHeading title="Food I love to cook" />
        <Gallery />
      </section>
      <CtaBand />
    </>
  );
}
