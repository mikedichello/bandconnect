import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

/** Create a saved search / alert from calendar filters (city and/or genre). */
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { city?: string; genre?: string };
  const city = body.city?.trim() || null;
  const genre = body.genre?.trim() || null;
  if (!city && !genre) {
    return NextResponse.json({ error: "Add a town or genre to save an alert" }, { status: 400 });
  }

  // Avoid duplicates for the same user + city + genre.
  const existing = await prisma.savedSearch.findFirst({ where: { userId, city, genre } });
  if (existing) return NextResponse.json({ ok: true, search: existing });

  const label =
    city && genre ? `${genre} in ${city}` : city ? `Shows in ${city}` : `${genre} shows`;

  const count = await prisma.savedSearch.count({ where: { userId } });
  if (count >= 25) {
    return NextResponse.json({ error: "You've reached the maximum number of alerts." }, { status: 400 });
  }

  const search = await prisma.savedSearch.create({ data: { userId, label, city, genre } });
  return NextResponse.json({ ok: true, search }, { status: 201 });
}
