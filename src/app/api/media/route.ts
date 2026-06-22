import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { mediaSchema } from "@/lib/validations";

/** Add an image or video to the signed-in profile's media gallery. */
export async function POST(req: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const parsed = mediaSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const count = await prisma.mediaItem.count({ where: { profileId: me.id } });
  const item = await prisma.mediaItem.create({
    data: {
      profileId: me.id,
      kind: parsed.data.kind,
      url: parsed.data.url,
      caption: parsed.data.caption || null,
      sortOrder: count,
    },
  });
  return NextResponse.json({ ok: true, item }, { status: 201 });
}
