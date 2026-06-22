import { prisma } from "@/lib/prisma";
import { DiscoverCard, type DiscoverCardData } from "@/components/DiscoverCard";
import { FilterBar, DiscoverEmptyState } from "@/components/DiscoverFilters";

export const metadata = { title: "Find bands" };
export const dynamic = "force-dynamic";

export default async function DiscoverBandsPage({
  searchParams,
}: {
  searchParams: { q?: string; genre?: string; available?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const genre = searchParams.genre?.trim() || "";
  const availableOnly = searchParams.available === "1";

  const bands = await prisma.bandProfile.findMany({
    where: {
      AND: [
        q
          ? { OR: [{ name: { contains: q } }, { city: { contains: q } }, { tagline: { contains: q } }] }
          : {},
        genre ? { genre: { contains: genre } } : {},
        availableOnly ? { lookingForGigs: true } : {},
      ],
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  const cards: DiscoverCardData[] = bands.map((b) => ({
    slug: b.slug,
    name: b.name,
    tagline: b.tagline,
    city: b.city,
    imageUrl: b.imageUrl,
    tags: b.genre,
    featured: b.featured,
    themeColor: b.themeColor,
    available: b.lookingForGigs,
    meta: b.memberCount ? `${b.memberCount}-piece` : null,
  }));

  return (
    <div className="container-page py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Find bands</h1>
        <p className="mt-2 text-zinc-400">
          Discover local acts looking to play. Filter by city or genre.
        </p>
      </header>

      <FilterBar basePath="/discover/bands" q={q} genre={genre} availableOnly={availableOnly} availableLabel="Looking for gigs only" />

      {cards.length === 0 ? (
        <DiscoverEmptyState />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <DiscoverCard key={c.slug} data={c} type="bands" />
          ))}
        </div>
      )}
    </div>
  );
}
