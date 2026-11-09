import type { Metadata } from "next";
import Image from "next/image";
import { images } from "@/brand/images";
import { CtaBand, Gallery, SectionHeading } from "@/components/site/sections";

export const metadata: Metadata = {
  title: "About Sonia",
  description: "Meet Sonia Brown, a private chef in Accra cooking modern Ghanaian and international food in your home.",
};

const values = [
  { title: "Local first", body: "Fresh fish from the coast, produce from Makola and Madina, herbs I grow myself." },
  { title: "Personal menus", body: "No set packages. Every menu starts with a conversation about you and your guests." },
  { title: "Spotless kitchen", body: "I leave your kitchen cleaner than I found it. That's a promise." },
];

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 sm:px-6 md:grid-cols-[1fr_1.1fr]">
        <div className="relative aspect-[5/6] overflow-hidden rounded-t-[999px] rounded-b-[2rem]">
          <Image src={images.sonia.src} alt={images.sonia.alt} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        </div>
        <div>
          <SectionHeading eyebrow="About" title="Hi, I'm Sonia." />
          <div className="mt-6 space-y-4 text-lg text-muted">
            <p>I learned to cook beside my grandmother, measuring by eye and tasting everything. Food was how our family said welcome, congratulations and I&apos;m sorry.</p>
            <p>After years cooking in restaurant and hotel kitchens around Accra, I started cooking privately so I could do what I love most: get to know the people I&apos;m feeding.</p>
            <p>My food is modern Ghanaian with a lot of curiosity: familiar flavours, beautifully plated, with a few surprises. Whether it&apos;s dinner for two or a naming ceremony for sixty, I&apos;ll make it feel effortless for you.</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-[var(--radius-card)] bg-sky-mist/60 p-7">
              <h2 className="text-2xl">{v.title}</h2>
              <p className="mt-2 text-muted">{v.body}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <SectionHeading eyebrow="Gallery" title="From my kitchen" />
        <Gallery />
      </section>
      <CtaBand />
    </>
  );
}
