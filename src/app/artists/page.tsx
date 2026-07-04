import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProfileCard, type ProfileCardData } from "@/components/ProfileCard";
import { GENRES } from "@/lib/constants";

export const metadata = { title: "Musicians & bands" };
export const dynamic = "force-dynamic";

export default async function ArtistsPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; genre?: string; available?: string; date?: string; seeking?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const type = searchParams.type === "MUSICIAN" || searchParams.type === "BAND" ? searchParams.type : "";
  const genre = searchParams.genre?.trim() || "";
  const available = searchParams.available === "1";
  const date = searchParams.date || "";
  const seeking = searchParams.seeking || "";

  // Booking-intent searches (gig availability / open-date filters) only
  // surface verified artists — see docs/launch/trust-and-verification.md.
  const bookingIntent = available || Boolean(date);

  // Date filter → restrict to profiles with a matching open date.
  let availableOnDateIds: string[] | null = null;
  if (date) {
    const d = new Date(date);
    if (!Number.isNaN(d.getTime())) {
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const rows = await prisma.availabilityDate.findMany({
        where: { date: { gte: d, lt: next } },
        select: { profileId: true },
      });
      availableOnDateIds = rows.map((r) => r.profileId);
    }
  }

  const seekingWhere =
    seeking === "JOIN_BAND" ? { wantsJoinBand: true }
    : seeking === "START_BAND" ? { wantsStartBand: true }
    : seeking === "FILL_IN" ? { openForFillIns: true }
    : seeking === "NEED_MUSICIANS" ? { needsMusicians: true }
    : {};

  const artists = await prisma.profile.findMany({
    where: {
      type: type ? type : { in: ["MUSICIAN", "BAND"] },
      AND: [
        q ? { OR: [{ displayName: { contains: q } }, { tagline: { contains: q } }, { genres: { contains: q } }, { instruments: { contains: q } }] } : {},
        genre ? { genres: { contains: genre } } : {},
        available ? { availableForGigs: true } : {},
        seekingWhere,
        availableOnDateIds ? { id: { in: availableOnDateIds } } : {},
        bookingIntent ? { verified: true } : {},
      ],
    },
    orderBy: [{ featured: "desc" }, { availableForGigs: "desc" }, { createdAt: "desc" }],
    take: 60,
  });

  const cards: ProfileCardData[] = artists.map((a) => ({
    slug: a.slug, displayName: a.displayName, type: a.type, tagline: a.tagline, city: a.city,
    avatarUrl: a.avatarUrl, genres: a.genres, availableForGigs: a.availableForGigs, featured: a.featured, verified: a.verified,
    rateMin: a.rateMin, rateMax: a.rateMax, rateHidden: a.rateHidden,
  }));

  return (
    <div className="container-page py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Musicians & bands</h1>
        <p className="mt-2 text-subtle">Find acts for your room, bandmates to play with, or a band to join.</p>
      </header>

      <form method="get" className="card mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
        <div className="lg:col-span-2">
          <label htmlFor="ar-q" className="label">Search</label>
          <input id="ar-q" name="q" defaultValue={q} className="input" placeholder="Name, genre, instrument" />
        </div>
        <div>
          <label htmlFor="ar-type" className="label">Type</label>
          <select id="ar-type" name="type" defaultValue={type} className="input">
            <option value="">All</option>
            <option value="MUSICIAN">Musicians</option>
            <option value="BAND">Bands</option>
          </select>
        </div>
        <div>
          <label htmlFor="ar-genre" className="label">Genre</label>
          <select id="ar-genre" name="genre" defaultValue={genre} className="input">
            <option value="">Any</option>
            {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="ar-date" className="label">Open on</label>
          <input id="ar-date" type="date" name="date" defaultValue={date} className="input" />
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-primary w-full">Search</button>
        </div>
        <div className="lg:col-span-6 flex flex-wrap items-center gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" name="available" value="1" defaultChecked={available} className="h-4 w-4 accent-brand-500" />
            Available for gigs
          </label>
          <select name="seeking" aria-label="Availability" defaultValue={seeking} className="input max-w-[220px]">
            <option value="">Any availability</option>
            <option value="JOIN_BAND">Musicians seeking a band</option>
            <option value="START_BAND">Musicians starting a band</option>
            <option value="FILL_IN">Open for fill-ins</option>
            <option value="NEED_MUSICIANS">Bands needing musicians</option>
          </select>
        </div>
      </form>

      {bookingIntent && (
        <p className="mb-4 text-sm text-subtle">
          Booking searches only include verified artists.{" "}
          <Link href="/dashboard/profile" className="link">Verify your page</Link> to appear here.
        </p>
      )}

      {cards.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-3xl">🎸</div>
          <h2 className="mt-3 text-lg font-semibold">No artists match</h2>
          <p className="mt-1 text-sm text-subtle">Try clearing a filter or widening your search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => <ProfileCard key={c.slug} data={c} />)}
        </div>
      )}
    </div>
  );
}
