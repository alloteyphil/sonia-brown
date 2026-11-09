import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/domain/money";
import { serviceImage, images } from "@/brand/images";
import { faqs, howItWorks, testimonials, type PublicService } from "@/brand/content";
import { cn } from "@/lib/utils";

/** Shared page gutter and width. */
export const container = "mx-auto max-w-6xl px-5 sm:px-8";

export function SectionHeading({
  title,
  body,
  as: Tag = "h2",
  className,
}: {
  title: string;
  body?: string;
  /** Use "h1" when this is the page title. */
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <Tag className={cn("text-balance leading-[1.1] text-night-sky", Tag === "h1" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl")}>
        {title}
      </Tag>
      {body && <p className="mt-4 text-lg text-muted">{body}</p>}
    </div>
  );
}

function hours(mins: number) {
  const h = mins / 60;
  return Number.isInteger(h) ? `${h} hours` : `${h.toFixed(1)} hours`;
}

/** The three services as a price list: photo, what it is, who it's for, from-price. */
export function ServiceList({ services }: { services: PublicService[] }) {
  return (
    <ul className="divide-y divide-horizon border-y border-horizon">
      {services.map((service) => {
        const img = serviceImage(service.slug);
        return (
          <li key={service.slug} className="grid gap-x-8 gap-y-5 py-6 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr_auto] md:items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[10px] bg-raised">
              <Image src={img.src} alt={img.alt} fill sizes="(min-width: 640px) 240px, 100vw" className="object-cover" />
            </div>
            <div>
              <h3 className="text-2xl">{service.name}</h3>
              <p className="mt-2 max-w-xl text-muted">{service.description}</p>
              <p className="mt-3 text-sm text-muted">
                {service.minGuests} to {service.maxGuests} guests, about {hours(service.durationMinutes)}
              </p>
            </div>
            <div className="flex items-end justify-between gap-6 sm:col-start-2 md:col-start-auto md:flex-col md:items-end md:gap-4">
              <p className="text-sm text-muted md:text-right">
                From
                <span className="block text-2xl font-medium tabular-nums text-night-sky">
                  {formatMoney(service.basePrice + service.pricePerGuest * service.minGuests)}
                </span>
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={`/book?service=${service.slug}`} aria-label={`Book a ${service.name.toLowerCase()}`}>
                  Book this
                </Link>
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function HowItWorks() {
  return (
    <ol className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
      {howItWorks.map((s, i) => (
        <li key={s.title} className="border-t border-night-sky/15 pt-5">
          <span className="font-display text-3xl text-harbour" aria-hidden>{i + 1}</span>
          <h3 className="mt-3 text-xl">{s.title}</h3>
          <p className="mt-2 text-muted">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function Gallery() {
  return (
    <div className="mt-10 columns-2 gap-4 md:columns-3 [&>*]:mb-4">
      {images.gallery.map((g) => (
        <div key={g.src} className={`relative overflow-hidden rounded-[10px] bg-raised ${g.tall ? "aspect-[3/4]" : "aspect-square"}`}>
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
    <section className={cn(container, "py-16 sm:py-24")} aria-labelledby="testimonials-title">
      <h2 id="testimonials-title" className="text-3xl leading-[1.1] sm:text-4xl">From people I&apos;ve cooked for</h2>
      <ul className="mt-10 grid gap-x-10 gap-y-8 md:grid-cols-3">
        {testimonials.map((t) => (
          <li key={t.name + t.occasion} className="flex flex-col border-t border-night-sky/15 pt-5">
            <blockquote className="flex-1 font-display text-xl leading-snug">&ldquo;{t.quote}&rdquo;</blockquote>
            <p className="mt-5 font-medium">{t.name}</p>
            <p className="text-sm text-muted">{t.occasion}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Faq() {
  return (
    <div className="divide-y divide-horizon border-y border-horizon">
      {faqs.map((f) => (
        <details key={f.q} className="group [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium">
            {f.q}
            <Plus className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45" strokeWidth={1.5} aria-hidden />
          </summary>
          <p className="max-w-2xl pb-6 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Closing invitation. Sits flush on top of the footer so the page ends in one dark block. */
export function CtaBand() {
  return (
    <section className="-mb-24 mt-24 border-b border-white/10 bg-night-sky text-white">
      <div className={cn(container, "flex flex-col gap-8 py-16 md:flex-row md:items-end md:justify-between")}>
        <div>
          <h2 className="text-4xl leading-[1.05] sm:text-5xl">Let me cook for you</h2>
          <p className="mt-4 max-w-md text-lg text-white/75">Check my calendar and hold your date in under two minutes.</p>
        </div>
        <Button asChild variant="light" size="lg" className="self-start md:self-auto">
          <Link href="/book">Book Sonia</Link>
        </Button>
      </div>
    </section>
  );
}
