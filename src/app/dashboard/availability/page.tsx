import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isArtist } from "@/lib/constants";
import { AvailabilityManager, type OpenDate } from "@/components/dashboard/AvailabilityManager";

export const metadata = { title: "Availability" };

export default async function AvailabilityPage() {
  const user = await requireUser();
  const profile = user.profile!;
  if (!isArtist(profile.type)) {
    return (
      <div className="card p-8 text-center text-zinc-300">
        Availability calendars are for musicians and bands.
      </div>
    );
  }

  const rows = await prisma.availabilityDate.findMany({
    where: { profileId: profile.id, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    orderBy: { date: "asc" },
  });

  const dates: OpenDate[] = rows.map((d) => ({ id: d.id, date: d.date.toISOString(), note: d.note }));
  return <AvailabilityManager initial={dates} />;
}
