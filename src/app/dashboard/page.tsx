import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isPro, planFor } from "@/lib/plans";
import { isArtist } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { OnboardingChecklist, type ChecklistStep } from "@/components/dashboard/OnboardingChecklist";

export const metadata = { title: "Dashboard" };

export default async function DashboardHome() {
  const user = await requireUser();
  const profile = user.profile!;
  const type = profile.type;
  const now = new Date();

  const [followers, following, upcomingHosted, rsvped, unreadMessages, totalHosted, totalRsvps] = await Promise.all([
    prisma.follow.count({ where: { followingId: profile.id } }),
    prisma.follow.count({ where: { followerId: profile.id } }),
    type !== "FAN"
      ? prisma.event.findMany({ where: { hostProfileId: profile.id, startAt: { gte: now } }, orderBy: { startAt: "asc" }, take: 4 })
      : Promise.resolve([]),
    prisma.rsvp.findMany({
      where: { profileId: profile.id, event: { startAt: { gte: now } } },
      orderBy: { event: { startAt: "asc" } },
      take: 4,
      include: { event: true },
    }),
    prisma.message.count({ where: { recipientId: user.id, readAt: null } }),
    type !== "FAN" ? prisma.event.count({ where: { hostProfileId: profile.id } }) : Promise.resolve(0),
    type === "FAN" ? prisma.rsvp.count({ where: { profileId: profile.id } }) : Promise.resolve(0),
  ]);

  // Onboarding checklist steps (per profile type).
  const steps: ChecklistStep[] = [
    { label: "Add a profile photo", done: Boolean(profile.avatarUrl), href: "/dashboard/profile" },
    { label: "Write a short bio", done: Boolean(profile.bio), href: "/dashboard/profile" },
    type === "FAN"
      ? { label: "RSVP to your first show", done: totalRsvps > 0, href: "/" }
      : { label: "Post your first event", done: totalHosted > 0, href: "/dashboard/events" },
    { label: `Follow 3 ${type === "FAN" ? "artists or venues" : "profiles"}`, done: following >= 3, href: type === "VENUE" ? "/artists" : "/venues" },
  ];

  return (
    <div className="space-y-6">
      <OnboardingChecklist steps={steps} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Followers" value={followers} href="/dashboard/network" icon="👥" />
        <Stat label={type === "FAN" ? "Shows RSVP'd" : "Upcoming events"} value={type === "FAN" ? rsvped.length : upcomingHosted.length} href={type === "FAN" ? "/dashboard/calendar" : "/dashboard/events"} icon="🗓️" />
        <Stat label="Unread messages" value={unreadMessages} href="/dashboard/messages" icon="✉️" />
      </div>

      {/* Public page callout */}
      <section className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Your public profile</h2>
            <code className="mt-2 inline-block rounded-lg bg-black/40 px-3 py-1.5 text-xs text-brand-200">/p/{profile.slug}</code>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/profile" className="btn-ghost">Edit</Link>
            <Link href={`/p/${profile.slug}`} target="_blank" className="btn-primary">View ↗</Link>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="mb-3 text-lg font-semibold">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {type !== "FAN" && <Action href="/dashboard/events" icon="➕" title="Post an event" body="Add your next show to the CT calendar." />}
          {type === "FAN" && <Action href="/" icon="🔎" title="Find shows" body="Browse the Connecticut live-music calendar." />}
          {type === "VENUE" && <Action href="/artists" icon="🎸" title="Find acts" body="Discover musicians & bands available for gigs." />}
          {isArtist(type) && <Action href="/venues" icon="🏛️" title="Find venues" body="Browse rooms booking live music." />}
          {isArtist(type) && <Action href="/dashboard/availability" icon="✅" title="Set availability" body="Mark your open dates for bookings." />}
          <Action href="/dashboard/messages" icon="✉️" title="Open inbox" body="Reply to your conversations." />
        </div>
      </section>

      {/* Upcoming list */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{type === "FAN" ? "Your upcoming shows" : "Your next events"}</h2>
          <Link href="/dashboard/calendar" className="text-sm text-brand-300 hover:text-brand-200">View calendar →</Link>
        </div>
        {(type === "FAN" ? rsvped.length : upcomingHosted.length) === 0 ? (
          <p className="mt-4 text-sm text-zinc-400">
            Nothing upcoming yet.{" "}
            <Link href={type === "FAN" ? "/" : "/dashboard/events"} className="text-brand-300 hover:text-brand-200">
              {type === "FAN" ? "Find a show →" : "Post an event →"}
            </Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-white/5">
            {(type === "FAN" ? rsvped.map((r) => r.event) : upcomingHosted).map((e) => (
              <li key={e.id} className="flex items-center justify-between py-3">
                <div>
                  <Link href={`/event/${e.id}`} className="font-medium text-white hover:text-brand-200">{e.title}</Link>
                  <p className="text-sm text-zinc-400">{formatDate(e.startAt)} · {formatTime(e.startAt)}{e.city ? ` · ${e.city}` : ""}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!isPro(user.plan) && (
        <section className="relative overflow-hidden rounded-2xl border border-brand-400/30 p-6">
          <div className="aurora absolute inset-0 -z-10 opacity-70" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Go Pro</h2>
              <p className="mt-1 max-w-md text-sm text-zinc-300">Unlimited events, featured placement, custom branding & more for ${planFor("PRO").priceMonthly}/mo.</p>
            </div>
            <Link href="/pricing" className="btn-primary whitespace-nowrap">See Pro</Link>
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, href, icon }: { label: string; value: number; href: string; icon: string }) {
  return (
    <Link href={href} className="card p-5 transition hover:border-white/20">
      <div className="text-xl">{icon}</div>
      <div className="mt-3 font-display text-3xl font-bold text-white">{value}</div>
      <div className="mt-1 text-sm text-zinc-400">{label}</div>
    </Link>
  );
}

function Action({ href, icon, title, body }: { href: string; icon: string; title: string; body: string }) {
  return (
    <Link href={href} className="card p-5 transition hover:border-white/20">
      <div className="text-xl">{icon}</div>
      <h3 className="mt-2 font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
    </Link>
  );
}
