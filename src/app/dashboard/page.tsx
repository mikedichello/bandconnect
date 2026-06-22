import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { planFor, isPro } from "@/lib/plans";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardHome() {
  const user = await requireUser();
  const isBand = user.role === "BAND";
  const profile = isBand ? user.bandProfile : user.venueProfile;
  const plan = planFor(user.plan);

  const now = new Date();
  const [upcomingShows, unread, submissionsCount, nextShows] = await Promise.all([
    prisma.event.count({ where: { ownerId: user.id, date: { gte: now } } }),
    prisma.message.count({ where: { recipientId: user.id, readAt: null } }),
    isBand && user.bandProfile
      ? prisma.submission.count({ where: { bandProfileId: user.bandProfile.id } })
      : user.venueProfile
        ? prisma.submission.count({ where: { venueProfileId: user.venueProfile.id, status: "PENDING" } })
        : Promise.resolve(0),
    prisma.event.findMany({
      where: { ownerId: user.id, date: { gte: now } },
      orderBy: { date: "asc" },
      take: 3,
    }),
  ]);

  const showLimit = plan.limits.maxEvents;
  const showsLabel = Number.isFinite(showLimit) ? `${upcomingShows}/${showLimit}` : `${upcomingShows}`;

  return (
    <div className="space-y-6">
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Upcoming shows" value={showsLabel} href="/dashboard/shows" icon="📅" />
        <StatTile
          label={isBand ? "Submissions sent" : "Pending requests"}
          value={String(submissionsCount)}
          href="/dashboard/submissions"
          icon="📨"
        />
        <StatTile label="Unread messages" value={String(unread)} href="/dashboard/messages" icon="✉️" />
      </div>

      {/* Profile callout */}
      <section className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Your public page</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {profile
                ? "Share this link anywhere — it's your home on BandConnect."
                : "Finish setting up your profile to get discovered."}
            </p>
            {profile && (
              <code className="mt-3 inline-block rounded-lg bg-black/40 px-3 py-1.5 text-xs text-brand-200">
                {process.env.NEXT_PUBLIC_APP_URL || ""}
                {isBand ? "/bands/" : "/venues/"}
                {profile.slug}
              </code>
            )}
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/profile" className="btn-ghost">Edit profile</Link>
            {profile && (
              <Link
                href={isBand ? `/bands/${profile.slug}` : `/venues/${profile.slug}`}
                target="_blank"
                className="btn-primary"
              >
                View page ↗
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard href="/dashboard/shows" icon="➕" title="Add a show" body="Put your next gig on the calendar." />
          {isBand ? (
            <ActionCard href="/discover/venues" icon="🔎" title="Find venues" body="Browse rooms and send a booking request." />
          ) : (
            <ActionCard href="/discover/bands" icon="🔎" title="Find bands" body="Discover local acts looking for gigs." />
          )}
          <ActionCard href="/dashboard/messages" icon="✉️" title="Open inbox" body="Reply to bands and venues." />
        </div>
      </section>

      {/* Next shows */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Next up</h2>
          <Link href="/dashboard/shows" className="text-sm text-brand-300 hover:text-brand-200">
            Manage shows →
          </Link>
        </div>
        {nextShows.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            No upcoming shows yet.{" "}
            <Link href="/dashboard/shows" className="text-brand-300 hover:text-brand-200">
              Add your first one.
            </Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {nextShows.map((show) => (
              <li key={show.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-white">{show.title}</p>
                  <p className="text-sm text-zinc-400">
                    {formatDate(show.date)}
                    {show.venueName ? ` · ${show.venueName}` : ""}
                    {show.city ? ` · ${show.city}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Upgrade nudge */}
      {!isPro(user.plan) && (
        <section className="relative overflow-hidden rounded-2xl border border-brand-400/30 p-6">
          <div className="aurora absolute inset-0 -z-10 opacity-70" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Unlock Pro</h2>
              <p className="mt-1 max-w-md text-sm text-zinc-300">
                Unlimited shows & submissions, custom branding, and featured
                placement in discovery — for ${planFor("PRO").priceMonthly}/mo.
              </p>
            </div>
            <Link href="/pricing" className="btn-primary whitespace-nowrap">See Pro plans</Link>
          </div>
        </section>
      )}
    </div>
  );
}

function StatTile({ label, value, href, icon }: { label: string; value: string; href: string; icon: string }) {
  return (
    <Link href={href} className="card p-5 transition hover:border-white/20">
      <div className="flex items-center justify-between">
        <span className="text-xl">{icon}</span>
      </div>
      <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-sm text-zinc-400">{label}</div>
    </Link>
  );
}

function ActionCard({ href, icon, title, body }: { href: string; icon: string; title: string; body: string }) {
  return (
    <Link href={href} className="card p-5 transition hover:border-white/20">
      <div className="text-xl">{icon}</div>
      <h3 className="mt-2 font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
    </Link>
  );
}
