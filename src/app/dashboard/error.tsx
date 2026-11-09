"use client";
import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";
import { errorMessage } from "@/lib/utils";

export default function DashboardError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusPage
      code="Error"
      title="This page didn't load"
      body={errorMessage(error) || "Something went wrong. Try again in a moment."}
      actions={
        <>
          <Button onClick={() => retry()}><RotateCcw />Try again</Button>
          <Button asChild variant="outline"><Link href="/dashboard">Dashboard home</Link></Button>
        </>
      }
    />
  );
}
