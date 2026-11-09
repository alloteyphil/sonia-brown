"use client";
import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="Error"
      title="Something went wrong"
      body="This page hit a snag while loading. Try again, and if it keeps happening, message Sonia on WhatsApp."
      actions={
        <>
          <Button onClick={() => retry()}><RotateCcw />Try again</Button>
          <Button asChild variant="outline"><Link href="/">Back to home</Link></Button>
        </>
      }
    />
  );
}
