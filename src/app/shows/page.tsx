import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatTime } from "@/lib/utils";

export const metadata = { title: "Upcoming shows" };
export const dynamic = "force-dynamic";

export default async function ShowsPage() {
  const shows = await prisma.event.findMany({
    where: { isPublic: true, date: { gte: new Date() } },
    orderBy: { date: "asc" },
    take: 100,
    include: {
      band: { select: { name: true, slug: true } },
      venue: { select: { name: true, slug: true } },
    },
  });

  // Group by date (yyyy-mm-dd).
  const groups = new Map<string, typeof shows>();
  for (const s of shows) {
    const key = s.date.toISOString().slice(0, 10);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Upcoming shows</h1>
        <p className="mt-2 text-zinc-400">
          Every show announced across the BandConnect community.
        </p>
      </header>

      {shows.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-3xl">📅</div>
          <h2 className="mt-3 text-lg font-semibold">No shows announced yet</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Bands and venues are just getting started.{" "}
            <Link href="/signup" className="text-brand-300 hover:text-brand-200">Add yours →</Link>
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Array.from(groups.entries()).map(([key, dayShows]) => (
            <section key={key}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-300">
                {formatDate(new Date(key))}
              </h2>
              <ul className="space-y-3">
                {dayShows.map((s) => (
                  <li key={s.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-white">{s.title}</p>
                      <p className="text-sm text-zinc-400">
                        {formatTime(s.date)}
                        {s.venue ? (
                          <> · <Link href={`/venues/${s.venue.slug}`} className="hover:text-brand-200">{s.venue.name}</Link></>
                        ) : s.venueName ? (
                          ` · ${s.venueName}`
                        ) : null}
                        {s.city ? ` · ${s.city}` : ""}
                      </p>
                      {s.band && (
                        <p className="mt-0.5 text-xs text-zinc-500">
                          Presented by{" "}
                          <Link href={`/bands/${s.band.slug}`} className="hover:text-brand-200">{s.band.name}</Link>
                        </p>
                      )}
                    </div>
                    {s.ticketUrl && (
                      <a href={s.ticketUrl} target="_blank" rel="noreferrer" className="btn-outline px-4 py-1.5 text-xs">
                        Tickets ↗
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
