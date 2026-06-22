import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { planFor } from "@/lib/plans";
import { EventsManager, type EventRow } from "@/components/dashboard/EventsManager";

export const metadata = { title: "My events" };

export default async function EventsPage() {
  const user = await requireUser();
  const profile = user.profile!;
  if (profile.type === "FAN") {
    return (
      <div className="card p-8 text-center">
        <p className="text-zinc-300">Fan accounts don&apos;t host events.</p>
        <p className="mt-1 text-sm text-zinc-500">Switch to a venue, musician, or band profile to post shows.</p>
      </div>
    );
  }

  const events = await prisma.event.findMany({
    where: { hostProfileId: profile.id },
    orderBy: { startAt: "asc" },
  });

  const rows: EventRow[] = events.map((e) => ({
    id: e.id, title: e.title, startAt: e.startAt.toISOString(), endAt: e.endAt?.toISOString() ?? null,
    city: e.city, locationName: e.locationName, familyFriendly: e.familyFriendly, hasCoverCharge: e.hasCoverCharge, coverType: e.coverType,
  }));

  const limit = planFor(user.plan).limits.maxEvents;
  const upcoming = events.filter((e) => e.startAt >= new Date()).length;
  const atLimit = Number.isFinite(limit) && upcoming >= limit;
  const limitLabel = Number.isFinite(limit) ? `${upcoming} of ${limit} upcoming events used on your plan.` : "Unlimited events on Pro.";

  return <EventsManager initial={rows} atLimit={atLimit} limitLabel={limitLabel} />;
}
