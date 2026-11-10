"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const HEADER_OFFSET = 80;

/** Scroll so `#id` sits just below the sticky header. */
export function scrollToId(id: string, behavior: ScrollBehavior = "instant") {
  const el = document.getElementById(id);
  if (!el) return;
  // Manual offset: `overflow-x: clip` on html/body makes scroll-margin unreliable.
  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
  window.scrollTo({ top: Math.max(0, top), behavior });
}

/**
 * Scrolls to the URL hash after App Router navigations.
 * Soft nav to `/#faq` often lands at the top of home and can reset scroll
 * after the first attempt, so we wait for the target then correct a few times.
 */
export function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;

    let cancelled = false;

    const run = async () => {
      for (let i = 0; i < 50 && !cancelled; i++) {
        if (document.getElementById(id)) break;
        await new Promise((r) => setTimeout(r, 40));
      }
      if (cancelled) return;
      scrollToId(id, "instant");
      // Layout can still grow (images, fonts); nudge again after settle.
      for (const ms of [150, 400, 800]) {
        await new Promise((r) => setTimeout(r, ms));
        if (cancelled) return;
        scrollToId(id, "instant");
      }
    };

    void run();
    const onHash = () => scrollToId(id, "instant");
    window.addEventListener("hashchange", onHash);
    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", onHash);
    };
  }, [pathname]);

  return null;
}
