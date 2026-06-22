import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { resolveCtLocation, distanceMiles } from "@/lib/ct-geo";
import { EventFilters } from "@/components/events/EventFilters";
import { EventCard, type EventCardData } from "@/components/events/EventCard";
import { CalendarGrid } from "@/components/events/CalendarGrid";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SP = {
  loc?: string;
  radius?: string;
  genre?: string;
  family?: string;
  noCover?: string;
  view?: string;
  month?: string;
};

export default async function HomePage({ searchParams }: { searchParams: SP }) {
  const me = await getCurrentProfile();
  const loggedIn = Boolean(me);
  const view = searchParams.view === "calendar" ? "calendar" : "list";

  const genre = searchParams.genre?.trim() || "";
  const family = searchParams.family === "1";
  const noCover = searchParams.noCover === "1";
  const geo = resolveCtLocation(searchParams.loc);
  const radius = Number(searchParams.radius) || 25;

  // Determine the time window.
  const now = new Date();
  let rangeStart = now;
  let rangeEnd: Date | undefined;
  let monthDate = now;
  if (view === "calendar") {
    const m = searchParams.month?.match(/^(\d{4})-(\d{2})$/);
    monthDate = m ? new Date(Number(m[1]), Number(m[2]) - 1, 1) : new Date(now.getFullYear(), now.getMonth(), 1);
    rangeStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    rangeEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
  }

  const events = await prisma.event.findMany({
    where: {
      state: "CT",
      startAt: { gte: rangeStart, ...(rangeEnd ? { lt: rangeEnd } : {}) },
      ...(genre ? { genres: { contains: genre } } : {}),
      ...(family ? { familyFriendly: true } : {}),
      ...(noCover ? { hasCoverCharge: false } : {}),
    },
    orderBy: { startAt: "asc" },
    take: view === "calendar" ? 400 : 120,
    include: {
      host: { select: { displayName: true, slug: true, type: true } },
      _count: { select: { rsvps: true } },
    },
  });

  // Geo radius filter (haversine in app code — fine at this scale).
  let filtered = events;
  if (geo) {
    filtered = events
      .map((e) => ({
        e,
        dist: e.lat != null && e.lng != null ? distanceMiles(geo.lat, geo.lng, e.lat, e.lng) : null,
      }))
      .filter(({ dist }) => dist != null && dist <= radius)
      .map(({ e }) => e);
  }

  // Viewer's RSVP statuses for the visible events.
  const rsvpMap = new Map<string, "GOING" | "MAYBE">();
  if (me && filtered.length) {
    const rsvps = await prisma.rsvp.findMany({
      where: { profileId: me.id, eventId: { in: filtered.map((e) => e.id) } },
    });
    for (const r of rsvps) rsvpMap.set(r.eventId, r.status as "GOING" | "MAYBE");
  }

  const cards: (EventCardData & { _id: string })[] = filtered.map((e) => ({
    _id: e.id,
    id: e.id,
    title: e.title,
    startAt: e.startAt,
    endAt: e.endAt,
    city: e.city,
    locationName: e.locationName,
    coverUrl: e.coverUrl,
    coverType: e.coverType,
    coverThumbUrl: e.coverThumbUrl,
    familyFriendly: e.familyFriendly,
    hasCoverCharge: e.hasCoverCharge,
    genres: e.genres,
    host: e.host,
    goingCount: e._count.rsvps,
    distanceMi: geo && e.lat != null && e.lng != null ? distanceMiles(geo.lat, geo.lng, e.lat, e.lng) : null,
  }));

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) if (v && k !== "view" && k !== "month") qs.set(k, String(v));
  const filterQs = qs.toString();
  const viewHref = (v: string) => `/?${new URLSearchParams({ ...(filterQs ? Object.fromEntries(qs) : {}), view: v }).toString()}`;
  const buildMonthHref = (y: number, m: number) => {
    const p = new URLSearchParams(filterQs);
    p.set("view", "calendar");
    p.set("month", `${y}-${String(m + 1).padStart(2, "0")}`);
    return `/?${p.toString()}`;
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="aurora absolute inset-0 -z-10" />
        <div className="container-page py-10 sm:py-12">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="badge-brand mb-3">🎶 Connecticut live music</span>
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
                What&apos;s happening tonight in CT
              </h1>
              <p className="mt-2 max-w-xl text-zinc-300">
                Every live show in Connecticut in one calendar. Filter by town, distance, genre, and more.
              </p>
            </div>
            <div className="flex gap-2">
              <Link href="/venues" className="btn-ghost">Browse venues</Link>
              <Link href="/artists" className="btn-ghost">Browse artists</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page space-y-5 py-6">
        <EventFilters resolvedLabel={geo?.label ?? null} />

        {/* View toggle + count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            {cards.length} {cards.length === 1 ? "event" : "events"}
            {geo ? ` within ${radius} mi of ${geo.label}` : " across Connecticut"}
          </p>
          <div className="inline-flex overflow-hidden rounded-full border border-white/15">
            <Link href={viewHref("list")} className={cn("px-4 py-1.5 text-sm font-semibold", view === "list" ? "bg-brand-500 text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10")}>List</Link>
            <Link href={viewHref("calendar")} className={cn("border-l border-white/15 px-4 py-1.5 text-sm font-semibold", view === "calendar" ? "bg-brand-500 text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10")}>Calendar</Link>
          </div>
        </div>

        {view === "calendar" ? (
          <CalendarGrid
            events={filtered.map((e) => ({ id: e.id, title: e.title, startAt: e.startAt, familyFriendly: e.familyFriendly, hasCoverCharge: e.hasCoverCharge }))}
            monthDate={monthDate}
            buildMonthHref={buildMonthHref}
          />
        ) : cards.length === 0 ? (
          <div className="card p-12 text-center">
            <div className="text-3xl">📅</div>
            <h2 className="mt-3 text-lg font-semibold">No events match your filters</h2>
            <p className="mt-1 text-sm text-zinc-400">Try widening your radius or clearing filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <EventCard key={c._id} event={c} rsvpStatus={rsvpMap.get(c.id) ?? null} loggedIn={loggedIn} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
