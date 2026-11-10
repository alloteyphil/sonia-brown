import { Skeleton } from "@/components/ui/card";

/** Dashboard overview / generic panel loading state. */
export function DashboardPanelSkeleton({ label = "Loading dashboard" }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="space-y-6">
      <span className="sr-only">{label}</span>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="mt-2 h-4 w-40" />
        </div>
        <Skeleton className="h-10 w-36 rounded-[var(--radius-control)]" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72 w-full" />
    </div>
  );
}

export function DashboardTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="space-y-4">
      <span className="sr-only">Loading list</span>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-56 max-w-full" />
      </div>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-horizon bg-white">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-horizon px-4 py-4 last:border-b-0">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-48 max-w-full" />
              <Skeleton className="h-3.5 w-32 max-w-full" />
            </div>
            <Skeleton className="hidden h-6 w-20 sm:block" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardFormSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className="space-y-6">
      <span className="sr-only">Loading settings</span>
      <Skeleton className="h-9 w-56" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-11 w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-11 w-36 rounded-[var(--radius-control)]" />
    </div>
  );
}
