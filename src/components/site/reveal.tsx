"use client";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger index for sibling items (0, 1, 2…). */
  delay?: number;
  as?: ElementType;
  /** Start visible when this much of the element is on screen. */
  threshold?: number;
  /** Once revealed, stay revealed. */
  once?: boolean;
};

/**
 * Scroll reveal. Uses opacity + transform only. Content stays visible with
 * scripting off and when the visitor prefers reduced motion.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  threshold = 0.18,
  once = true,
}: RevealProps) {
  const reduceMotion = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
  const ref = useRef<HTMLElement | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    // Defer enhancing so the first paint stays visible, then hide only what
    // is still below the fold.
    const frame = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (alreadyVisible) {
        setInView(true);
        if (once) return;
      } else {
        setEnhanced(true);
      }
      io.observe(el);
    });

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
    };
  }, [once, reduceMotion, threshold]);

  if (reduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag
      ref={ref as never}
      data-enhanced={enhanced ? "true" : "false"}
      data-inview={inView ? "true" : "false"}
      className={cn("reveal", className)}
      style={{ "--reveal-delay": `${delay * 90}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
