import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { profileSchema } from "@/lib/validations";
import { isPro } from "@/lib/plans";
import { coordsForTown, resolveCtLocation } from "@/lib/ct-geo";
import { isArtist } from "@/lib/constants";

const empty = (v: string | null | undefined) => {
  if (v == null) return null;
  const t = v.trim();
  return t === "" ? null : t;
};

/** Update the signed-in user's profile. */
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.profile) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const d = parsed.data;
  const type = user.profile.type;
  const pro = isPro(user.plan);

  // Resolve coordinates from city (town center) or zip when provided.
  const coords =
    coordsForTown(d.city) ??
    (d.zip ? resolveCtLocation(d.zip) : null) ??
    null;

  // Common fields
  const data: Record<string, unknown> = {
    displayName: d.displayName,
    tagline: empty(d.tagline),
    bio: empty(d.bio),
    city: empty(d.city),
    zip: empty(d.zip),
    avatarUrl: empty(d.avatarUrl),
    bannerUrl: empty(d.bannerUrl),
    websiteUrl: empty(d.websiteUrl),
    instagram: empty(d.instagram),
    lat: coords ? coords.lat : user.profile.lat,
    lng: coords ? coords.lng : user.profile.lng,
    ...(pro && d.themeColor ? { themeColor: d.themeColor } : {}),
  };

  if (type === "VENUE") {
    data.address = empty(d.address);
    data.genres = empty(d.genres);
  }

  if (isArtist(type)) {
    data.genres = empty(d.genres);
    data.spotify = empty(d.spotify);
    data.youtube = empty(d.youtube);
    data.bandcamp = empty(d.bandcamp);
    data.availableForGigs = d.availableForGigs ?? false;
    data.rateMin = d.rateMin ?? null;
    data.rateMax = d.rateMax ?? null;
    data.rateHidden = d.rateHidden ?? false;
  }

  if (type === "MUSICIAN") {
    data.instruments = empty(d.instruments);
    data.isSolo = d.isSolo ?? false;
    data.wantsStartBand = d.wantsStartBand ?? false;
    data.wantsJoinBand = d.wantsJoinBand ?? false;
    data.openForFillIns = d.openForFillIns ?? false;
  }

  if (type === "BAND") {
    data.needsMusicians = d.needsMusicians ?? false;
  }

  const updated = await prisma.profile.update({
    where: { id: user.profile.id },
    data,
  });

  return NextResponse.json({ ok: true, profile: updated });
}
