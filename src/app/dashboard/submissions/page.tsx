import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDate, timeAgo } from "@/lib/utils";
import { SubmissionActions } from "@/components/dashboard/SubmissionActions";

export const metadata = { title: "Submissions" };

function statusBadge(status: string) {
  if (status === "ACCEPTED") return <span className="badge-green">✓ Accepted</span>;
  if (status === "DECLINED") return <span className="badge">Declined</span>;
  return <span className="badge-accent">Pending</span>;
}

export default async function SubmissionsPage() {
  const user = await requireUser();
  const isBand = user.role === "BAND";

  if (isBand) {
    const subs = user.bandProfile
      ? await prisma.submission.findMany({
          where: { bandProfileId: user.bandProfile.id },
          include: { venue: { include: { user: true } } },
          orderBy: { createdAt: "desc" },
        })
      : [];

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">My submissions</h1>
            <p className="text-sm text-zinc-400">Booking requests you&apos;ve sent to venues.</p>
          </div>
          <Link href="/discover/venues" className="btn-primary">Find venues</Link>
        </div>

        {subs.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-zinc-400">You haven&apos;t sent any submissions yet.</p>
            <Link href="/discover/venues" className="btn-primary mt-4">Browse venues</Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {subs.map((s) => (
              <li key={s.id} className="card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/venues/${s.venue.slug}`} className="font-semibold text-white hover:text-brand-200">
                        {s.venue.name}
                      </Link>
                      {statusBadge(s.status)}
                    </div>
                    <p className="mt-1 text-sm font-medium text-zinc-300">{s.subject}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{s.message}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      Sent {timeAgo(s.createdAt)}
                      {s.proposedDate ? ` · Proposed ${formatDate(s.proposedDate)}` : ""}
                    </p>
                  </div>
                  <Link href={`/dashboard/messages?to=${s.venue.userId}`} className="btn-ghost px-4 py-1.5 text-xs whitespace-nowrap">
                    Message
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  // Venue view: incoming requests
  const subs = user.venueProfile
    ? await prisma.submission.findMany({
        where: { venueProfileId: user.venueProfile.id },
        include: { band: { include: { user: true } } },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Booking requests</h1>
        <p className="text-sm text-zinc-400">Bands that want to play your room.</p>
      </div>

      {subs.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-zinc-400">No booking requests yet.</p>
          <p className="mt-1 text-sm text-zinc-500">
            Make sure your profile says you&apos;re accepting submissions.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {subs.map((s) => (
            <li key={s.id} className="card p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/bands/${s.band.slug}`} className="font-semibold text-white hover:text-brand-200">
                      {s.band.name}
                    </Link>
                    {s.band.city && <span className="text-xs text-zinc-500">{s.band.city}</span>}
                  </div>
                  <p className="mt-1 text-sm font-medium text-zinc-300">{s.subject}</p>
                  <p className="mt-1 text-sm text-zinc-400">{s.message}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {timeAgo(s.createdAt)}
                    {s.proposedDate ? ` · Proposed ${formatDate(s.proposedDate)}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <SubmissionActions id={s.id} status={s.status} />
                  <Link href={`/dashboard/messages?to=${s.band.userId}`} className="text-xs text-brand-300 hover:text-brand-200">
                    Message band →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
