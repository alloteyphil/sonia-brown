import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { images } from "@/brand/images";
import { brand } from "@/brand/tokens";
import { faqs, ghanaianDishes, moreGhanaianDishes, moreSoulFoodDishes, soulFoodDishes } from "@/brand/content";
import { getBusinessInfo, getServices, siteUrl } from "@/lib/server-data";
import { CtaBand, Faq, HowItWorks, SectionHeading, ServiceCard, Testimonials } from "@/components/site/sections";
import { DishTabs } from "@/components/site/dish-tabs";


export const revalidate = 300;
export default async function HomePage() {
  const [services, info] = await Promise.all([getServices(), getBusinessInfo()]);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "FoodEstablishment"],
        name: brand.name,
        description: `${brand.descriptor} in ${info.serviceArea}`,
        url: siteUrl(),
        telephone: info.phone,
        email: info.email,
        image: `${siteUrl()}/opengraph-image`,
        areaServed: info.serviceArea,
        address: { "@type": "PostalAddress", addressLocality: "Accra", addressCountry: "GH" },
        priceRange: "GH₵GH₵",
        servesCuisine: ["Ghanaian", "West African", "Soul food", "Southern"],
        sameAs: info.instagram ? [`https://instagram.com/${info.instagram}`] : [],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[78%] bg-gradient-to-b from-sky-mist via-sky-mist/60 to-cloud" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:pb-24 md:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-sm font-medium text-harbour ring-1 ring-sky/60">
              <span className="size-2 rounded-full bg-sunlight" aria-hidden /> Private chef in {info.serviceArea}
            </p>
            <h1 className="mt-6 text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
              Cooked for you,
              <br />
              <em className="font-normal text-harbour">at your table.</em>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted sm:text-xl">
              I&apos;m Sonia. I bring restaurant-quality food to your home: private dinners, weekly meal prep and
              catering for the moments that matter. I&apos;ll handle the cooking, the cleanup, and everything in between.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/book">Book Sonia <ArrowRight /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/services">See services &amp; menus</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-night-sky/80">
              {["Ingredients included", "Cleanup done", "Pay by MoMo or card"].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check className="size-4 text-meadow" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="relative mx-auto w-full max-w-md md:max-w-none">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[2rem] ring-8 ring-white shadow-[0_30px_60px_-30px_rgba(11,34,57,0.45)]">
              <Image src={images.hero.src} alt={images.hero.alt} fill priority sizes="(min-width: 768px) 45vw, 90vw" className="object-cover" />
            </div>
            <div className="absolute -bottom-5 -left-3 rounded-2xl bg-white px-5 py-4 shadow-lg ring-1 ring-horizon sm:-left-8">
              <p className="font-display text-3xl text-harbour">48h</p>
              <p className="text-sm text-muted">notice is all I need</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="services">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Services" title="Food for every kind of table" body="Every booking includes ingredients, cooking, serving and leaving your kitchen spotless." />
          <Link href="/services" className="inline-flex items-center gap-1 font-semibold text-harbour hover:underline">Sample menus <ArrowRight className="size-4" /></Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((s) => <ServiceCard key={s.slug} service={s} />)}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-sky-mist/60 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading eyebrow="How it works" title="Three steps to a great meal" center />
          <HowItWorks />
        </div>
      </section>

      {/* About */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2">
        <div className="relative aspect-[5/6] overflow-hidden rounded-[2rem]">
          <Image src={images.sonia.src} alt={images.sonia.alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
        </div>
        <div>
          <SectionHeading eyebrow="About Sonia" title="Cooking is how I take care of people" />
          <p className="mt-6 text-lg text-muted">
            I grew up in a busy Accra kitchen where food was how we celebrated, comforted and welcomed people. Today I
            cook Ghanaian classics, Southern soul food and international dishes with the best local produce, and I love making a dinner at
            home feel like a night out.
          </p>
          <p className="mt-4 text-lg text-muted">
            Every menu is personal. Tell me who&apos;s coming, what you love and what you can&apos;t eat, and I&apos;ll take it from there.
          </p>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/about">More about me</Link>
          </Button>
        </div>
      </section>

      <Testimonials />

      {/* Signature dishes */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="On the menu"
            title="Ghanaian favourites & soul food classics"
            body="The Ghanaian dishes I grew up on and the soul food everyone asks for, made with fresh produce. Mix them into any menu or build a whole night around them."
          />
          <Link href="/book" className="inline-flex items-center gap-1 font-semibold text-harbour hover:underline">Book a dinner <ArrowRight className="size-4" /></Link>
        </div>
        <DishTabs
          cuisines={[
            { id: "ghanaian", label: "Ghanaian", dishes: ghanaianDishes, more: moreGhanaianDishes },
            { id: "soul-food", label: "Soul food", dishes: soulFoodDishes, more: moreSoulFoodDishes },
          ]}
        />
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6">
        <SectionHeading eyebrow="FAQ" title="Good to know" center />
        <Faq />
      </section>

      <CtaBand />
    </>
  );
}
