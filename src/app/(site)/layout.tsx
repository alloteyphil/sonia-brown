import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { WhatsAppFab } from "@/components/site/whatsapp-fab";
import { HashScroll } from "@/components/site/hash-scroll";
import { ConvexPublicProvider } from "@/components/providers/convex-public";
import { getBusinessInfo } from "@/lib/server-data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const info = await getBusinessInfo();
  return (
    <ConvexPublicProvider>
      {/* .site-theme switches the tokens in globals.css to the customer-site palette and type. */}
      <div className="site-theme">
        <HashScroll />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter info={info} />
        <WhatsAppFab number={info.whatsapp} />
      </div>
    </ConvexPublicProvider>
  );
}
