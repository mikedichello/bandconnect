import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { parseTags } from "@/lib/utils";
import { SocialLinks } from "@/components/profile/SocialLinks";
import { ShowList } from "@/components/profile/ShowList";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { PublicProfileHeader } from "@/components/profile/PublicProfileHeader";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const band = await prisma.bandProfile.findUnique({ where: { slug: params.slug } });
  if (!band) return { title: "Band not found" };
  return {
    title: band.name,
    description: band.tagline || band.bio?.slice(0, 150) || `${band.name} on BandConnect`,
  };
}

export default async function BandPage({ params }: { params: { slug: string } }) {
  const band = await prisma.bandProfile.findUnique({
    where: { slug: params.slug },
    include: { user: true },
  });
  if (!band) notFound();

  const session = await getSession();
  const isOwner = session?.user?.id === band.userId;
  const accent = band.themeColor || "#7c4dff";

  const shows = await prisma.event.findMany({
    where: { bandProfileId: band.id, isPublic: true, date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 20,
  });

  const tags = parseTags(band.genre);

  return (
    <article>
      <PublicProfileHeader
        name={band.name}
        tagline={band.tagline}
        city={band.city}
        imageUrl={band.imageUrl}
        bannerUrl={band.bannerUrl}
        accent={accent}
        badges={[
          band.lookingForGigs ? { label: "Looking for gigs", tone: "green" } : null,
          band.memberCount ? { label: `${band.memberCount}-piece`, tone: "plain" } : null,
          band.featured ? { label: "★ Featured", tone: "brand" } : null,
        ]}
        actions={
          <ProfileActions
            targetUserId={band.userId}
            isOwner={isOwner}
            loggedIn={Boolean(session?.user)}
            viewerRole={(session?.user?.role as "BAND" | "VENUE") ?? null}
            loginHref={`/login?callbackUrl=/bands/${band.slug}`}
            accent={accent}
          />
        }
      />

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {band.bio && (
            <section>
              <h2 className="mb-3 text-xl font-bold">About</h2>
              <p className="whitespace-pre-wrap text-zinc-300">{band.bio}</p>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-xl font-bold">Upcoming shows</h2>
            <ShowList shows={shows} accent={accent} />
          </section>
        </div>

        <aside className="space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Details</h3>
            <dl className="mt-3 space-y-2 text-sm">
              {band.city && <Detail label="Based in" value={band.city} />}
              {band.memberCount && <Detail label="Members" value={String(band.memberCount)} />}
              <Detail label="Status" value={band.lookingForGigs ? "Available for booking" : "Not currently booking"} />
            </dl>
          </div>

          {tags.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Genres</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="badge">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div className="card p-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Links</h3>
            <div className="mt-3">
              <SocialLinks
                websiteUrl={band.websiteUrl}
                instagram={band.instagram}
                spotify={band.spotify}
                bandcamp={band.bandcamp}
                youtube={band.youtube}
              />
              {!band.websiteUrl && !band.instagram && !band.spotify && !band.bandcamp && !band.youtube && (
                <p className="text-sm text-zinc-500">No links added yet.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-zinc-500">{label}</dt>
      <dd className="text-right text-zinc-200">{value}</dd>
    </div>
  );
}
