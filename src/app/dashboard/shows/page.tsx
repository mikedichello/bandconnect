import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { planFor } from "@/lib/plans";
import { ShowsManager, type ShowItem } from "@/components/dashboard/ShowsManager";

export const metadata = { title: "My shows" };

export default async function ShowsPage() {
  const user = await requireUser();

  const events = await prisma.event.findMany({
    where: { ownerId: user.id },
    orderBy: { date: "asc" },
  });

  const shows: ShowItem[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.date.toISOString(),
    city: e.city,
    venueName: e.venueName,
    bandName: e.bandName,
    ticketUrl: e.ticketUrl,
    isPublic: e.isPublic,
  }));

  const limit = planFor(user.plan).limits.maxEvents;
  const upcomingCount = events.filter((e) => e.date >= new Date()).length;
  const atLimit = Number.isFinite(limit) && upcomingCount >= limit;
  const limitLabel = Number.isFinite(limit)
    ? `${upcomingCount} of ${limit} upcoming shows used on your plan.`
    : "Unlimited shows on Pro.";

  return <ShowsManager initialShows={shows} atLimit={atLimit} limitLabel={limitLabel} />;
}
