import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";

/** Set or clear an RSVP. Body: { eventId, status: "GOING" | "MAYBE" | "NONE" }. */
export async function POST(req: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { eventId, status } = (await req.json().catch(() => ({}))) as {
    eventId?: string;
    status?: string;
  };
  if (!eventId || !status || !["GOING", "MAYBE", "NONE"].includes(status)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  if (status === "NONE") {
    await prisma.rsvp.deleteMany({ where: { profileId: me.id, eventId } });
    return NextResponse.json({ ok: true, status: null });
  }

  await prisma.rsvp.upsert({
    where: { profileId_eventId: { profileId: me.id, eventId } },
    create: { profileId: me.id, eventId, status },
    update: { status },
  });

  // Let the host know (first RSVP only — avoid spamming on toggles).
  if (event.hostProfileId !== me.id) {
    const host = await prisma.profile.findUnique({
      where: { id: event.hostProfileId },
      select: { userId: true },
    });
    if (host) {
      await prisma.notification.create({
        data: {
          userId: host.userId,
          type: "RSVP",
          title: `${me.displayName} is ${status === "GOING" ? "going to" : "interested in"} ${event.title}`,
          linkUrl: `/event/${event.id}`,
        },
      });
    }
  }

  return NextResponse.json({ ok: true, status });
}
