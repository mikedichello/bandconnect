import { Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProfileCard, type ProfileCardData } from "@/components/ProfileCard";
import { LocationFields } from "@/components/LocationFields";
import { rankProfiles } from "@/lib/discovery";

export const metadata = { title: "Venues & hosts" };
export const dynamic = "force-dynamic";

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; loc?: string; radius?: string };
}) {
  const q = searchParams.q?.trim() || "";
  // `city` is kept for old links; the form now uses town/ZIP + radius.
  const city = searchParams.city?.trim() || "";
  const loc = searchParams.loc?.trim() || "";
  const radius = Number(searchParams.radius) || 25;

  const venues = await prisma.profile.findMany({
    where: {
      type: "VENUE",
      AND: [
        q ? { OR: [{ displayName: { contains: q } }, { tagline: { contains: q } }, { genres: { contains: q } }] } : {},
        city ? { city: { contains: city } } : {},
      ],
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: { user: { select: { plan: true } } },
    take: 200,
  });
  const { geo, ranked } = rankProfiles(venues, loc, radius);

  const cards: ProfileCardData[] = ranked.slice(0, 60).map(({ p: v, featured, distanceMi }) => ({
    slug: v.slug, displayName: v.displayName, type: v.type, tagline: v.tagline, city: v.city,
    avatarUrl: v.avatarUrl, genres: v.genres, availableForGigs: v.availableForGigs, featured, verified: v.verified,
    rateMin: v.rateMin, rateMax: v.rateMax, rateHidden: v.rateHidden, distanceMi,
  }));

  return (
    <div className="container-page py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Venues & hosts</h1>
        <p className="mt-2 text-subtle">Connecticut rooms booking live music. Follow them and never miss a show.</p>
      </header>

      <form method="get" className="card mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1.5fr_1fr_auto] lg:items-start">
        <div>
          <label htmlFor="ve-q" className="label">Search</label>
          <input id="ve-q" name="q" defaultValue={q} className="input" placeholder="Name, vibe, or genre" />
        </div>
        <LocationFields idPrefix="ve" loc={loc} radius={radius} resolvedLabel={geo?.label ?? null} />
        <button className="btn-primary lg:mt-[1.625rem]">Search</button>
      </form>

      <p className="mb-4 text-sm text-subtle">
        {cards.length} {cards.length === 1 ? "venue" : "venues"}{geo ? ` within ${radius} mi of ${geo.label}` : city ? ` in ${city}` : " across Connecticut"}
      </p>

      {cards.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => <ProfileCard key={c.slug} data={c} />)}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center">
      <Building2 className="mx-auto h-8 w-8 text-brand-600 dark:text-brand-300" aria-hidden="true" />
      <h2 className="mt-3 text-lg font-semibold">No venues yet</h2>
      <p className="mt-1 text-sm text-subtle">Check back soon, or list your venue.</p>
    </div>
  );
}
