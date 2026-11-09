import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { container, SectionHeading } from "@/components/site/sections";
import { getBusinessInfo } from "@/lib/server-data";
import { cn, whatsappLink } from "@/lib/utils";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Sonia Brown by WhatsApp, phone or email.",
};

export default async function ContactPage() {
  const info = await getBusinessInfo();
  const rows = [
    { icon: Phone, label: "Call", value: info.phone, href: `tel:${info.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: info.email, href: `mailto:${info.email}` },
    ...(info.instagram ? [{ icon: AtSign, label: "Instagram", value: `@${info.instagram}`, href: `https://instagram.com/${info.instagram}` }] : []),
    { icon: MapPin, label: "Area", value: info.serviceArea, href: undefined },
  ];
  return (
    <section className={cn(container, "pt-12 sm:pt-16")}>
      <div className="enter">
        <SectionHeading as="h1" title="Let's talk food" body="The quickest way to reach me is WhatsApp. I usually reply within a few hours." />
      </div>
      <div className="mt-10 grid items-start gap-x-16 gap-y-10 md:grid-cols-[1.1fr_1fr]">
        <div className="rounded-[var(--radius-card)] bg-night-sky p-8 text-white sm:p-10">
          <h2 className="text-3xl">Chat on WhatsApp</h2>
          <p className="mt-3 max-w-sm text-white/75">Questions about menus, dates or a custom event? Send me a message.</p>
          <Button asChild variant="whatsapp" size="lg" className="mt-8">
            <a href={whatsappLink(info.whatsapp, "Hi Sonia, I'd like to ask about a booking.")}>Message Sonia</a>
          </Button>
          <p className="mt-8 text-sm text-white/65">
            Ready to pick a date? <Link href="/book" className="font-medium text-white underline underline-offset-4">Book online</Link>
          </p>
        </div>
        <ul className="divide-y divide-horizon border-y border-horizon">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-4 py-5">
              <r.icon className="size-[18px] shrink-0 text-muted" strokeWidth={1.5} aria-hidden />
              <p className="w-24 shrink-0 text-sm text-muted">{r.label}</p>
              {r.href ? (
                <a href={r.href} className="font-medium underline-offset-4 transition-colors hover:text-harbour-deep hover:underline">{r.value}</a>
              ) : (
                <p className="font-medium">{r.value}</p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
