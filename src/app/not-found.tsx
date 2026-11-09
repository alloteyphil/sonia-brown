import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-cloud">
      <header className="px-6 py-5">
        <Link href="/" aria-label="Sonia Brown home"><Wordmark /></Link>
      </header>
      <main id="main" className="flex flex-1 items-center">
        <StatusPage
          code="404"
          title="This page isn't on the menu"
          body="The link may be old, or the page has moved. Let's get you somewhere useful."
          actions={
            <>
              <Button asChild><Link href="/">Back to home</Link></Button>
              <Button asChild variant="outline"><Link href="/book">Book Sonia</Link></Button>
            </>
          }
        />
      </main>
    </div>
  );
}
