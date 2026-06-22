import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CalendarGrid } from "@/components/events/CalendarGrid";
import { formatDate, formatTime } from "@/lib/utils";

export const metadata = { title: "My calendar" };

export default async function CalendarPage({ searchParams }: { searchParams: { month?: string } }) {
  const user = await requireUser();
  const profile = user.profile!;
  const isFan = profile.type === "FAN";

  const now = new Date();
  const m = searchParams.month?.match(/^(\d{4})-(\d{2})$/);
  const monthDate = m ? new Date(Number(m[1]), Number(m[2]) - 1, 1) : new Date(now.getFullYear(), now.getMonth(), 1);

  // Pull a wide window so prev/next months have data without refetching.
  const windowStart = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
  const windowEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 2, 1);

  const events = isFan
    ? (
        await prisma.rsvp.findMany({
          where: { profileId: profile.id, event: { startAt: { gte: windowStart, lt: windowEnd } } },
          include: { event: true },
        })
      ).map((r) => r.event)
    : await prisma.event.findMany({
        where: { hostProfileId: profile.id, startAt: { gte: windowStart, lt: windowEnd } },
      });

  const upcoming = events
    .filter((e) => e.startAt >= now)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())
    .slice(0, 10);

  const buildMonthHref = (y: number, mm: number) => `/dashboard/calendar?month=${y}-${String(mm + 1).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">{isFan ? "My show calendar" : "My event calendar"}</h1>
        <p className="text-sm text-subtle">{isFan ? "Every show you've RSVP'd to." : "Your hosted events."}</p>
      </div>

      <CalendarGrid
        events={events.map((e) => ({ id: e.id, title: e.title, startAt: e.startAt, familyFriendly: e.familyFriendly, hasCoverCharge: e.hasCoverCharge }))}
        monthDate={monthDate}
        buildMonthHref={buildMonthHref}
      />

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-subtle">
            Nothing upcoming.{" "}
            <Link href={isFan ? "/" : "/dashboard/events"} className="text-brand-300 hover:text-brand-200">
              {isFan ? "Find shows →" : "Post an event →"}
            </Link>
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {upcoming.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <Link href={`/event/${e.id}`} className="font-medium text-fg hover:text-brand-200">{e.title}</Link>
                  <p className="text-sm text-subtle">{formatDate(e.startAt)} · {formatTime(e.startAt)}{e.city ? ` · ${e.city}` : ""}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
