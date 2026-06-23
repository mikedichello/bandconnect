import Link from "next/link";
import { cn, formatTime } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  startAt: Date;
  familyFriendly: boolean;
  hasCoverCharge: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * A month grid. `monthDate` is any date within the month to render.
 * `buildMonthHref` produces navigation links that preserve the active filters.
 * Marked up with ARIA grid roles so screen readers announce it as a date grid.
 */
export function CalendarGrid({
  events,
  monthDate,
  buildMonthHref,
}: {
  events: CalendarEvent[];
  monthDate: Date;
  buildMonthHref: (year: number, month: number) => string;
}) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = first.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const monthName = first.toLocaleDateString("en-US", { month: "long" });

  // Bucket events by day-of-month.
  const byDay = new Map<number, CalendarEvent[]>();
  for (const e of events) {
    if (e.startAt.getFullYear() === year && e.startAt.getMonth() === month) {
      const d = e.startAt.getDate();
      if (!byDay.has(d)) byDay.set(d, []);
      byDay.get(d)!.push(e);
    }
  }

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-3 sm:px-4">
        <h2 className="font-display text-base font-bold text-fg sm:text-lg">{monthLabel}</h2>
        <div className="flex gap-2">
          <Link href={buildMonthHref(prev.getFullYear(), prev.getMonth())} className="btn-ghost px-3 py-1.5 text-xs" aria-label="Previous month">← Prev</Link>
          <Link href={buildMonthHref(today.getFullYear(), today.getMonth())} className="btn-ghost px-3 py-1.5 text-xs">Today</Link>
          <Link href={buildMonthHref(next.getFullYear(), next.getMonth())} className="btn-ghost px-3 py-1.5 text-xs" aria-label="Next month">Next →</Link>
        </div>
      </div>

      <div role="grid" aria-label={`${monthLabel} events`}>
        <div role="row" className="grid grid-cols-7 border-b border-line bg-input text-center text-xs font-semibold uppercase tracking-wide text-subtle">
          {WEEKDAYS.map((d) => (
            <div key={d} role="columnheader" className="py-2">
              <abbr title={d} className="no-underline">{d}</abbr>
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div role="row" key={wi} className="grid grid-cols-7">
            {week.map((d, i) => {
              const dayEvents = d ? byDay.get(d) ?? [] : [];
              const cellLabel =
                d != null
                  ? `${monthName} ${d}, ${dayEvents.length === 0 ? "no events" : `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}`}`
                  : undefined;
              return (
                <div
                  role="gridcell"
                  aria-label={cellLabel}
                  key={i}
                  className={cn(
                    "min-h-[64px] border-b border-r border-line p-1 sm:min-h-[120px] sm:p-1.5",
                    d == null && "bg-black/10",
                  )}
                >
                  {d != null && (
                    <>
                      <div className={cn("mb-1 text-[11px] font-semibold sm:text-xs", isToday(d) ? "grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-white" : "text-subtle")}>
                        {d}
                        {isToday(d) && <span className="sr-only"> (today)</span>}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((e) => (
                          <Link
                            key={e.id}
                            href={`/event/${e.id}`}
                            className="block truncate rounded bg-brand-500/15 px-1 py-0.5 text-[10px] leading-tight text-brand-800 hover:bg-brand-500/30 dark:text-brand-100 sm:rounded-md sm:px-1.5 sm:py-1 sm:text-[11px]"
                            title={e.title}
                          >
                            {/* Time is hidden on phones so the title gets the space. */}
                            <span className="hidden text-brand-600 dark:text-brand-300 sm:inline">{formatTime(e.startAt)} </span>
                            {e.title}
                          </Link>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="block px-1 text-[10px] text-subtle">+{dayEvents.length - 3} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
