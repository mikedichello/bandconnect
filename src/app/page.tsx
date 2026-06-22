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
  when?: string;
  lat?: string;
  lng?: string;
  feed?: string;
};

const WHEN_OPTIONS = [
  { key: "", label: "Upcoming" },
  { key: "tonight", label: "Tonight" },
  { key: "weekend", label: "This weekend" },
  { key: "week", label: "This week" },
];

/** Compute the [start, end) window for a quick date filter. */
function whenWindow(when: string | undefined, now: Date): { start: Date; end?: Date } {
  if (when === "tonight") {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start: now, end };
  }
  if (when === "week") {
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { start: now, end };
  }
  if (when === "weekend") {
    const day = now.getDay(); // 0 Sun … 6 Sat
    const inWeekend = day === 5 || day === 6 || day === 0;
    const start = new Date(now);
    if (!inWeekend) start.setDate(now.getDate() + ((5 - day + 7) % 7)); // next Friday
    if (!inWeekend) start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    const toSunday = (7 - end.getDay()) % 7; // days until Sunday
    end.setDate(end.getDate() + toSunday);
    end.setHours(23, 59, 59, 999);
    return { start: inWeekend ? now : start, end };
  }
  return { start: now };
}

export default async function HomePage({ searchParams }: { searchParams: SP }) {
  const me = await getCurrentProfile();
  const loggedIn = Boolean(me);
  const view = searchParams.view === "calendar" ? "calendar" : "list";

  const genre = searchParams.genre?.trim() || "";
  const family = searchParams.family === "1";
  const noCover = searchParams.noCover === "1";
  const when = searchParams.when || "";

  // Geo center: explicit lat/lng (from "use my location") wins over a typed town/ZIP.
  const lat = Number(searchParams.lat);
  const lng = Number(searchParams.lng);
  const geo =
    !Number.isNaN(lat) && !Number.isNaN(lng) && searchParams.lat && searchParams.lng
      ? { lat, lng, label: "your location" }
      : resolveCtLocation(searchParams.loc);
  const radius = Number(searchParams.radius) || 25;

  // "Following" feed: events hosted by profiles the viewer follows.
  const followingMode = searchParams.feed === "following" && Boolean(me);
  let followIds: string[] = [];
  if (followingMode && me) {
    followIds = (
      await prisma.follow.findMany({ where: { followerId: me.id }, select: { followingId: true } })
    ).map((f) => f.followingId);
  }

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
  } else {
    const w = whenWindow(when, now);
    rangeStart = w.start;
    rangeEnd = w.end;
  }

  const events = followingMode && followIds.length === 0
    ? []
    : await prisma.event.findMany({
    where: {
      state: "CT",
      startAt: { gte: rangeStart, ...(rangeEnd ? { lt: rangeEnd } : {}) },
      ...(followingMode ? { hostProfileId: { in: followIds } } : {}),
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
  const whenHref = (k: string) => {
    const p = new URLSearchParams(filterQs);
    p.delete("when");
    p.delete("month");
    p.set("view", "list");
    if (k) p.set("when", k);
    return `/?${p.toString()}`;
  };
  const feedHref = (f: string) => {
    const p = new URLSearchParams(filterQs);
    p.delete("feed");
    if (f === "following") p.set("feed", "following");
    return `/?${p.toString()}`;
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div className="aurora absolute inset-0 -z-10" />
        <div className="container-page py-10 sm:py-12">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="badge-brand mb-3">🎶 Connecticut live music</span>
              <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
                {followingMode ? "From who you follow" : "What's happening tonight in CT"}
              </h1>
              <p className="mt-2 max-w-xl text-muted">
                {followingMode
                  ? "Upcoming shows from the venues and artists you follow."
                  : "Every live show in Connecticut in one calendar. Filter by town, distance, genre, and more."}
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
        {/* Feed tabs (signed-in) */}
        {loggedIn && (
          <div className="inline-flex overflow-hidden rounded-full border border-line" role="tablist" aria-label="Feed">
            <Link href={feedHref("all")} role="tab" aria-selected={!followingMode} className={cn("px-5 py-2 text-sm font-semibold", !followingMode ? "bg-brand-500 text-white" : "bg-elevated text-muted hover:text-fg")}>All events</Link>
            <Link href={feedHref("following")} role="tab" aria-selected={followingMode} className={cn("border-l border-line px-5 py-2 text-sm font-semibold", followingMode ? "bg-brand-500 text-white" : "bg-elevated text-muted hover:text-fg")}>Following</Link>
          </div>
        )}

        <EventFilters resolvedLabel={geo?.label ?? null} />

        {/* Date quick-filters (list view) */}
        {view === "list" && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Date filter">
            {WHEN_OPTIONS.map((o) => (
              <Link
                key={o.key || "all"}
                href={whenHref(o.key)}
                aria-current={when === o.key ? "true" : undefined}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                  when === o.key
                    ? "border-brand-400/60 bg-brand-500/20 text-fg"
                    : "border-line bg-input text-muted hover:border-line",
                )}
              >
                {o.label}
              </Link>
            ))}
          </div>
        )}

        {/* View toggle + count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-subtle">
            {cards.length} {cards.length === 1 ? "event" : "events"}
            {followingMode ? " from who you follow" : geo ? ` within ${radius} mi of ${geo.label}` : " across Connecticut"}
          </p>
          <div className="inline-flex overflow-hidden rounded-full border border-line">
            <Link href={viewHref("list")} className={cn("px-4 py-1.5 text-sm font-semibold", view === "list" ? "bg-brand-500 text-white" : "bg-elevated text-muted hover:bg-elevated")}>List</Link>
            <Link href={viewHref("calendar")} className={cn("border-l border-line px-4 py-1.5 text-sm font-semibold", view === "calendar" ? "bg-brand-500 text-white" : "bg-elevated text-muted hover:bg-elevated")}>Calendar</Link>
          </div>
        </div>

        {view === "calendar" ? (
          <CalendarGrid
            events={filtered.map((e) => ({ id: e.id, title: e.title, startAt: e.startAt, familyFriendly: e.familyFriendly, hasCoverCharge: e.hasCoverCharge }))}
            monthDate={monthDate}
            buildMonthHref={buildMonthHref}
          />
        ) : cards.length === 0 ? (
          followingMode ? (
            <div className="card p-12 text-center">
              <div className="text-3xl">🫶</div>
              <h2 className="mt-3 text-lg font-semibold">Your feed is quiet</h2>
              <p className="mx-auto mt-1 max-w-sm text-sm text-subtle">
                {followIds.length === 0
                  ? "You're not following anyone yet. Follow venues and artists to see their shows here."
                  : "No upcoming shows from who you follow right now — check back soon."}
              </p>
              <div className="mt-5 flex justify-center gap-2">
                <Link href="/venues" className="btn-ghost">Find venues</Link>
                <Link href="/artists" className="btn-primary">Find artists</Link>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-3xl">📅</div>
              <h2 className="mt-3 text-lg font-semibold">No events match your filters</h2>
              <p className="mt-1 text-sm text-subtle">Try widening your radius or clearing filters.</p>
            </div>
          )
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
