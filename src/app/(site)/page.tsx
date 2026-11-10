import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { images } from "@/brand/images";
import { brand } from "@/brand/tokens";
import { faqs, ghanaianDishes, moreGhanaianDishes, moreSoulFoodDishes, soulFoodDishes } from "@/brand/content";
import { getBusinessInfo, getServices, siteUrl } from "@/lib/server-data";
import { container, CtaBand, Faq, HowItWorks, SectionHeading, ServiceList, Testimonials } from "@/components/site/sections";
import { DishTabs } from "@/components/site/dish-tabs";
import { cn } from "@/lib/utils";

const textLink = "font-medium text-harbour-deep underline underline-offset-4 transition-colors hover:text-night-sky";

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

      {/* Hero: food full-bleed on the right from tablet up; image leads on phones. */}
      <section className="grid md:min-h-[min(calc(100dvh-4rem),40rem)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="enter order-2 flex flex-col justify-center px-5 pb-12 pt-8 sm:px-8 md:order-1 md:py-14 md:pl-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))] md:pr-10 lg:pl-[max(2rem,calc((100vw-72rem)/2+2rem))]">
          <h1 className="max-w-[18ch] text-[2.35rem] leading-[1.06] text-night-sky sm:text-[3.25rem] lg:text-[3.5rem]">
            Ghanaian and soul food, cooked at your table
          </h1>
          <p className="mt-5 max-w-[34rem] text-lg text-muted sm:mt-6 sm:text-xl">
            I&apos;m Sonia, a private chef in {info.serviceArea.trim()}. I shop, cook in your kitchen, serve and clean up, for
            private dinners, weekly meal prep and events.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 sm:mt-8">
            <Button asChild size="lg">
              <Link href="/book">Book Sonia</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/services">See menus and prices</Link>
            </Button>
          </div>
          <p className="mt-5 text-[15px] text-muted sm:mt-6">
            Ingredients and cleanup included. Book with {info.leadTimeHours} hours&apos; notice and pay by MoMo or card.
          </p>
        </div>
        <div className="relative order-1 aspect-[5/4] bg-raised sm:aspect-[4/3] md:order-2 md:aspect-auto md:h-full md:min-h-[22rem]">
          <Image
            src={images.hero.src}
            alt={images.hero.alt}
            fill
            preload
            sizes="(min-width: 768px) 48vw, 100vw"
            className="object-cover object-[center_40%]"
          />
        </div>
      </section>

      {/* Services */}
      <section className={cn(container, "py-16 sm:py-24")}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <SectionHeading title="Food for every kind of table" body="Every booking includes ingredients, cooking, serving and leaving your kitchen spotless." />
          <Link href="/services" className={textLink}>Sample menus and full prices</Link>
        </div>
        <div className="mt-10">
          <ServiceList services={services} />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-raised py-16 sm:py-20">
        <div className={container}>
          <SectionHeading title="How booking works" />
          <HowItWorks />
        </div>
      </section>

      {/* About */}
      <section className={cn(container, "grid items-center gap-x-16 gap-y-10 py-16 sm:py-24 md:grid-cols-[1.1fr_1fr]")}>
        <div>
          <SectionHeading title="Cooking is how I take care of people" />
          <p className="mt-6 text-lg text-muted">
            I grew up in a busy Accra kitchen where food was how we celebrated, comforted and welcomed people. Today I
            cook Ghanaian classics, Southern soul food and international dishes with the best local produce, and I love making a dinner at
            home feel like a night out.
          </p>
          <p className="mt-4 text-lg text-muted">
            Every menu is personal. Tell me who&apos;s coming, what you love and what you can&apos;t eat, and I&apos;ll take it from there.
          </p>
          <p className="mt-8">
            <Link href="/about" className={textLink}>More about me</Link>
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-raised">
          <Image src={(images.sonia ?? images.table).src} alt={(images.sonia ?? images.table).alt} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
        </div>
      </section>

      <Testimonials />

      {/* Signature dishes */}
      <section className={cn(container, "border-t border-horizon py-16 sm:py-24")}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <SectionHeading
            title="Ghanaian favourites and soul food classics"
            body="The Ghanaian dishes I grew up on and the soul food everyone asks for, made with fresh produce. Mix them into any menu or build a whole night around them."
          />
          <Link href="/book" className={textLink}>Book a dinner</Link>
        </div>
        <DishTabs
          cuisines={[
            { id: "ghanaian", label: "Ghanaian", dishes: ghanaianDishes, more: moreGhanaianDishes },
            { id: "soul-food", label: "Soul food", dishes: soulFoodDishes, more: moreSoulFoodDishes },
          ]}
        />
      </section>

      {/* FAQ */}
      <section id="faq" className={cn(container, "grid scroll-mt-24 gap-x-16 gap-y-8 border-t border-horizon pt-16 sm:pt-24 md:grid-cols-[1fr_2fr]")}>
        <SectionHeading title="Good to know" body="The questions people ask before they book." />
        <Faq />
      </section>

      <CtaBand />
    </>
  );
}
