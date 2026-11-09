import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/domain/money";
import { serviceImage, images } from "@/brand/images";
import { faqs, howItWorks, testimonials, type PublicService } from "@/brand/content";

export function SectionHeading({
  eyebrow,
  title,
  body,
  center,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-harbour">{eyebrow}</p>
      <h2 className="mt-3 text-4xl leading-[1.08] text-night-sky sm:text-5xl">{title}</h2>
      {body && <p className="mt-4 text-lg text-muted">{body}</p>}
    </div>
  );
}

function hours(mins: number) {
  const h = mins / 60;
  return Number.isInteger(h) ? `${h} hours` : `${h.toFixed(1)} hours`;
}

export function ServiceCard({ service }: { service: PublicService }) {
  const img = serviceImage(service.slug);
  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-horizon bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(11,34,57,0.35)]">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={img.src} alt={img.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl">{service.name}</h3>
        <p className="mt-2 flex-1 text-muted">{service.description}</p>
        <dl className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-night-sky/80">
          <div className="flex items-center gap-1.5"><Users className="size-4 text-harbour" /><dt className="sr-only">Guests</dt><dd>{service.minGuests}–{service.maxGuests} guests</dd></div>
          <div className="flex items-center gap-1.5"><Clock className="size-4 text-harbour" /><dt className="sr-only">Duration</dt><dd>About {hours(service.durationMinutes)}</dd></div>
        </dl>
        <div className="mt-5 flex items-end justify-between border-t border-horizon pt-5">
          <p className="text-sm text-muted">
            From <span className="block font-display text-2xl text-night-sky">{formatMoney(service.basePrice + service.pricePerGuest * service.minGuests)}</span>
          </p>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/book?service=${service.slug}`}>Book <ArrowRight /></Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function HowItWorks() {
  return (
    <ol className="mt-12 grid gap-6 md:grid-cols-3">
      {howItWorks.map((s, i) => (
        <li key={s.title} className="relative rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-horizon">
          <span className="flex size-12 items-center justify-center rounded-full bg-sky-mist font-display text-xl text-harbour">{i + 1}</span>
          <h3 className="mt-5 text-2xl">{s.title}</h3>
          <p className="mt-2 text-muted">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function Gallery() {
  return (
    <div className="mt-12 columns-2 gap-4 md:columns-3 [&>*]:mb-4">
      {images.gallery.map((g) => (
        <div key={g.src} className={`relative overflow-hidden rounded-2xl ${g.tall ? "aspect-[3/4]" : "aspect-square"}`}>
          <Image src={g.src} alt={g.alt} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}

/** Client reviews. Renders nothing until real testimonials are added in content.ts. */
export function Testimonials() {
  if (testimonials.length === 0) return null;
  return (
    <section className="bg-sky-mist/60 py-20" aria-labelledby="testimonials-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-harbour">Kind words</p>
          <h2 id="testimonials-title" className="mt-3 text-4xl leading-[1.08] text-night-sky sm:text-5xl">From people I&apos;ve cooked for</h2>
        </div>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <li key={t.name + t.occasion} className="flex flex-col rounded-[var(--radius-card)] bg-white p-7 ring-1 ring-horizon">
              <blockquote className="flex-1 font-display text-xl leading-snug text-night-sky">&ldquo;{t.quote}&rdquo;</blockquote>
              <p className="mt-6 font-semibold">{t.name}</p>
              <p className="text-sm text-muted">{t.occasion}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function Faq() {
  return (
    <div className="mt-10 divide-y divide-horizon rounded-[var(--radius-card)] border border-horizon bg-white">
      {faqs.map((f) => (
        <details key={f.q} className="group p-6 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
            {f.q}
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-mist text-harbour transition group-open:rotate-45" aria-hidden>+</span>
          </summary>
          <p className="mt-3 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand() {
  return (
    <section className="mx-auto mt-24 max-w-6xl px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-harbour px-8 py-14 text-white sm:px-14">
        <svg className="pointer-events-none absolute -bottom-10 left-0 w-full text-sky/40" viewBox="0 0 1200 200" aria-hidden>
          <path d="M0 140 Q300 60 600 120 T1200 100 V200 H0Z" fill="currentColor" />
        </svg>
        <div className="relative max-w-xl">
          <h2 className="text-4xl leading-tight sm:text-5xl">Let me cook for you.</h2>
          <p className="mt-4 text-lg text-white/85">Check my calendar and hold your date in under two minutes.</p>
          <Button asChild variant="dark" size="lg" className="mt-8">
            <Link href="/book">Book Sonia <ArrowRight /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
