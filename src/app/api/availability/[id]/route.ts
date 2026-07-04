import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";

/** Remove an open date you own. */
export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const item = await prisma.availabilityDate.findUnique({ where: { id: params.id } });
  if (!item || item.profileId !== me.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await prisma.availabilityDate.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
