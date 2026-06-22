import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";

/** Remove a media item you own. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const item = await prisma.mediaItem.findUnique({ where: { id: params.id } });
  if (!item || item.profileId !== me.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.mediaItem.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
