import { Star } from "lucide-react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { initials, parseTags, formatRate, formatMiles } from "@/lib/utils";

export interface ProfileCardData {
  slug: string;
  displayName: string;
  type: string;
  tagline: string | null;
  city: string | null;
  avatarUrl: string | null;
  genres: string | null;
  availableForGigs: boolean;
  featured: boolean;
  verified: boolean;
  rateMin: number | null;
  rateMax: number | null;
  rateHidden: boolean;
  followerCount?: number;
  distanceMi?: number | null;
}

export function ProfileCard({ data }: { data: ProfileCardData }) {
  const tags = parseTags(data.genres).slice(0, 3);
  const rate = !data.rateHidden ? formatRate(data.rateMin, data.rateMax) : null;
  const typeLabel =
    data.type === "VENUE" ? "Venue" : data.type === "MUSICIAN" ? "Musician" : data.type === "BAND" ? "Band" : "Fan";

  return (
    <Link href={`/p/${data.slug}`} className="card group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-brand-400/50 hover:shadow-glow">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-brand-500/15">
          <ImageWithFallback
            src={data.avatarUrl}
            alt={data.displayName}
            className="h-full w-full object-cover"
            fallback={<div className="grid h-full w-full place-items-center text-lg font-bold text-brand-700 dark:text-brand-200">{initials(data.displayName)}</div>}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="truncate text-lg font-semibold text-fg group-hover:text-brand-700 dark:group-hover:text-brand-200">{data.displayName}</h3>
            {data.verified && <VerifiedBadge className="flex-shrink-0" />}
          </div>
          <p className="truncate text-sm text-subtle">
            {typeLabel}{data.city ? ` · ${data.city}` : ""}{data.distanceMi != null ? ` · ${formatMiles(data.distanceMi)}` : ""}
          </p>
        </div>
      </div>

      {data.tagline && <p className="mt-3 line-clamp-2 text-sm text-muted">{data.tagline}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {data.featured && <span className="badge-brand text-[11px]"><Star className="h-3 w-3 fill-current" aria-hidden="true" /> Featured</span>}
        {data.availableForGigs && <span className="badge-green text-[11px]">Available for gigs</span>}
        {rate && <span className="badge text-[11px]">{rate}</span>}
        {tags.map((t) => (
          <span key={t} className="badge text-[11px]">{t}</span>
        ))}
      </div>
    </Link>
  );
}
