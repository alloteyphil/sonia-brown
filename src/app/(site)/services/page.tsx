import type { Metadata } from "next";
import { getBusinessInfo, getServices } from "@/lib/server-data";
import { CtaBand, SectionHeading, ServiceCard } from "@/components/site/sections";
import { MenuTabs } from "@/components/site/menu-tabs";
import { sampleMenus } from "@/brand/content";
import { formatMoney } from "@/lib/domain/money";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Services & sample menus",
  description: "Private dinners, weekly meal prep and event catering in Accra. See pricing and sample menus.",
};

export default async function ServicesPage() {
  const [services, info] = await Promise.all([getServices(), getBusinessInfo()]);
  return (
    <>
      <section className="bg-gradient-to-b from-sky-mist to-cloud">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6">
          <SectionHeading
            eyebrow="Services"
            title="Pick the table you're setting"
            body={`Prices include ingredients, cooking, serving and cleanup. A ${info.depositPercent}% deposit holds your date.`}
          />
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {services.map((s) => <ServiceCard key={s.slug} service={s} />)}
        </div>

        <div className="mt-10 overflow-x-auto rounded-[var(--radius-card)] border border-horizon bg-white">
          <table className="w-full min-w-[560px] text-left text-[15px]">
            <caption className="sr-only">Pricing by service</caption>
            <thead className="bg-sky-mist/60 text-sm text-night-sky/80">
              <tr><th className="px-5 py-3 font-semibold">Service</th><th className="px-5 py-3 font-semibold">Booking fee</th><th className="px-5 py-3 font-semibold">Per guest</th><th className="px-5 py-3 font-semibold">Guests</th></tr>
            </thead>
            <tbody className="divide-y divide-horizon">
              {services.map((s) => (
                <tr key={s.slug}>
                  <td className="px-5 py-4 font-semibold">{s.name}</td>
                  <td className="px-5 py-4">{formatMoney(s.basePrice)}</td>
                  <td className="px-5 py-4">{formatMoney(s.pricePerGuest)}</td>
                  <td className="px-5 py-4">{s.minGuests}–{s.maxGuests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <SectionHeading eyebrow="Sample menus" title="A few menus I love cooking" body="Every menu is planned with you. These are starting points, not set lists." />
        <MenuTabs
          groups={services
            .map((s) => ({ slug: s.slug, name: s.name, menus: sampleMenus.filter((m) => m.service === s.slug) }))
            .filter((g) => g.menus.length > 0)}
        />
      </section>
      <CtaBand />
    </>
  );
}
