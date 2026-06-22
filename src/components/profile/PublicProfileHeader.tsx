import { initials } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ImageWithFallback";

type Badge = { label: string; tone: "green" | "brand" | "plain" } | null;

export function PublicProfileHeader({
  name,
  tagline,
  city,
  imageUrl,
  bannerUrl,
  accent,
  badges,
  actions,
}: {
  name: string;
  tagline?: string | null;
  city?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  accent: string;
  badges: Badge[];
  actions: React.ReactNode;
}) {
  const visibleBadges = badges.filter(Boolean) as Exclude<Badge, null>[];

  return (
    <header className="relative">
      {/* Banner */}
      <div className="h-48 w-full overflow-hidden sm:h-64" style={{ backgroundColor: `${accent}22` }}>
        <ImageWithFallback
          src={bannerUrl}
          alt=""
          className="h-full w-full object-cover"
          fallback={
            <div
              className="h-full w-full"
              style={{
                background: `radial-gradient(60% 120% at 20% 0%, ${accent}55, transparent 60%), radial-gradient(50% 100% at 90% 10%, ${accent}33, transparent 60%)`,
              }}
            />
          }
        />
      </div>

      <div className="container-page">
        <div className="relative -mt-16 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div
              className="grid h-28 w-28 flex-shrink-0 place-items-center overflow-hidden rounded-3xl border-4 border-ink bg-ink-soft"
              style={{ boxShadow: `0 0 40px -10px ${accent}` }}
            >
              <ImageWithFallback
                src={imageUrl}
                alt={name}
                className="h-full w-full object-cover"
                fallback={
                  <span className="font-display text-3xl font-bold" style={{ color: accent }}>
                    {initials(name)}
                  </span>
                }
              />
            </div>
            <div className="pb-1">
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">{name}</h1>
              {tagline && <p className="mt-1 max-w-xl text-zinc-300">{tagline}</p>}
              {city && <p className="mt-1 text-sm text-zinc-500">📍 {city}</p>}
            </div>
          </div>
          <div className="pb-1">{actions}</div>
        </div>

        {visibleBadges.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {visibleBadges.map((b) => (
              <span
                key={b.label}
                className={
                  b.tone === "green"
                    ? "badge-green"
                    : b.tone === "brand"
                      ? "badge-brand"
                      : "badge"
                }
              >
                {b.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
