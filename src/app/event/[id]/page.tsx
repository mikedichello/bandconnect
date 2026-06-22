import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { RsvpButton } from "@/components/RsvpButton";
import { FollowButton } from "@/components/FollowButton";
import { ShareButton } from "@/components/ShareButton";
import { ShareToFriend } from "@/components/events/ShareToFriend";
import { AddToCalendar } from "@/components/events/AddToCalendar";
import { formatDate, formatTime, parseTags, initials, toEmbedUrl } from "@/lib/utils";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const event = await prisma.event.findUnique({ where: { id: params.id } });
  if (!event) return { title: "Event not found" };
  return { title: event.title, description: event.description?.slice(0, 150) ?? "Live music in Connecticut" };
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      host: true,
      rsvps: { include: { profile: { select: { displayName: true, slug: true, avatarUrl: true } } } },
    },
  });
  if (!event) notFound();

  const me = await getCurrentProfile();
  const loggedIn = Boolean(me);

  const myRsvp = me ? event.rsvps.find((r) => r.profileId === me.id)?.status ?? null : null;
  const going = event.rsvps.filter((r) => r.status === "GOING");
  const maybe = event.rsvps.filter((r) => r.status === "MAYBE");

  const following = me
    ? Boolean(await prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: me.id, followingId: event.hostProfileId } },
      }))
    : false;

  // Fans can share this event with their friends.
  const friendRows = me && me.type === "FAN"
    ? await prisma.friendship.findMany({
        where: { status: "ACCEPTED", OR: [{ requesterId: me.id }, { addresseeId: me.id }] },
        include: { requester: { select: { id: true, displayName: true } }, addressee: { select: { id: true, displayName: true } } },
      })
    : [];
  const friends = friendRows.map((f) => (f.requesterId === me!.id ? f.addressee : f.requester));

  const tags = parseTags(event.genres);
  const accent = event.host.themeColor || "#7c4dff";

  // schema.org MusicEvent for Google event rich results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: event.title,
    startDate: event.startAt.toISOString(),
    ...(event.endAt ? { endDate: event.endAt.toISOString() } : {}),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(event.coverType === "IMAGE" && event.coverUrl ? { image: [event.coverUrl] } : {}),
    ...(event.description ? { description: event.description } : {}),
    location: {
      "@type": "Place",
      name: event.locationName ?? "Venue TBA",
      address: {
        "@type": "PostalAddress",
        ...(event.address ? { streetAddress: event.address } : {}),
        ...(event.city ? { addressLocality: event.city } : {}),
        addressRegion: "CT",
        ...(event.zip ? { postalCode: event.zip } : {}),
        addressCountry: "US",
      },
    },
    organizer: { "@type": "Organization", name: event.host.displayName, url: `${BASE}/p/${event.host.slug}` },
    offers: {
      "@type": "Offer",
      price: event.hasCoverCharge ? undefined : "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${BASE}/event/${event.id}`,
    },
    url: `${BASE}/event/${event.id}`,
  };

  return (
    <article className="container-page py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/" className="text-sm text-subtle hover:text-fg">← Back to calendar</Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {/* Cover */}
          <div className="overflow-hidden rounded-2xl border border-line bg-brand-500/10">
            {event.coverType === "VIDEO" && event.coverUrl ? (
              <VideoEmbed url={event.coverUrl} />
            ) : (
              <div className="aspect-[16/9] w-full">
                <ImageWithFallback
                  src={event.coverUrl}
                  alt={event.title}
                  className="h-full w-full object-cover"
                  fallback={
                    <div
                      className="grid h-full w-full place-items-center text-5xl"
                      style={{ background: `radial-gradient(60% 100% at 30% 0%, ${accent}44, transparent 60%)` }}
                    >
                      🎵
                    </div>
                  }
                />
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {event.familyFriendly && <span className="badge-green">👨‍👩‍👧 Family friendly</span>}
            <span className={event.hasCoverCharge ? "badge" : "badge-accent"}>
              {event.hasCoverCharge ? "Cover charge" : "Free — no cover"}
            </span>
            {tags.map((t) => (
              <span key={t} className="badge">{t}</span>
            ))}
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold text-fg sm:text-4xl">{event.title}</h1>

          <p className="mt-3 text-lg text-fg">
            🗓️ {formatDate(event.startAt)} · {formatTime(event.startAt)}
            {event.endAt ? ` – ${formatTime(event.endAt)}` : ""}
          </p>
          {(event.locationName || event.city) && (
            <p className="mt-1 text-subtle">
              📍 {event.locationName ?? ""}{event.locationName && event.city ? " · " : ""}
              {event.city ? `${event.city}, CT` : ""}
              {event.address ? ` · ${event.address}` : ""}
            </p>
          )}

          {event.description && (
            <div className="mt-6">
              <h2 className="mb-2 text-lg font-bold">About this event</h2>
              <p className="whitespace-pre-wrap text-muted">{event.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="card p-5">
            <p className="text-sm text-subtle">Are you going?</p>
            <div className="mt-3">
              <RsvpButton
                eventId={event.id}
                initialStatus={myRsvp as "GOING" | "MAYBE" | null}
                loggedIn={loggedIn}
                loginHref={`/login?callbackUrl=/event/${event.id}`}
              />
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <span className="text-emerald-300">{going.length} going</span>
              <span className="text-amber-300">{maybe.length} interested</span>
            </div>
            <div className="mt-4 space-y-2">
              <ShareButton title={event.title} />
              <ShareToFriend eventId={event.id} friends={friends} />
            </div>
          </div>

          <AddToCalendar event={event} />

          {/* Host */}
          <div className="card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Hosted by</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-200">
                {initials(event.host.displayName)}
              </span>
              <div className="min-w-0">
                <Link href={`/p/${event.host.slug}`} className="block truncate font-semibold text-fg hover:text-brand-200">
                  {event.host.displayName}
                </Link>
                <p className="text-xs capitalize text-subtle">{event.host.type.toLowerCase()}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <FollowButton
                targetProfileId={event.hostProfileId}
                initialFollowing={following}
                loggedIn={loggedIn}
                loginHref={`/login?callbackUrl=/event/${event.id}`}
              />
              {me && me.id !== event.hostProfileId && (
                <Link href={`/dashboard/messages?to=${event.host.userId}`} className="btn-ghost px-4 py-2 text-sm">Message</Link>
              )}
            </div>
          </div>

          {/* Attendees */}
          {going.length > 0 && (
            <div className="card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Who&apos;s going</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {going.slice(0, 12).map((r) => (
                  <Link
                    key={r.id}
                    href={`/p/${r.profile.slug}`}
                    title={r.profile.displayName}
                    className="grid h-9 w-9 place-items-center rounded-full bg-elevated text-xs font-bold text-fg hover:bg-elevated"
                  >
                    {initials(r.profile.displayName)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}

function VideoEmbed({ url }: { url: string }) {
  const embed = toEmbedUrl(url);
  if (embed.kind === "iframe") {
    return (
      <div className="aspect-video w-full">
        <iframe src={embed.src} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="Event video" />
      </div>
    );
  }
  return (
    <video controls className="aspect-video w-full bg-black">
      <source src={embed.src} />
    </video>
  );
}
