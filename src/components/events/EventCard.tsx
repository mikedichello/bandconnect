import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { RsvpButton } from "@/components/RsvpButton";
import { formatTime, parseTags, initials } from "@/lib/utils";

export interface EventCardData {
  id: string;
  title: string;
  startAt: Date;
  endAt: Date | null;
  city: string | null;
  locationName: string | null;
  coverUrl: string | null;
  coverType: string;
  coverThumbUrl: string | null;
  familyFriendly: boolean;
  hasCoverCharge: boolean;
  genres: string | null;
  host: { displayName: string; slug: string; type: string };
  goingCount?: number;
  distanceMi?: number | null;
}

export function EventCard({
  event,
  rsvpStatus,
  loggedIn,
}: {
  event: EventCardData;
  rsvpStatus: "GOING" | "MAYBE" | null;
  loggedIn: boolean;
}) {
  const thumb = event.coverType === "VIDEO" ? event.coverThumbUrl : event.coverUrl;
  const tags = parseTags(event.genres).slice(0, 3);

  return (
    <div className="card overflow-hidden transition hover:border-line">
      <Link href={`/event/${event.id}`} className="block">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-500/10">
          <ImageWithFallback
            src={thumb}
            alt={event.title}
            className="h-full w-full object-cover"
            fallback={
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-500/25 to-accent/15 text-3xl">
                🎵
              </div>
            }
          />
          {event.coverType === "VIDEO" && (
            <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">▶ Video</span>
          )}
          <div className="absolute bottom-2 left-2 flex gap-1.5">
            {event.familyFriendly && <span className="badge-green text-[10px]">👨‍👩‍👧 Family</span>}
            <span className={event.hasCoverCharge ? "badge text-[10px]" : "badge-accent text-[10px]"}>
              {event.hasCoverCharge ? "Cover" : "No cover"}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-300">
              {event.startAt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {formatTime(event.startAt)}
            </p>
            <Link href={`/event/${event.id}`}>
              <h3 className="mt-0.5 truncate text-lg font-bold text-fg hover:text-brand-200">{event.title}</h3>
            </Link>
            <p className="truncate text-sm text-subtle">
              {event.locationName ?? "Venue TBA"}
              {event.city ? ` · ${event.city}, CT` : ""}
              {event.distanceMi != null ? ` · ${event.distanceMi.toFixed(0)} mi` : ""}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-brand-500/20 text-[10px] font-bold text-brand-200">
            {initials(event.host.displayName)}
          </span>
          <Link href={`/p/${event.host.slug}`} className="truncate text-xs text-subtle hover:text-fg">
            {event.host.displayName}
          </Link>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t} className="badge text-[10px]">{t}</span>
            ))}
          </div>
          <RsvpButton
            eventId={event.id}
            initialStatus={rsvpStatus}
            loggedIn={loggedIn}
            loginHref={`/login?callbackUrl=/event/${event.id}`}
            compact
          />
        </div>
      </div>
    </div>
  );
}
