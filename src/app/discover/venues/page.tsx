import { prisma } from "@/lib/prisma";
import { DiscoverCard, type DiscoverCardData } from "@/components/DiscoverCard";
import { FilterBar } from "@/components/DiscoverFilters";

export const metadata = { title: "Find venues" };
export const dynamic = "force-dynamic";

export default async function DiscoverVenuesPage({
  searchParams,
}: {
  searchParams: { q?: string; genre?: string; available?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const genre = searchParams.genre?.trim() || "";
  const availableOnly = searchParams.available === "1";

  const venues = await prisma.venueProfile.findMany({
    where: {
      AND: [
        q
          ? { OR: [{ name: { contains: q } }, { city: { contains: q } }, { tagline: { contains: q } }] }
          : {},
        genre ? { genresWanted: { contains: genre } } : {},
        availableOnly ? { acceptingSubmissions: true } : {},
      ],
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  const cards: DiscoverCardData[] = venues.map((v) => ({
    slug: v.slug,
    name: v.name,
    tagline: v.tagline,
    city: v.city,
    imageUrl: v.imageUrl,
    tags: v.genresWanted,
    featured: v.featured,
    themeColor: v.themeColor,
    available: v.acceptingSubmissions,
    meta: v.capacity ? `Cap. ${v.capacity}` : null,
  }));

  return (
    <div className="container-page py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Find venues</h1>
        <p className="mt-2 text-zinc-400">
          Browse rooms by city, capacity, and the genres they book.
        </p>
      </header>

      <FilterBar basePath="/discover/venues" q={q} genre={genre} availableOnly={availableOnly} availableLabel="Accepting submissions only" />

      {cards.length === 0 ? (
        <div className="card mt-6 p-12 text-center">
          <div className="text-3xl">🔍</div>
          <h2 className="mt-3 text-lg font-semibold">No matches yet</h2>
          <p className="mt-1 text-sm text-zinc-400">Try clearing filters or check back soon.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <DiscoverCard key={c.slug} data={c} type="venues" />
          ))}
        </div>
      )}
    </div>
  );
}
