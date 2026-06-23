import { prisma } from "@/lib/prisma";
import { ProfileCard, type ProfileCardData } from "@/components/ProfileCard";
import { CT_TOWN_NAMES } from "@/lib/ct-geo";

export const metadata = { title: "Venues & hosts" };
export const dynamic = "force-dynamic";

export default async function VenuesPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const city = searchParams.city?.trim() || "";

  const venues = await prisma.profile.findMany({
    where: {
      type: "VENUE",
      AND: [
        q ? { OR: [{ displayName: { contains: q } }, { tagline: { contains: q } }, { genres: { contains: q } }] } : {},
        city ? { city: { contains: city } } : {},
      ],
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  const cards: ProfileCardData[] = venues.map((v) => ({
    slug: v.slug, displayName: v.displayName, type: v.type, tagline: v.tagline, city: v.city,
    avatarUrl: v.avatarUrl, genres: v.genres, availableForGigs: v.availableForGigs, featured: v.featured, verified: v.verified,
    rateMin: v.rateMin, rateMax: v.rateMax, rateHidden: v.rateHidden,
  }));

  return (
    <div className="container-page py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Venues & hosts</h1>
        <p className="mt-2 text-subtle">Connecticut rooms booking live music. Follow them and never miss a show.</p>
      </header>

      <form method="get" className="card mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="ve-q" className="label">Search</label>
          <input id="ve-q" name="q" defaultValue={q} className="input" placeholder="Name, vibe, or genre" />
        </div>
        <div className="sm:w-56">
          <label htmlFor="ve-city" className="label">Town</label>
          <select id="ve-city" name="city" defaultValue={city} className="input">
            <option value="">All of CT</option>
            {CT_TOWN_NAMES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button className="btn-primary">Filter</button>
      </form>

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
      <div className="text-3xl">🏛️</div>
      <h2 className="mt-3 text-lg font-semibold">No venues yet</h2>
      <p className="mt-1 text-sm text-subtle">Check back soon, or list your venue.</p>
    </div>
  );
}
