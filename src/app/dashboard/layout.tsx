import type { Metadata } from "next";
import { ConvexOwnerProvider } from "@/components/providers/convex-owner";
import { DashboardShell } from "@/components/dashboard/shell";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConvexOwnerProvider>
      <DashboardShell>{children}</DashboardShell>
    </ConvexOwnerProvider>
  );
}
