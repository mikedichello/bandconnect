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
 * A month grid. `monthDate` is any date within the month to render. `buildHref`
 * produces navigation links that preserve the active filters.
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

  const today = new Date();
  const isToday = (d: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;

  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-3 sm:px-4">
        <h2 className="font-display text-base font-bold text-white sm:text-lg">
          {first.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h2>
        <div className="flex gap-2">
          <Link href={buildMonthHref(prev.getFullYear(), prev.getMonth())} className="btn-ghost px-3 py-1.5 text-xs">← Prev</Link>
          <Link href={buildMonthHref(today.getFullYear(), today.getMonth())} className="btn-ghost px-3 py-1.5 text-xs">Today</Link>
          <Link href={buildMonthHref(next.getFullYear(), next.getMonth())} className="btn-ghost px-3 py-1.5 text-xs">Next →</Link>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-white/10 bg-black/20 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const dayEvents = d ? byDay.get(d) ?? [] : [];
          return (
            <div
              key={i}
              className={cn(
                "min-h-[64px] border-b border-r border-white/5 p-1 sm:min-h-[120px] sm:p-1.5",
                d == null && "bg-black/10",
              )}
            >
              {d != null && (
                <>
                  <div className={cn("mb-1 text-[11px] font-semibold sm:text-xs", isToday(d) ? "grid h-5 w-5 place-items-center rounded-full bg-brand-500 text-white" : "text-zinc-500")}>
                    {d}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((e) => (
                      <Link
                        key={e.id}
                        href={`/event/${e.id}`}
                        className="block truncate rounded bg-brand-500/15 px-1 py-0.5 text-[10px] leading-tight text-brand-100 hover:bg-brand-500/30 sm:rounded-md sm:px-1.5 sm:py-1 sm:text-[11px]"
                        title={e.title}
                      >
                        {/* Time is hidden on phones so the title gets the space. */}
                        <span className="hidden text-brand-300 sm:inline">{formatTime(e.startAt)} </span>
                        {e.title}
                      </Link>
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="block px-1 text-[10px] text-zinc-500">+{dayEvents.length - 3} more</span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
