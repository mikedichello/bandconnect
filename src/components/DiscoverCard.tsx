import Link from "next/link";
import { initials, parseTags } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export interface DiscoverCardData {
  slug: string;
  name: string;
  tagline: string | null;
  city: string | null;
  imageUrl: string | null;
  tags: string | null;
  featured: boolean;
  themeColor: string | null;
  available: boolean;
  meta?: string | null; // e.g. "Cap. 200" or "5-piece"
}

export function DiscoverCard({
  data,
  type,
}: {
  data: DiscoverCardData;
  type: "bands" | "venues";
}) {
  const tags = parseTags(data.tags).slice(0, 3);
  const accent = data.featured && data.themeColor ? data.themeColor : undefined;

  return (
    <Link
      href={`/${type}/${data.slug}`}
      className="card group relative overflow-hidden p-5 transition hover:border-white/25"
      style={accent ? { borderColor: `${accent}55` } : undefined}
    >
      {data.featured && (
        <span className="absolute right-3 top-3 badge-brand text-[10px]">★ Featured</span>
      )}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl bg-brand-500/15">
          <ImageWithFallback
            src={data.imageUrl}
            alt={data.name}
            className="h-full w-full object-cover"
            fallback={
              <div className="grid h-full w-full place-items-center text-lg font-bold text-brand-200">
                {initials(data.name)}
              </div>
            }
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-white group-hover:text-brand-200">
            {data.name}
          </h3>
          <p className="truncate text-sm text-zinc-400">
            {data.city ?? "Location TBA"}
            {data.meta ? ` · ${data.meta}` : ""}
          </p>
        </div>
      </div>

      {data.tagline && (
        <p className="mt-3 line-clamp-2 text-sm text-zinc-300">{data.tagline}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {data.available && (
          <span className="badge-green text-[11px]">
            {type === "bands" ? "Looking for gigs" : "Booking now"}
          </span>
        )}
        {tags.map((t) => (
          <span key={t} className="badge text-[11px]">{t}</span>
        ))}
      </div>
    </Link>
  );
}
