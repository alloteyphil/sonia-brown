"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "./logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/services", label: "Services & menus" },
  { href: "/about", label: "About" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-horizon/70 bg-cloud/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Sonia Brown home" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-full px-4 py-2 text-[15px] font-medium text-night-sky/80 hover:bg-sky-mist hover:text-night-sky",
                pathname === n.href && "text-harbour",
              )}
            >
              {n.label}
            </Link>
          ))}
          <Button asChild className="ml-2">
            <Link href="/book">Book Sonia</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-2 md:hidden">
          <Button asChild size="sm">
            <Link href="/book">Book</Link>
          </Button>
          <button
            className="rounded-full p-2 hover:bg-sky-mist"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-horizon bg-cloud px-4 pb-5 pt-2 md:hidden" aria-label="Mobile">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-3 text-lg font-medium hover:bg-sky-mist"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
