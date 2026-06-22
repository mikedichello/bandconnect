import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { initials, parseTags, formatRate } from "@/lib/utils";

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
  rateMin: number | null;
  rateMax: number | null;
  rateHidden: boolean;
  followerCount?: number;
}

export function ProfileCard({ data }: { data: ProfileCardData }) {
  const tags = parseTags(data.genres).slice(0, 3);
  const rate = !data.rateHidden ? formatRate(data.rateMin, data.rateMax) : null;
  const typeLabel =
    data.type === "VENUE" ? "Venue" : data.type === "MUSICIAN" ? "Musician" : data.type === "BAND" ? "Band" : "Fan";

  return (
    <Link href={`/p/${data.slug}`} className="card group relative overflow-hidden p-5 transition hover:border-line">
      {data.featured && <span className="absolute right-3 top-3 badge-brand text-[10px]">★ Featured</span>}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-brand-500/15">
          <ImageWithFallback
            src={data.avatarUrl}
            alt={data.displayName}
            className="h-full w-full object-cover"
            fallback={<div className="grid h-full w-full place-items-center text-lg font-bold text-brand-200">{initials(data.displayName)}</div>}
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-fg group-hover:text-brand-200">{data.displayName}</h3>
          <p className="truncate text-sm text-subtle">
            {typeLabel}{data.city ? ` · ${data.city}` : ""}
          </p>
        </div>
      </div>

      {data.tagline && <p className="mt-3 line-clamp-2 text-sm text-muted">{data.tagline}</p>}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {data.availableForGigs && <span className="badge-green text-[11px]">Available for gigs</span>}
        {rate && <span className="badge text-[11px]">{rate}</span>}
        {tags.map((t) => (
          <span key={t} className="badge text-[11px]">{t}</span>
        ))}
      </div>
    </Link>
  );
}
