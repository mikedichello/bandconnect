import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Share an event with a friend: sends them a DM with the link and a SHARE
 * notification. Recipients must be accepted friends (fan ↔ fan).
 */
export async function POST(req: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { eventId, toProfileId, note } = (await req.json().catch(() => ({}))) as {
    eventId?: string;
    toProfileId?: string;
    note?: string;
  };
  if (!eventId || !toProfileId) {
    return NextResponse.json({ error: "Missing event or recipient" }, { status: 400 });
  }

  const [event, target, friendship] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId } }),
    prisma.profile.findUnique({ where: { id: toProfileId }, include: { user: { select: { id: true } } } }),
    prisma.friendship.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { requesterId: me.id, addresseeId: toProfileId },
          { requesterId: toProfileId, addresseeId: me.id },
        ],
      },
    }),
  ]);

  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (!target) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  if (!friendship) {
    return NextResponse.json({ error: "You can only share with friends" }, { status: 403 });
  }

  const link = `${APP_URL}/event/${event.id}`;
  const body = [note?.trim(), event.title, link].filter(Boolean).join("\n\n");

  await prisma.message.create({
    data: { senderId: me.userId, recipientId: target.user.id, body },
  });
  await prisma.notification.create({
    data: {
      userId: target.user.id,
      type: "SHARE",
      title: `${me.displayName} shared an event with you`,
      body: event.title,
      linkUrl: `/event/${event.id}`,
    },
  });

  return NextResponse.json({ ok: true });
}
