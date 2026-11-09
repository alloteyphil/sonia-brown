import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

export default function SiteNotFound() {
  return (
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
  );
}
