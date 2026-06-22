import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";

/** Toggle following another profile. Body: { targetProfileId }. */
export async function POST(req: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { targetProfileId } = (await req.json().catch(() => ({}))) as {
    targetProfileId?: string;
  };
  if (!targetProfileId || targetProfileId === me.id) {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  const target = await prisma.profile.findUnique({ where: { id: targetProfileId } });
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: me.id, followingId: target.id } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, following: false });
  }

  await prisma.follow.create({ data: { followerId: me.id, followingId: target.id } });
  await prisma.notification.create({
    data: {
      userId: target.userId,
      type: "FOLLOW",
      title: `${me.displayName} followed you`,
      linkUrl: `/p/${me.slug}`,
    },
  });
  return NextResponse.json({ ok: true, following: true });
}
