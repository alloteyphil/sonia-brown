import { cn } from "@/lib/utils";

/** "SB" monogram: a sky-blue disc with a serif monogram and a small horizon line. */
export function Monogram({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("size-10", className)} aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill={inverted ? "#FFFFFF" : "#0B2239"} />
      <path d="M10 44 Q32 36 54 44" stroke="#7CC3EE" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <text
        x="32"
        y="37"
        textAnchor="middle"
        fontFamily="Fraunces Variable, Georgia, serif"
        fontSize="26"
        fontWeight="500"
        fill={inverted ? "#0B2239" : "#FFFFFF"}
        letterSpacing="-1"
      >
        SB
      </text>
    </svg>
  );
}

export function Wordmark({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Monogram inverted={inverted} />
      <span className="leading-none">
        <span className={cn("block font-display text-[22px] font-medium tracking-tight", inverted ? "text-white" : "text-night-sky")}>
          Sonia Brown
        </span>
        <span className={cn("mt-1 block whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em]", inverted ? "text-sky" : "text-harbour")}>
          Private Chef &amp; Catering
        </span>
      </span>
    </span>
  );
}
