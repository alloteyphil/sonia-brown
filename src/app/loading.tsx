import { Skeleton } from "@/components/ui/card";

/** Root fallback before a segment layout paints. */
export default function Loading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="flex min-h-dvh flex-col">
      <span className="sr-only">Loading</span>
      <div className="flex h-16 items-center justify-between border-b border-horizon px-5 sm:px-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-28 rounded-[var(--radius-control)]" />
      </div>
      <div className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 sm:px-8">
        <Skeleton className="h-12 w-72 max-w-full" />
        <Skeleton className="mt-6 h-5 w-full max-w-xl" />
        <Skeleton className="mt-2 h-5 w-[80%] max-w-lg" />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  );
}