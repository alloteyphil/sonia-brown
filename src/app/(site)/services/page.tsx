import type { Metadata } from "next";
import { getBusinessInfo, getServices } from "@/lib/server-data";
import { container, CtaBand, SectionHeading, ServiceList } from "@/components/site/sections";
import { MenuTabs } from "@/components/site/menu-tabs";
import { sampleMenus } from "@/brand/content";
import { formatMoney } from "@/lib/domain/money";
import { cn } from "@/lib/utils";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Services & sample menus",
  description: "Private dinners, weekly meal prep and event catering in Accra. See pricing and sample menus.",
};

export default async function ServicesPage() {
  const [services, info] = await Promise.all([getServices(), getBusinessInfo()]);
  return (
    <>
      <section className={cn(container, "pt-12 sm:pt-16")}>
        <div className="enter">
          <SectionHeading
            as="h1"
            title="Pick the table you're setting"
            body={`Prices include ingredients, cooking, serving and cleanup. A ${info.depositPercent}% deposit holds your date.`}
          />
        </div>
        <div className="mt-10">
          <ServiceList services={services} />
        </div>
      </section>

      <section className={cn(container, "pt-16 sm:pt-24")}>
        <SectionHeading title="How the price is worked out" body="A booking fee for the day, plus a price for each guest." />
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[15px]">
            <caption className="sr-only">Pricing by service</caption>
            <thead className="border-b border-night-sky/15 text-sm text-muted">
              <tr>
                <th className="py-3 pr-5 font-medium">Service</th>
                <th className="px-5 py-3 text-right font-medium">Booking fee</th>
                <th className="px-5 py-3 text-right font-medium">Per guest</th>
                <th className="py-3 pl-5 text-right font-medium">Guests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-horizon border-b border-horizon tabular-nums">
              {services.map((s) => (
                <tr key={s.slug}>
                  <td className="py-4 pr-5 font-medium">{s.name}</td>
                  <td className="px-5 py-4 text-right">{formatMoney(s.basePrice)}</td>
                  <td className="px-5 py-4 text-right">{formatMoney(s.pricePerGuest)}</td>
                  <td className="py-4 pl-5 text-right">{s.minGuests} to {s.maxGuests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={cn(container, "pt-16 sm:pt-24")}>
        <SectionHeading title="A few menus I love cooking" body="Every menu is planned with you. These are starting points, not set lists." />
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
