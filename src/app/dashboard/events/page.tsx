import { Star } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { planFor } from "@/lib/plans";
import { EventsManager, type EventRow } from "@/components/dashboard/EventsManager";

export const metadata = { title: "My events" };

export default async function EventsPage(props: { searchParams: Promise<{ boosted?: string }> }) {
  const searchParams = await props.searchParams;
  const user = await requireUser();
  const profile = user.profile!;
  if (profile.type === "FAN") {
    return (
      <div className="card p-8 text-center">
        <p className="text-muted">Fan accounts don&apos;t host events.</p>
        <p className="mt-1 text-sm text-subtle">Switch to a venue, musician, or band profile to post shows.</p>
      </div>
    );
  }

  const events = await prisma.event.findMany({
    where: { hostProfileId: profile.id },
    orderBy: { startAt: "asc" },
  });

  const now = new Date();
  const rows: EventRow[] = events.map((e) => ({
    id: e.id, title: e.title, startAt: e.startAt.toISOString(), endAt: e.endAt?.toISOString() ?? null,
    city: e.city, locationName: e.locationName, familyFriendly: e.familyFriendly, hasCoverCharge: e.hasCoverCharge, coverType: e.coverType,
    featured: e.featured && e.featuredUntil != null && e.featuredUntil > now,
  }));

  const limit = planFor(user.plan).limits.maxEvents;
  const upcoming = events.filter((e) => e.startAt >= new Date()).length;
  const atLimit = Number.isFinite(limit) && upcoming >= limit;
  const limitLabel = Number.isFinite(limit) ? `${upcoming} of ${limit} upcoming events used on your plan.` : "Unlimited events on Pro.";

  return (
    <>
      {searchParams.boosted === "1" && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          <Star className="h-4 w-4 flex-shrink-0 fill-current" aria-hidden="true" />
          Your show is boosted — it&apos;s now featured at the top of the calendar.
        </div>
      )}
      <EventsManager initial={rows} atLimit={atLimit} limitLabel={limitLabel} />
    </>
  );
}
