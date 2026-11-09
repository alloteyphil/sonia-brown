import Link from "next/link";
import { Wordmark } from "./logo";
import { Year } from "./year";
import { brand } from "@/brand/tokens";
import { whatsappLink } from "@/lib/utils";
import type { BusinessInfo } from "@/brand/content";

const link = "text-white/75 underline-offset-4 transition-colors hover:text-white hover:underline";

export function SiteFooter({ info }: { info: BusinessInfo }) {
  return (
    <footer className="mt-24 bg-night-sky text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark inverted />
          <p className="mt-6 max-w-xs font-display text-2xl leading-snug">{brand.tagline}</p>
          <p className="mt-3 text-sm text-white/65">Serving {info.serviceArea}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Explore</p>
          <ul className="mt-4 space-y-3">
            <li><Link className={link} href="/services">Services &amp; menus</Link></li>
            <li><Link className={link} href="/about">About Sonia</Link></li>
            <li><Link className={link} href="/book">Book a date</Link></li>
            <li><Link className={link} href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-white">Get in touch</p>
          <ul className="mt-4 space-y-3">
            <li><a className={link} href={whatsappLink(info.whatsapp, "Hi Sonia,")}>WhatsApp</a></li>
            <li><a className={link} href={`tel:${info.phone.replace(/\s/g, "")}`}>{info.phone}</a></li>
            <li><a className={link} href={`mailto:${info.email}`}>{info.email}</a></li>
            {info.instagram && (
              <li><a className={link} href={`https://instagram.com/${info.instagram}`}>@{info.instagram} on Instagram</a></li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 text-sm text-white/65 sm:flex-row sm:justify-between sm:px-8">
          <p>© <Year /> Sonia Brown</p>
          <Link href="/dashboard" className="transition-colors hover:text-white">Owner login</Link>
        </div>
      </div>
    </footer>
  );
}
