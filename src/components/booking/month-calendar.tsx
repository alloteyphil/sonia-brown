"use client";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function MonthCalendar({
  month,
  onMonthChange,
  available,
  selected,
  onSelect,
  minMonth,
  maxMonth,
  loading,
}: {
  month: Date;
  onMonthChange: (d: Date) => void;
  available: Set<string>;
  selected?: string;
  onSelect: (date: string) => void;
  minMonth: Date;
  maxMonth: Date;
  loading?: boolean;
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const canPrev = startOfMonth(month) > startOfMonth(minMonth);
  const canNext = startOfMonth(month) < startOfMonth(maxMonth);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, -1))}
          disabled={!canPrev}
          className="rounded-full p-2 hover:bg-sky-mist disabled:opacity-30"
          aria-label="Previous month"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="font-display text-xl" aria-live="polite">{format(month, "MMMM yyyy")}</p>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          disabled={!canNext}
          className="rounded-full p-2 hover:bg-sky-mist disabled:opacity-30"
          aria-label="Next month"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-muted" aria-hidden>
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>
      <div className={cn("mt-1 grid grid-cols-7 gap-1", loading && "animate-pulse")} role="grid">
        {days.map((d) => {
          const key = format(d, "yyyy-MM-dd");
          const inMonth = isSameMonth(d, month);
          const open = inMonth && available.has(key);
          const isSel = selected === key;
          return (
            <button
              key={key}
              type="button"
              disabled={!open}
              onClick={() => onSelect(key)}
              aria-pressed={isSel}
              aria-label={`${format(d, "EEEE d MMMM")}${open ? ", available" : ", unavailable"}`}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-xl text-[15px] transition",
                !inMonth && "invisible",
                open ? "bg-sky-mist font-semibold text-night-sky hover:bg-sky/50" : "text-night-sky/30",
                isSel && "bg-harbour text-white hover:bg-harbour",
              )}
            >
              {format(d, "d")}
            </button>
          );
        })}
      </div>
      <p className="mt-3 flex items-center gap-2 text-sm text-muted">
        <span className="inline-block size-3 rounded bg-sky-mist ring-1 ring-sky" aria-hidden /> Available
      </p>
    </div>
  );
}
