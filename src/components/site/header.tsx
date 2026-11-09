"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-cloud/90 backdrop-blur transition-[border-color,box-shadow] duration-300",
        scrolled ? "border-horizon shadow-[0_8px_24px_-18px_rgba(11,34,57,0.45)]" : "border-horizon/70 shadow-none",
      )}
    >
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
                "rounded-full px-4 py-2 text-[15px] font-medium text-night-sky/80 transition-colors hover:bg-sky-mist hover:text-night-sky",
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
            className="rounded-full p-2 transition-colors hover:bg-sky-mist"
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
              className="block rounded-xl px-3 py-3 text-lg font-medium transition-colors hover:bg-sky-mist"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
