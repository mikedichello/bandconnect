import Link from "next/link";
import { Eye, UserPlus, Users, Ticket, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { PLANS, type PlanId } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

const DAYS = 30;

export default async function AnalyticsPage() {
  const user = await requireUser();
  const profile = user.profile;
  if (!profile) return null;

  const plan = PLANS[(user.plan as PlanId) in PLANS ? (user.plan as PlanId) : "FREE"];
  if (!plan.limits.analytics) {
    return (
      <div className="card p-10 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-elevated">
          <BarChart3 className="h-6 w-6 text-subtle" aria-hidden="true" />
        </div>
        <h1 className="mt-3 text-xl font-bold">Analytics is a Pro feature</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-subtle">
          See who&apos;s viewing your page, how your shows convert to RSVPs, and how your
          audience grows week over week.
        </p>
        <Link href="/pricing" className="btn-primary mt-5 inline-flex px-5 py-2.5 text-sm">
          Upgrade to Pro
        </Link>
      </div>
    );
  }

  const since = new Date(Date.now() - DAYS * 24 * 60 * 60 * 1000);

  const events = await prisma.event.findMany({
    where: { hostProfileId: profile.id },
    orderBy: { startAt: "desc" },
    take: 20,
    select: { id: true, title: true, startAt: true },
  });
  const eventIds = events.map((e) => e.id);

  const [profileViews, eventViews, followersTotal, followersNew, rsvpGroups] = await Promise.all([
    prisma.pageView.findMany({
      where: { targetType: "PROFILE", targetId: profile.id, createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    eventIds.length
      ? prisma.pageView.groupBy({
          by: ["targetId"],
          where: { targetType: "EVENT", targetId: { in: eventIds } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    prisma.follow.count({ where: { followingId: profile.id } }),
    prisma.follow.count({ where: { followingId: profile.id, createdAt: { gte: since } } }),
    eventIds.length
      ? prisma.rsvp.groupBy({
          by: ["eventId", "status"],
          where: { eventId: { in: eventIds } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
  ]);

  // Daily profile-view buckets for the last 30 days (local time).
  const days: { key: string; label: string; count: number }[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      key: d.toDateString(),
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: 0,
    });
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  for (const v of profileViews) {
    const b = byKey.get(new Date(v.createdAt).toDateString());
    if (b) b.count += 1;
  }

  const viewsByEvent = new Map(eventViews.map((v) => [v.targetId, v._count._all]));
  const rsvpByEvent = new Map<string, { going: number; maybe: number }>();
  for (const g of rsvpGroups) {
    const row = rsvpByEvent.get(g.eventId) ?? { going: 0, maybe: 0 };
    if (g.status === "GOING") row.going = g._count._all;
    if (g.status === "MAYBE") row.maybe = g._count._all;
    rsvpByEvent.set(g.eventId, row);
  }

  const totalEventViews = [...viewsByEvent.values()].reduce((a, b) => a + b, 0);
  const totalGoing = [...rsvpByEvent.values()].reduce((a, b) => a + b.going, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-subtle">Last {DAYS} days · updates as people visit your pages.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={<Eye className="h-4 w-4" aria-hidden="true" />} label="Profile views" value={profileViews.length} />
        <Stat icon={<UserPlus className="h-4 w-4" aria-hidden="true" />} label="New followers" value={followersNew} />
        <Stat icon={<Users className="h-4 w-4" aria-hidden="true" />} label="Total followers" value={followersTotal} />
        <Stat icon={<Ticket className="h-4 w-4" aria-hidden="true" />} label="Event views (all time)" value={totalEventViews} />
      </div>

      <section className="card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">Daily profile views</h2>
        <ViewsChart days={days} />
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-subtle">View as table</summary>
          <div className="mt-2 max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-subtle"><th className="py-1 font-medium">Day</th><th className="py-1 font-medium">Views</th></tr>
              </thead>
              <tbody>
                {days.map((d) => (
                  <tr key={d.key} className="border-t border-line/50"><td className="py-1">{d.label}</td><td className="py-1">{d.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <section className="card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-subtle">Events: views → RSVPs</h2>
        {events.length === 0 ? (
          <p className="mt-3 text-sm text-subtle">No events yet — post a show to start collecting stats.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-left text-subtle">
                  <th className="py-2 font-medium">Event</th>
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 text-right font-medium">Views</th>
                  <th className="py-2 text-right font-medium">Going</th>
                  <th className="py-2 text-right font-medium">Maybe</th>
                  <th className="py-2 text-right font-medium">View → RSVP</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => {
                  const views = viewsByEvent.get(e.id) ?? 0;
                  const r = rsvpByEvent.get(e.id) ?? { going: 0, maybe: 0 };
                  const conv = views > 0 ? Math.round(((r.going + r.maybe) / views) * 100) : null;
                  return (
                    <tr key={e.id} className="border-t border-line/50">
                      <td className="max-w-[220px] truncate py-2 pr-3">
                        <Link href={`/event/${e.id}`} className="link">{e.title}</Link>
                      </td>
                      <td className="whitespace-nowrap py-2 pr-3 text-muted">{formatDate(e.startAt)}</td>
                      <td className="py-2 text-right tabular-nums">{views}</td>
                      <td className="py-2 text-right tabular-nums">{r.going}</td>
                      <td className="py-2 text-right tabular-nums">{r.maybe}</td>
                      <td className="py-2 text-right tabular-nums text-muted">{conv === null ? "—" : `${conv}%`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalGoing > 0 && (
          <p className="mt-3 text-xs text-subtle">{totalGoing} people have RSVP&apos;d &quot;going&quot; across your shows.</p>
        )}
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="card p-4">
      <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-subtle">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}

/**
 * Server-rendered single-series bar chart. Colors are the brand steps
 * validated for ≥3:1 contrast on each theme's surface (brand-600 on light,
 * brand-400 on dark); the peak day carries a direct label, every bar a
 * hover <title>.
 */
function ViewsChart({ days }: { days: { key: string; label: string; count: number }[] }) {
  const W = 900;
  const H = 180;
  const PAD_BOTTOM = 22;
  const PAD_TOP = 16;
  const max = Math.max(1, ...days.map((d) => d.count));
  const gap = 2;
  const barW = (W - gap * (days.length - 1)) / days.length;
  const peakIdx = days.reduce((best, d, i) => (d.count > days[best].count ? i : best), 0);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="mt-3 h-44 w-full"
      role="img"
      aria-label={`Daily profile views over the last ${days.length} days; peak ${days[peakIdx].count} on ${days[peakIdx].label}`}
    >
      {/* recessive baseline */}
      <line x1={0} y1={H - PAD_BOTTOM} x2={W} y2={H - PAD_BOTTOM} className="stroke-line" strokeWidth={1} />
      {days.map((d, i) => {
        const h = d.count === 0 ? 2 : Math.max(3, ((H - PAD_BOTTOM - PAD_TOP) * d.count) / max);
        const x = i * (barW + gap);
        const y = H - PAD_BOTTOM - h;
        return (
          <g key={d.key}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={Math.min(4, barW / 2)}
              className={d.count === 0 ? "fill-line" : "fill-brand-600 dark:fill-brand-400"}
            >
              <title>{`${d.label}: ${d.count} view${d.count === 1 ? "" : "s"}`}</title>
            </rect>
            {i === peakIdx && d.count > 0 && (
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" className="fill-muted text-[11px] tabular-nums">
                {d.count}
              </text>
            )}
          </g>
        );
      })}
      <text x={0} y={H - 6} className="fill-subtle text-[11px]">{days[0].label}</text>
      <text x={W} y={H - 6} textAnchor="end" className="fill-subtle text-[11px]">{days[days.length - 1].label}</text>
    </svg>
  );
}
