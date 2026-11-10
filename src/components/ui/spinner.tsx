import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Loading cues on this site:
 * - Skeleton → page/content (layouts, lists, photos, filling a view with data)
 * - Spinner / ActionSpinner → a user action in progress (book, pay, save, sign-in)
 */

export function Spinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span role="status" aria-live="polite" className="inline-flex">
      <Loader2 aria-hidden className={cn("size-8 animate-spin text-harbour", className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Full-area wait while a page shell or auth gate settles. Prefer skeletons for content. */
export function PageSpinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex min-h-[60vh] items-center justify-center", className)}>
      <Spinner label={label} />
    </div>
  );
}

/** Centered spinner + copy for booking, payment, and other in-flight actions. */
export function ActionSpinner({
  label,
  detail,
  className,
}: {
  label: string;
  detail?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn("flex flex-col items-center justify-center gap-4 py-16 text-center", className)}
    >
      <Spinner label={label} className="size-10" />
      <div className="max-w-sm">
        <p className="text-lg font-medium text-night-sky">{label}</p>
        {detail && <p className="mt-2 text-sm text-muted">{detail}</p>}
      </div>
    </div>
  );
}
