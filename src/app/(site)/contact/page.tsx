import type { Metadata } from "next";
import Link from "next/link";
import { AtSign, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/sections";
import { getBusinessInfo } from "@/lib/server-data";
import { whatsappLink } from "@/lib/utils";

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
    <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6">
      <SectionHeading eyebrow="Contact" title="Let's talk food" body="The quickest way to reach me is WhatsApp. I usually reply within a few hours." />
      <div className="mt-10 grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[2rem] bg-night-sky p-8 text-white">
          <MessageCircle className="size-10 text-sky" />
          <h2 className="mt-5 text-3xl">Chat on WhatsApp</h2>
          <p className="mt-2 text-white/75">Questions about menus, dates or a custom event? Send me a message.</p>
          <Button asChild variant="whatsapp" size="lg" className="mt-7">
            <a href={whatsappLink(info.whatsapp, "Hi Sonia, I'd like to ask about a booking.")}>Message Sonia</a>
          </Button>
          <p className="mt-8 text-sm text-white/60">Ready to pick a date? <Link href="/book" className="font-semibold text-sky underline">Book online</Link>.</p>
        </div>
        <ul className="divide-y divide-horizon rounded-[2rem] border border-horizon bg-white">
          {rows.map((r) => (
            <li key={r.label} className="flex items-center gap-4 p-6">
              <span className="flex size-11 items-center justify-center rounded-full bg-sky-mist text-harbour"><r.icon className="size-5" /></span>
              <div>
                <p className="text-sm text-muted">{r.label}</p>
                {r.href ? <a href={r.href} className="font-semibold hover:text-harbour">{r.value}</a> : <p className="font-semibold">{r.value}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
