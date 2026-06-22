import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";

/**
 * Manage fan friendships. Body: { targetProfileId, action }.
 * action: "request" | "accept" | "remove".
 */
export async function POST(req: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { targetProfileId, action } = (await req.json().catch(() => ({}))) as {
    targetProfileId?: string;
    action?: string;
  };
  if (!targetProfileId || targetProfileId === me.id || !action) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const target = await prisma.profile.findUnique({ where: { id: targetProfileId } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Find any existing friendship in either direction.
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { requesterId: me.id, addresseeId: target.id },
        { requesterId: target.id, addresseeId: me.id },
      ],
    },
  });

  if (action === "remove") {
    if (existing) await prisma.friendship.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, status: "none" });
  }

  if (action === "request") {
    if (existing) return NextResponse.json({ ok: true, status: existing.status.toLowerCase() });
    await prisma.friendship.create({
      data: { requesterId: me.id, addresseeId: target.id, status: "PENDING" },
    });
    await prisma.notification.create({
      data: {
        userId: target.userId,
        type: "FRIEND_REQUEST",
        title: `${me.displayName} sent you a friend request`,
        linkUrl: `/p/${me.slug}`,
      },
    });
    return NextResponse.json({ ok: true, status: "pending" });
  }

  if (action === "accept") {
    // Only the addressee of a pending request can accept.
    if (!existing || existing.addresseeId !== me.id || existing.status !== "PENDING") {
      return NextResponse.json({ error: "No pending request" }, { status: 400 });
    }
    await prisma.friendship.update({
      where: { id: existing.id },
      data: { status: "ACCEPTED" },
    });
    await prisma.notification.create({
      data: {
        userId: target.userId,
        type: "FRIEND_ACCEPT",
        title: `${me.displayName} accepted your friend request`,
        linkUrl: `/p/${me.slug}`,
      },
    });
    return NextResponse.json({ ok: true, status: "accepted" });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
