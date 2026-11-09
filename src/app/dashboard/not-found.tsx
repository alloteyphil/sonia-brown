import Link from "next/link";
import { Button } from "@/components/ui/button";
import { StatusPage } from "@/components/ui/status-page";

export default function DashboardNotFound() {
  return (
    <StatusPage
      code="404"
      title="Not found"
      body="This booking or page doesn't exist anymore. It may have been removed, or the link is incomplete."
      actions={
        <>
          <Button asChild><Link href="/dashboard/bookings">All bookings</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard">Dashboard home</Link></Button>
        </>
      }
    />
  );
}
