import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { eventSchema } from "@/lib/validations";
import { coordsForTown, resolveCtLocation } from "@/lib/ct-geo";

async function ownedEvent(id: string, profileId: string) {
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event || event.hostProfileId !== profileId) return null;
  return event;
}

/** Edit an event you host. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.profile) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const existing = await ownedEvent(params.id, user.profile.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const startAt = new Date(d.startAt);
  if (Number.isNaN(startAt.getTime())) {
    return NextResponse.json({ error: "Invalid start date" }, { status: 400 });
  }
  const endAt = d.endAt ? new Date(d.endAt) : null;
  const coords =
    coordsForTown(d.city) ?? (d.zip ? resolveCtLocation(d.zip) : null) ?? null;

  const event = await prisma.event.update({
    where: { id: params.id },
    data: {
      title: d.title,
      description: d.description || null,
      coverUrl: d.coverUrl || null,
      coverType: d.coverType || "IMAGE",
      coverThumbUrl: d.coverThumbUrl || null,
      startAt,
      endAt: endAt && !Number.isNaN(endAt.getTime()) ? endAt : null,
      familyFriendly: d.familyFriendly ?? false,
      hasCoverCharge: d.hasCoverCharge ?? false,
      genres: d.genres || null,
      locationName: d.locationName || existing.locationName,
      address: d.address || null,
      city: d.city || null,
      zip: d.zip || null,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    },
  });
  return NextResponse.json({ ok: true, event });
}

/** Delete an event you host. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user || !user.profile) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const existing = await ownedEvent(params.id, user.profile.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
