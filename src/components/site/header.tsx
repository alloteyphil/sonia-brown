"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { Menu, X } from "lucide-react";
import { Wordmark } from "./logo";
import { scrollToId } from "./hash-scroll";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/services", label: "Services & menus" },
  { href: "/about", label: "About" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

function scrollToHash(hash: string) {
  window.history.pushState(null, "", `/#${hash}`);
  scrollToId(hash, "instant");
  // Retries cover fonts/images and the mobile drawer unmounting after close.
  for (const ms of [120, 320, 600]) {
    window.setTimeout(() => scrollToId(hash, "instant"), ms);
  }
}

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

  function onNavClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    const hash = href.includes("#") ? href.split("#")[1] : "";
    if (!hash) {
      setOpen(false);
      return;
    }
    const path = href.split("#")[0] || "/";
    // Already on home: Next Link won't scroll to the hash, so we do it.
    // Close the mobile drawer first — scrolling while it's open measures the
    // wrong Y, then the drawer unmounts and FAQ ends up above the viewport.
    if (pathname === path) {
      e.preventDefault();
      setOpen(false);
      window.setTimeout(() => scrollToHash(hash), 180);
    } else {
      setOpen(false);
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-cloud/95 backdrop-blur-sm transition-colors duration-200",
        scrolled || open ? "border-horizon" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Sonia Brown home" onClick={() => setOpen(false)}>
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={(e) => onNavClick(e, n.href)}
              aria-current={pathname === n.href ? "page" : undefined}
              className={cn(
                "py-2 text-[15px] text-night-sky/70 underline-offset-8 transition-colors hover:text-night-sky",
                pathname === n.href && "text-night-sky underline decoration-sky decoration-2",
              )}
            >
              {n.label}
            </Link>
          ))}
          <Button asChild size="sm" className="ml-1 px-5">
            <Link href="/book">Book Sonia</Link>
          </Button>
        </nav>
        <div className="flex items-center gap-1 md:hidden">
          <Button asChild size="sm">
            <Link href="/book">Book</Link>
          </Button>
          <button
            className="flex size-11 items-center justify-center rounded-[var(--radius-control)] transition-colors hover:bg-raised"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" strokeWidth={1.5} /> : <Menu className="size-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-horizon bg-cloud px-5 pb-4 pt-1 md:hidden" aria-label="Mobile">
          <ul className="divide-y divide-horizon">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={(e) => onNavClick(e, n.href)} className="block py-4 text-lg">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
