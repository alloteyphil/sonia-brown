"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RedirectToSignIn, UserButton, useAuth } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { CalendarDays, LayoutDashboard, ListChecks, Settings, Sliders, Users, UtensilsCrossed, Loader2 } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Wordmark, Monogram } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/bookings", label: "Bookings", icon: ListChecks },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/services", label: "Services", icon: UtensilsCrossed },
  { href: "/dashboard/availability", label: "Availability", icon: Sliders },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function Gate({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.dashboard.me, isAuthenticated ? {} : "skip");

  if (!isLoaded || isLoading || (isAuthenticated && me === undefined)) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-harbour" /></div>;
  }
  if (!isSignedIn) return <RedirectToSignIn />;
  if (!isAuthenticated) {
    return <Notice title="Can't reach the database" body="Check that the Clerk JWT template named “convex” exists and CLERK_JWT_ISSUER_DOMAIN is set in Convex." />;
  }
  if (me && !me.ok) return <Notice title="No access" body={me.error} />;
  return <>{children}</>;
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto mt-20 max-w-md rounded-2xl border border-horizon bg-white p-8 text-center">
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-2 text-muted">{body}</p>
      <div className="mt-6 flex justify-center"><UserButton /></div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/dashboard" ? pathname === href : pathname.startsWith(href));
  return (
    <div className="min-h-dvh bg-cloud">
      {/* Desktop sidebar */}
      <aside className="no-print fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-horizon bg-white px-4 py-6 lg:flex">
        <Link href="/dashboard" className="px-2"><Wordmark /></Link>
        <nav className="mt-10 flex-1 space-y-1" aria-label="Dashboard">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium", active(n.href) ? "bg-sky-mist text-harbour-deep" : "text-night-sky/75 hover:bg-cloud")}>
              <n.icon className="size-5" />{n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-between rounded-xl bg-cloud px-3 py-2">
          <Link href="/" className="text-sm text-muted hover:text-harbour">View site</Link>
          <UserButton />
        </div>
      </aside>

      {/* Mobile top bar + scrollable tabs */}
      <header className="no-print sticky top-0 z-30 border-b border-horizon bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2"><Monogram className="size-8" /><span className="font-display text-lg">Dashboard</span></Link>
          <UserButton />
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]" aria-label="Dashboard">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium", active(n.href) ? "bg-harbour text-white" : "bg-cloud text-night-sky/80")}>
              <n.icon className="size-4" />{n.label}
            </Link>
          ))}
        </nav>
      </header>

      <main id="main" className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-10">
          <Gate>{children}</Gate>
        </div>
      </main>
    </div>
  );
}

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
