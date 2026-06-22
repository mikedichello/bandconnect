import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentProfile } from "@/lib/session";
import { availabilitySchema } from "@/lib/validations";
import { isArtist } from "@/lib/constants";

/** Add an open date to a musician/band availability calendar. */
export async function POST(req: Request) {
  const me = await getCurrentProfile();
  if (!me) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isArtist(me.type)) {
    return NextResponse.json(
      { error: "Only musicians and bands have an availability calendar" },
      { status: 403 },
    );
  }

  const parsed = availabilitySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const date = new Date(parsed.data.date);
  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }
  date.setHours(0, 0, 0, 0);

  try {
    const item = await prisma.availabilityDate.create({
      data: { profileId: me.id, date, note: parsed.data.note || null },
    });
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "That date is already marked" }, { status: 409 });
  }
}
