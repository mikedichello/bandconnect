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
  const venue = await prisma.venueProfile.findUnique({ where: { slug: params.slug } });
  if (!venue) return { title: "Venue not found" };
  return {
    title: venue.name,
    description: venue.tagline || venue.description?.slice(0, 150) || `${venue.name} on BandConnect`,
  };
}

export default async function VenuePage({ params }: { params: { slug: string } }) {
  const venue = await prisma.venueProfile.findUnique({
    where: { slug: params.slug },
    include: { user: true },
  });
  if (!venue) notFound();

  const session = await getSession();
  const isOwner = session?.user?.id === venue.userId;
  const accent = venue.themeColor || "#7c4dff";

  const shows = await prisma.event.findMany({
    where: { venueProfileId: venue.id, isPublic: true, date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 20,
  });

  const tags = parseTags(venue.genresWanted);

  return (
    <article>
      <PublicProfileHeader
        name={venue.name}
        tagline={venue.tagline}
        city={venue.city}
        imageUrl={venue.imageUrl}
        bannerUrl={venue.bannerUrl}
        accent={accent}
        badges={[
          venue.acceptingSubmissions ? { label: "Accepting submissions", tone: "green" } : null,
          venue.capacity ? { label: `Capacity ${venue.capacity}`, tone: "plain" } : null,
          venue.featured ? { label: "★ Featured", tone: "brand" } : null,
        ]}
        actions={
          <ProfileActions
            targetUserId={venue.userId}
            isOwner={isOwner}
            loggedIn={Boolean(session?.user)}
            viewerRole={(session?.user?.role as "BAND" | "VENUE") ?? null}
            loginHref={`/login?callbackUrl=/venues/${venue.slug}`}
            venue={{ id: venue.id, name: venue.name, accepting: venue.acceptingSubmissions }}
            accent={accent}
          />
        }
      />

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {venue.description && (
            <section>
              <h2 className="mb-3 text-xl font-bold">About the venue</h2>
              <p className="whitespace-pre-wrap text-zinc-300">{venue.description}</p>
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
              {venue.city && <Detail label="City" value={venue.city} />}
              {venue.address && <Detail label="Address" value={venue.address} />}
              {venue.capacity != null && <Detail label="Capacity" value={String(venue.capacity)} />}
              <Detail
                label="Booking"
                value={venue.acceptingSubmissions ? "Open to submissions" : "Closed"}
              />
            </dl>
          </div>

          {tags.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Genres booked</h3>
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
              <SocialLinks websiteUrl={venue.websiteUrl} instagram={venue.instagram} />
              {!venue.websiteUrl && !venue.instagram && (
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
