import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className, label = "Loading" }: { className?: string; label?: string }) {
  return (
    <span role="status" aria-live="polite" className="inline-flex">
      <Loader2 aria-hidden className={cn("size-8 animate-spin text-harbour", className)} />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function PageSpinner({ className, label }: { className?: string; label?: string }) {
  return (
    <div className={cn("flex min-h-[60vh] items-center justify-center", className)}>
      <Spinner label={label} />
    </div>
  );
}
