import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEventReminderEmail } from "@/lib/email";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * Sends a one-time reminder for each RSVP'd show starting within the next 24h.
 * Intended to be hit on a schedule (e.g. Vercel Cron hourly). Protected by
 * CRON_SECRET when that env var is set; open otherwise so dev/demo works.
 *
 * Idempotent: each RSVP is reminded at most once (tracked via reminderSentAt).
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
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const due = await prisma.rsvp.findMany({
    where: {
      reminderSentAt: null,
      status: { in: ["GOING", "MAYBE"] },
      event: { startAt: { gte: now, lte: horizon } },
    },
    include: {
      event: true,
      profile: { include: { user: { select: { id: true, email: true } } } },
    },
    take: 500,
  });

  let reminded = 0;
  for (const rsvp of due) {
    const e = rsvp.event;
    const locationLabel = [e.locationName, e.city ? `${e.city}, CT` : null].filter(Boolean).join(" · ") || "Location TBA";

    await prisma.notification.create({
      data: {
        userId: rsvp.profile.user.id,
        type: "EVENT_REMINDER",
        title: `Tonight/soon: ${e.title}`,
        body: `${formatDateTime(e.startAt)} · ${locationLabel}`,
        linkUrl: `/event/${e.id}`,
      },
    });

    await sendEventReminderEmail(rsvp.profile.user.email, {
      id: e.id,
      title: e.title,
      whenLabel: formatDateTime(e.startAt),
      locationLabel,
    });

    await prisma.rsvp.update({ where: { id: rsvp.id }, data: { reminderSentAt: now } });
    reminded += 1;
  }

  return NextResponse.json({ ok: true, reminded });
}

export const GET = handle;
export const POST = handle;
