import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWeeklyDigestEmail, type DigestEvent } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Weekly digest: for each user, upcoming shows (next 7 days) from profiles
 * they follow plus their saved-search matches. Intended for a weekly Vercel
 * Cron; protected by CRON_SECRET when set, open otherwise so dev/demo works.
 *
 * Idempotent per week: User.digestSentAt gates re-sends, so a retried or
 * duplicated cron hit won't double-mail anyone.
 */
async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const url = new URL(req.url);
    const auth = req.headers.get("authorization");
    const ok = auth === `Bearer ${secret}` || url.searchParams.get("key") === secret;
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const cooloff = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);

  const [users, events] = await Promise.all([
    prisma.user.findMany({
      where: { OR: [{ digestSentAt: null }, { digestSentAt: { lt: cooloff } }] },
      include: {
        profile: { include: { following: { select: { followingId: true } } } },
        savedSearches: true,
      },
      take: 500,
    }),
    prisma.event.findMany({
      where: { startAt: { gte: now, lte: horizon } },
      orderBy: { startAt: "asc" },
      select: {
        id: true, title: true, startAt: true, city: true, locationName: true,
        genres: true, hostProfileId: true, venueProfileId: true,
      },
    }),
  ]);

  let sent = 0;
  for (const user of users) {
    const followed = new Set(user.profile?.following.map((f) => f.followingId) ?? []);
    const matches = events.filter((e) => {
      if (followed.has(e.hostProfileId) || (e.venueProfileId && followed.has(e.venueProfileId))) return true;
      return user.savedSearches.some((s) => {
        const cityOk = !s.city || (e.city ?? "").toLowerCase().includes(s.city.toLowerCase());
        const genreOk = !s.genre || (e.genres ?? "").toLowerCase().includes(s.genre.toLowerCase());
        return (s.city || s.genre) ? cityOk && genreOk : false;
      });
    });
    if (matches.length === 0) continue;

    const digest: DigestEvent[] = matches.slice(0, 8).map((e) => ({
      id: e.id,
      title: e.title,
      whenLabel: formatDateTime(e.startAt),
      locationLabel: [e.locationName, e.city].filter(Boolean).join(" · ") || "Location TBA",
    }));

    await sendWeeklyDigestEmail(user.email, user.profile?.displayName ?? "there", digest);
    await prisma.user.update({ where: { id: user.id }, data: { digestSentAt: now } });
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent, candidates: users.length });
}

export const GET = handle;
export const POST = handle;
