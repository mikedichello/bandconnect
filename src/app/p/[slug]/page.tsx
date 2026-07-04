import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Mail, Check, Globe, Camera, Play, Music2, Disc3, type LucideIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { ProfileTypeIcon } from "@/components/ProfileTypeIcon";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { FollowButton } from "@/components/FollowButton";
import { FriendButton } from "@/components/FriendButton";
import { MediaGallery } from "@/components/profile/MediaGallery";
import { EventCard, type EventCardData } from "@/components/events/EventCard";
import { initials, parseTags, formatRate, formatDate, spotifyEmbedUrl } from "@/lib/utils";
import { isArtist, profileTypeMeta, MUSICIAN_STATUS } from "@/lib/constants";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const p = await prisma.profile.findUnique({ where: { slug: params.slug } });
  if (!p) return { title: "Profile not found" };
  return { title: p.displayName, description: p.tagline || p.bio?.slice(0, 150) || `${p.displayName} on BandConnect` };
}

export default async function ProfilePage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const profile = await prisma.profile.findUnique({
    where: { slug: params.slug },
    include: {
      user: { select: { id: true } },
      media: { orderBy: { sortOrder: "asc" } },
      availability: { where: { date: { gte: new Date() } }, orderBy: { date: "asc" }, take: 24 },
      _count: { select: { followers: true, following: true } },
    },
  });
  if (!profile) notFound();

  const me = await getCurrentProfile();
  const loggedIn = Boolean(me);
  const isOwner = me?.id === profile.id;
  const accent = profile.themeColor || "#7c4dff";
  const meta = profileTypeMeta(profile.type);

  const following = me
    ? Boolean(await prisma.follow.findUnique({ where: { followerId_followingId: { followerId: me.id, followingId: profile.id } } }))
    : false;

  // Friend state (fan ↔ fan).
  let friendState: "none" | "pending_out" | "pending_in" | "accepted" = "none";
  if (me && me.type === "FAN" && profile.type === "FAN" && !isOwner) {
    const f = await prisma.friendship.findFirst({
      where: { OR: [{ requesterId: me.id, addresseeId: profile.id }, { requesterId: profile.id, addresseeId: me.id }] },
    });
    if (f) friendState = f.status === "ACCEPTED" ? "accepted" : f.requesterId === me.id ? "pending_out" : "pending_in";
  }

  // Upcoming hosted events.
  const events = await prisma.event.findMany({
    where: { hostProfileId: profile.id, startAt: { gte: new Date() } },
    orderBy: { startAt: "asc" },
    take: 6,
    include: { host: { select: { displayName: true, slug: true, type: true } }, _count: { select: { rsvps: true } } },
  });
  const rsvpMap = new Map<string, "GOING" | "MAYBE">();
  if (me && events.length) {
    const rs = await prisma.rsvp.findMany({ where: { profileId: me.id, eventId: { in: events.map((e) => e.id) } } });
    for (const r of rs) rsvpMap.set(r.eventId, r.status as "GOING" | "MAYBE");
  }

  // Fan: who they follow.
  const fanFollows = profile.type === "FAN"
    ? await prisma.follow.findMany({
        where: { followerId: profile.id },
        take: 18,
        include: { following: { select: { displayName: true, slug: true, type: true, avatarUrl: true } } },
      })
    : [];

  const spotifyEmbed = isArtist(profile.type) ? spotifyEmbedUrl(profile.spotify) : null;
  const genres = parseTags(profile.genres);
  const instruments = parseTags(profile.instruments);
  const rate = !profile.rateHidden ? formatRate(profile.rateMin, profile.rateMax) : null;
  const loginHref = `/login?callbackUrl=/p/${profile.slug}`;

  const eventCards: EventCardData[] = events.map((e) => ({
    id: e.id, title: e.title, startAt: e.startAt, endAt: e.endAt, city: e.city, locationName: e.locationName,
    coverUrl: e.coverUrl, coverType: e.coverType, coverThumbUrl: e.coverThumbUrl, familyFriendly: e.familyFriendly,
    hasCoverCharge: e.hasCoverCharge, genres: e.genres, host: e.host, goingCount: e._count.rsvps,
  }));

  return (
    <article>
      {/* Hero */}
      <header className="relative">
        <div className="h-44 w-full overflow-hidden sm:h-56" style={{ backgroundColor: `${accent}22` }}>
          <ImageWithFallback
            src={profile.bannerUrl}
            alt=""
            className="h-full w-full object-cover"
            fallback={<div className="h-full w-full" style={{ background: `radial-gradient(60% 120% at 20% 0%, ${accent}55, transparent 60%), radial-gradient(50% 100% at 90% 10%, ${accent}33, transparent 60%)` }} />}
          />
        </div>
        <div className="container-page">
          <div className="relative -mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="grid h-24 w-24 flex-shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-app bg-surface" style={{ boxShadow: `0 0 40px -10px ${accent}` }}>
                <ImageWithFallback
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                  fallback={<span className="font-display text-2xl font-bold" style={{ color: accent }}>{initials(profile.displayName)}</span>}
                />
              </div>
              <div className="pb-1">
                <span className="badge text-[11px]">
                  <ProfileTypeIcon icon={meta.icon} className="h-3 w-3" />
                  {meta.label}
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <h1 className="font-display text-3xl font-bold text-fg">{profile.displayName}</h1>
                  {profile.verified && <VerifiedBadge showLabel />}
                </div>
                {profile.tagline && <p className="text-muted">{profile.tagline}</p>}
                {profile.city && (
                  <p className="flex items-center gap-1.5 text-sm text-subtle">
                    <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    {profile.city}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pb-1">
              {isOwner ? (
                <Link href="/dashboard/profile" className="btn-ghost px-4 py-2 text-sm">Edit profile</Link>
              ) : (
                <>
                  <FollowButton targetProfileId={profile.id} initialFollowing={following} loggedIn={loggedIn} loginHref={loginHref} />
                  {me && me.type === "FAN" && profile.type === "FAN" && (
                    <FriendButton targetProfileId={profile.id} initialState={friendState} loggedIn={loggedIn} loginHref={loginHref} />
                  )}
                  {loggedIn ? (
                    <Link href={`/dashboard/messages?to=${profile.user.id}`} className="btn-primary px-4 py-2 text-sm">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      Message
                    </Link>
                  ) : (
                    <Link href={loginHref} className="btn-primary px-4 py-2 text-sm">
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      Message
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {profile.availableForGigs && <span className="badge-green">Available for gigs</span>}
            {rate && <span className="badge">{rate}</span>}
            <span className="badge">{profile._count.followers} followers</span>
          </div>
        </div>
      </header>
      <div className="container-page grid gap-8 py-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {profile.bio && (
            <section>
              <h2 className="mb-2 text-xl font-bold">{profile.type === "VENUE" ? "About the venue" : "About"}</h2>
              <p className="whitespace-pre-wrap text-muted">{profile.bio}</p>
            </section>
          )}

          {spotifyEmbed && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Listen</h2>
              <iframe
                src={spotifyEmbed}
                title={`${profile.displayName} on Spotify`}
                width="100%"
                height="352"
                loading="lazy"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                className="rounded-2xl border border-line bg-surface"
              />
            </section>
          )}

          {events.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Upcoming events</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {eventCards.map((e) => (
                  <EventCard key={e.id} event={e} rsvpStatus={rsvpMap.get(e.id) ?? null} loggedIn={loggedIn} />
                ))}
              </div>
            </section>
          )}

          {profile.media.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Media</h2>
              <MediaGallery items={profile.media} />
            </section>
          )}

          {/* Fan: following */}
          {profile.type === "FAN" && fanFollows.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold">Following</h2>
              <div className="flex flex-wrap gap-2">
                {fanFollows.map((f) => (
                  <Link key={f.id} href={`/p/${f.following.slug}`} className="badge hover:border-line hover:text-fg">
                    {f.following.displayName}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {(genres.length > 0 || instruments.length > 0) && (
            <div className="card p-5">
              {genres.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-subtle">{profile.type === "VENUE" ? "Genres booked" : "Genres"}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">{genres.map((g) => <span key={g} className="badge">{g}</span>)}</div>
                </>
              )}
              {instruments.length > 0 && (
                <>
                  <h3 className="mt-4 text-sm font-semibold uppercase tracking-wide text-subtle">Instruments</h3>
                  <div className="mt-2 flex flex-wrap gap-2">{instruments.map((g) => <span key={g} className="badge">{g}</span>)}</div>
                </>
              )}
            </div>
          )}

          {/* Artist availability */}
          {isArtist(profile.type) && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-subtle">Availability</h3>
              <p className="mt-2 text-sm">
                {profile.availableForGigs ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    Available for gigs
                  </span>
                ) : (
                  <span className="text-subtle">Not currently booking</span>
                )}
              </p>
              {rate && <p className="mt-1 text-sm text-muted">Rate: {rate}</p>}
              {profile.type === "MUSICIAN" && (
                <ul className="mt-3 space-y-1 text-sm text-muted">
                  {MUSICIAN_STATUS.filter((s) => (profile as Record<string, unknown>)[s.key]).map((s) => (
                    <li key={s.key}>• {s.label}</li>
                  ))}
                </ul>
              )}
              {profile.type === "BAND" && profile.needsMusicians && (
                <p className="mt-3 text-sm text-brand-700 dark:text-brand-200">Looking for musicians to join</p>
              )}
              {profile.availability.length > 0 && (
                <>
                  <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-subtle">Open dates</h4>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {profile.availability.slice(0, 10).map((a) => (
                      <span key={a.id} className="badge text-[11px]">{formatDate(a.date).replace(/,.*/, "")}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Details */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-subtle">Details</h3>
            <dl className="mt-3 space-y-2 text-sm">
              {profile.city && <Row label="Location" value={profile.city} />}
              {profile.address && <Row label="Address" value={profile.address} />}
              <Row label="Following" value={String(profile._count.following)} />
              <Row label="Followers" value={String(profile._count.followers)} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.websiteUrl && <SocialLink href={profile.websiteUrl} icon={Globe} label="Website" />}
              {profile.instagram && <SocialLink href={profile.instagram.startsWith("http") ? profile.instagram : `https://instagram.com/${profile.instagram.replace(/^@/, "")}`} icon={Camera} label="Instagram" />}
              {profile.spotify && <SocialLink href={profile.spotify} icon={Music2} label="Spotify" />}
              {profile.youtube && <SocialLink href={profile.youtube} icon={Play} label="YouTube" />}
              {profile.bandcamp && <SocialLink href={profile.bandcamp} icon={Disc3} label="Bandcamp" />}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-subtle">{label}</dt>
      <dd className="text-right text-fg">{value}</dd>
    </div>
  );
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="badge hover:border-line hover:text-fg">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </a>
  );
}
