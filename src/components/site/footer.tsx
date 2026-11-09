import Link from "next/link";
import { AtSign, Mail, MessageCircle, Phone } from "lucide-react";
import { Wordmark } from "./logo";
import { Year } from "./year";
import { brand } from "@/brand/tokens";
import { whatsappLink } from "@/lib/utils";
import type { BusinessInfo } from "@/brand/content";

export function SiteFooter({ info }: { info: BusinessInfo }) {
  return (
    <footer className="mt-24 bg-night-sky text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark inverted />
          <p className="mt-5 max-w-xs font-display text-2xl leading-snug text-white/90">{brand.tagline}</p>
          <p className="mt-3 text-sm text-white/60">Serving {info.serviceArea}.</p>
        </div>
        <div>
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-sky">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-white/80">
            <li><Link className="hover:text-white" href="/services">Services &amp; menus</Link></li>
            <li><Link className="hover:text-white" href="/about">About Sonia</Link></li>
            <li><Link className="hover:text-white" href="/book">Book a date</Link></li>
            <li><Link className="hover:text-white" href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-sky">Get in touch</h2>
          <ul className="mt-4 space-y-2.5 text-white/80">
            <li><a className="flex items-center gap-2 hover:text-white" href={whatsappLink(info.whatsapp, "Hi Sonia!")}><MessageCircle className="size-4" />WhatsApp</a></li>
            <li><a className="flex items-center gap-2 hover:text-white" href={`tel:${info.phone.replace(/\s/g, "")}`}><Phone className="size-4" />{info.phone}</a></li>
            <li><a className="flex items-center gap-2 hover:text-white" href={`mailto:${info.email}`}><Mail className="size-4" />{info.email}</a></li>
            {info.instagram && (
              <li><a className="flex items-center gap-2 hover:text-white" href={`https://instagram.com/${info.instagram}`}><AtSign className="size-4" />@{info.instagram}</a></li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-white/50 sm:flex-row sm:justify-between sm:px-6">
          <p>© <Year /> Sonia Brown. All rights reserved.</p>
          <Link href="/dashboard" className="hover:text-white/80">Owner login</Link>
        </div>
      </div>
    </footer>
  );
}
