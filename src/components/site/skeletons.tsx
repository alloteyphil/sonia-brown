import { Skeleton } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const container = "mx-auto max-w-6xl px-5 sm:px-8";

/** Accessible wrapper for route-level skeleton screens. */
export function SkeletonScreen({
  children,
  className,
  label = "Loading page",
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Home hero: copy column + food plane, matching the live first viewport. */
export function HomeHeroSkeleton() {
  return (
    <SkeletonScreen label="Loading home">
      <section className="grid md:min-h-[min(calc(100dvh-4rem),40rem)] md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="order-2 flex flex-col justify-center px-5 pb-12 pt-8 sm:px-8 md:order-1 md:py-14 md:pl-[max(1.25rem,calc((100vw-72rem)/2+1.25rem))] md:pr-10 lg:pl-[max(2rem,calc((100vw-72rem)/2+2rem))]">
          <Skeleton className="h-12 w-[min(100%,18ch)] sm:h-14" />
          <Skeleton className="mt-3 h-12 w-[min(100%,14ch)] sm:h-14" />
          <Skeleton className="mt-6 h-5 w-full max-w-[34rem]" />
          <Skeleton className="mt-2 h-5 w-[92%] max-w-[30rem]" />
          <Skeleton className="mt-2 h-5 w-[70%] max-w-[24rem]" />
          <div className="mt-8 flex flex-wrap gap-3">
            <Skeleton className="h-12 w-32 rounded-[var(--radius-control)]" />
            <Skeleton className="h-12 w-44 rounded-[var(--radius-control)]" />
          </div>
          <Skeleton className="mt-6 h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="order-1 aspect-[5/4] rounded-none sm:aspect-[4/3] md:order-2 md:aspect-auto md:h-full md:min-h-[22rem]" />
      </section>

      <section className={cn(container, "py-16 sm:py-24")}>
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="mt-4 h-5 w-full max-w-xl" />
        <ServiceListSkeleton className="mt-10" />
      </section>
    </SkeletonScreen>
  );
}

export function ServiceListSkeleton({ className, rows = 3 }: { className?: string; rows?: number }) {
  return (
    <ul className={cn("divide-y divide-horizon border-y border-horizon", className)}>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="grid gap-x-8 gap-y-5 py-6 sm:grid-cols-[200px_1fr] md:grid-cols-[240px_1fr_auto] md:items-center">
          <Skeleton className="aspect-[4/3] rounded-[10px]" />
          <div>
            <Skeleton className="h-7 w-48 max-w-full" />
            <Skeleton className="mt-3 h-4 w-full max-w-xl" />
            <Skeleton className="mt-2 h-4 w-[80%] max-w-md" />
            <Skeleton className="mt-4 h-3.5 w-56 max-w-full" />
          </div>
          <div className="flex items-end justify-between gap-6 sm:col-start-2 md:col-start-auto md:flex-col md:items-end md:gap-4">
            <div className="md:text-right">
              <Skeleton className="h-3.5 w-10" />
              <Skeleton className="mt-2 h-7 w-24" />
            </div>
            <Skeleton className="h-9 w-24 rounded-[var(--radius-control)]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Inner marketing pages: title, body, content blocks. */
export function ContentPageSkeleton({
  label = "Loading page",
  withMedia = false,
}: {
  label?: string;
  withMedia?: boolean;
}) {
  return (
    <SkeletonScreen label={label}>
      <section
        className={cn(
          container,
          "pt-12 sm:pt-16",
          withMedia && "grid items-center gap-x-16 gap-y-10 md:grid-cols-[1.1fr_1fr]",
        )}
      >
        <div>
          <Skeleton className="h-12 w-72 max-w-full sm:h-14" />
          <Skeleton className="mt-6 h-5 w-full max-w-xl" />
          <Skeleton className="mt-2 h-5 w-[95%] max-w-lg" />
          <Skeleton className="mt-2 h-5 w-[80%] max-w-md" />
        </div>
        {withMedia && <Skeleton className="aspect-[4/5] rounded-[var(--radius-card)]" />}
      </section>
      <section className={cn(container, "pt-16 sm:pt-24")}>
        <Skeleton className="h-9 w-56 max-w-full" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </section>
    </SkeletonScreen>
  );
}

export function ServicesPageSkeleton() {
  return (
    <SkeletonScreen label="Loading services">
      <section className={cn(container, "pt-12 sm:pt-16")}>
        <Skeleton className="h-12 w-80 max-w-full sm:h-14" />
        <Skeleton className="mt-4 h-5 w-full max-w-xl" />
        <ServiceListSkeleton className="mt-10" />
      </section>
      <section className={cn(container, "pt-16 sm:pt-24")}>
        <Skeleton className="h-9 w-64 max-w-full" />
        <Skeleton className="mt-8 h-40 w-full" />
      </section>
    </SkeletonScreen>
  );
}

export function ContactPageSkeleton() {
  return (
    <SkeletonScreen label="Loading contact">
      <section className={cn(container, "pt-12 sm:pt-16")}>
        <Skeleton className="h-12 w-64 max-w-full sm:h-14" />
        <Skeleton className="mt-4 h-5 w-full max-w-xl" />
        <div className="mt-10 grid items-start gap-x-16 gap-y-10 md:grid-cols-[1.1fr_1fr]">
          <Skeleton className="h-64 rounded-[var(--radius-card)]" />
          <div className="space-y-0 divide-y divide-horizon border-y border-horizon">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 py-5">
                <Skeleton className="size-[18px] shrink-0 rounded-full" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-40 max-w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </SkeletonScreen>
  );
}

export function BookingPageSkeleton() {
  return (
    <SkeletonScreen label="Loading booking">
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-8 sm:pt-16">
        <Skeleton className="h-12 w-[min(100%,28rem)] sm:h-14" />
        <div className="mt-10 space-y-4">
          <Skeleton className="h-4 w-40" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
          <Skeleton className="mt-6 h-12 w-40 rounded-[var(--radius-control)]" />
        </div>
      </section>
    </SkeletonScreen>
  );
}
