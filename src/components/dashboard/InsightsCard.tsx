import Link from "next/link";
import { ChartNoAxesColumn, Lock, MapPin, TrendingDown, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { planFor } from "@/lib/plans";

const DAY = 86_400_000;

/**
 * Pro "Insights" for hosts (venues, musicians, bands): follower growth, RSVP
 * demand on upcoming shows, top show, and where followers live — the data an act
 * needs to pitch a room ("40 of my followers are within 15 mi of you").
 * Free plans see the first metric plus a locked preview of the rest.
 */
export async function InsightsCard({ profileId, pro }: { profileId: string; pro: boolean }) {
  const now = new Date();
  const d30 = new Date(now.getTime() - 30 * DAY);
  const d60 = new Date(now.getTime() - 60 * DAY);

  const [newFollowers, prevFollowers, rsvpsByStatus, topShows, followerTowns] = await Promise.all([
    prisma.follow.count({ where: { followingId: profileId, createdAt: { gte: d30 } } }),
    prisma.follow.count({ where: { followingId: profileId, createdAt: { gte: d60, lt: d30 } } }),
    pro
      ? prisma.rsvp.groupBy({
          by: ["status"],
          where: { event: { hostProfileId: profileId, startAt: { gte: now } } },
          _count: true,
        })
      : Promise.resolve([]),
    pro
      ? prisma.event.findMany({
          where: { hostProfileId: profileId, startAt: { gte: now } },
          select: { id: true, title: true, _count: { select: { rsvps: true } } },
          orderBy: { rsvps: { _count: "desc" } },
          take: 1,
        })
      : Promise.resolve([]),
    pro
      ? prisma.profile.groupBy({
          by: ["city"],
          where: { following: { some: { followingId: profileId } }, city: { not: null } },
          _count: true,
          orderBy: { _count: { city: "desc" } },
          take: 3,
        })
      : Promise.resolve([]),
  ]);

  const going = rsvpsByStatus.find((r) => r.status === "GOING")?._count ?? 0;
  const maybe = rsvpsByStatus.find((r) => r.status === "MAYBE")?._count ?? 0;
  const delta = newFollowers - prevFollowers;
  const top = topShows[0];

  return (
    <section className="card p-6" aria-labelledby="insights-h">
      <div className="flex items-center justify-between gap-3">
        <h2 id="insights-h" className="flex items-center gap-2 text-lg font-semibold">
          <ChartNoAxesColumn className="h-5 w-5 text-brand-600 dark:text-brand-300" aria-hidden="true" /> Insights
        </h2>
        <span className="text-xs text-subtle">Last 30 days</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="New followers">
          <span className="font-display text-3xl font-bold text-fg">{newFollowers}</span>
          {delta !== 0 && (
            <span className={delta > 0 ? "ml-2 inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300" : "ml-2 inline-flex items-center gap-0.5 text-xs font-semibold text-red-700 dark:text-red-300"}>
              {delta > 0 ? <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />}
              {delta > 0 ? "+" : ""}{delta} vs prior 30d
            </span>
          )}
        </Metric>

        {pro ? (
          <>
            <Metric label="RSVPs on upcoming shows">
              <span className="font-display text-3xl font-bold text-fg">{going}</span>
              <span className="ml-2 text-xs text-subtle">going · {maybe} interested</span>
            </Metric>
            <Metric label="Top upcoming show">
              {top ? (
                <Link href={`/event/${top.id}`} className="link line-clamp-2 text-sm font-semibold">
                  {top.title} <span className="font-normal text-subtle">· {top._count.rsvps} RSVPs</span>
                </Link>
              ) : (
                <span className="text-sm text-subtle">No upcoming shows</span>
              )}
            </Metric>
            <Metric label="Where your followers are">
              {followerTowns.length ? (
                <ul className="space-y-0.5 text-sm text-fg">
                  {followerTowns.map((t) => (
                    <li key={t.city} className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-subtle" aria-hidden="true" /> {t.city}
                      <span className="text-subtle">· {t._count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-sm text-subtle">Not enough data yet</span>
              )}
            </Metric>
          </>
        ) : (
          <div className="relative overflow-hidden rounded-xl border border-dashed border-brand-400/40 p-4 sm:col-span-1 lg:col-span-3">
            <div className="flex h-full flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-fg">
                  <Lock className="h-4 w-4 text-brand-600 dark:text-brand-300" aria-hidden="true" /> RSVP demand, top show & follower towns
                </p>
                <p className="mt-1 max-w-md text-sm text-subtle">
                  See who&apos;s coming and where your fans live — proof you can fill a room when you pitch a venue.
                </p>
              </div>
              <Link href="/dashboard/billing" className="btn-primary whitespace-nowrap px-4 py-2 text-sm">
                Unlock with Pro · ${planFor("PRO").priceMonthly}/mo
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-input/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</p>
      <div className="mt-2 flex flex-wrap items-baseline">{children}</div>
    </div>
  );
}
