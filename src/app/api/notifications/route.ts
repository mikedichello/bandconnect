import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

/** Mark notifications read. Body: { id? } — omit id to mark all read. */
export async function PATCH(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = (await req.json().catch(() => ({}))) as { id?: string };
  if (id) {
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  } else {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
  return NextResponse.json({ ok: true });
}
