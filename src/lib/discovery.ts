import { distanceMiles, resolveCtLocation } from "@/lib/ct-geo";
import { isPro } from "@/lib/plans";

/**
 * Shared ranking for the /artists and /venues directories.
 *
 * - "Featured" = admin-curated `Profile.featured` OR an active Pro plan. Deriving
 *   it from the plan means a Stripe upgrade gets its promised placement
 *   immediately, with no extra webhook bookkeeping.
 * - Optional radius filter around a CT town/ZIP (same haversine as the calendar).
 *   Profiles without coordinates are dropped when a radius is active.
 */
type Rankable = {
  featured: boolean;
  createdAt: Date;
  lat: number | null;
  lng: number | null;
  user: { plan: string | null };
};

export function rankProfiles<T extends Rankable>(rows: T[], loc: string | undefined, radius: number) {
  const geo = resolveCtLocation(loc);
  const ranked = rows
    .map((p) => ({
      p,
      featured: p.featured || isPro(p.user.plan),
      distanceMi: geo && p.lat != null && p.lng != null ? distanceMiles(geo.lat, geo.lng, p.lat, p.lng) : null,
    }))
    .filter((r) => !geo || (r.distanceMi != null && r.distanceMi <= radius))
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.distanceMi != null && b.distanceMi != null) return a.distanceMi - b.distanceMi;
      return 0; // keep the DB order otherwise
    });
  return { geo, ranked };
}
