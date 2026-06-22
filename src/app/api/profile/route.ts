import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { bandProfileSchema, venueProfileSchema } from "@/lib/validations";
import { isPro } from "@/lib/plans";

/** Update the signed-in user's band or venue profile. */
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const pro = isPro(user.plan);

  if (user.role === "BAND") {
    const parsed = bandProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    const d = parsed.data;
    const updated = await prisma.bandProfile.update({
      where: { userId: user.id },
      data: {
        name: d.name,
        tagline: emptyToNull(d.tagline),
        bio: emptyToNull(d.bio),
        genre: emptyToNull(d.genre),
        city: emptyToNull(d.city),
        imageUrl: emptyToNull(d.imageUrl),
        bannerUrl: emptyToNull(d.bannerUrl),
        websiteUrl: emptyToNull(d.websiteUrl),
        instagram: emptyToNull(d.instagram),
        spotify: emptyToNull(d.spotify),
        bandcamp: emptyToNull(d.bandcamp),
        youtube: emptyToNull(d.youtube),
        lookingForGigs: d.lookingForGigs ?? true,
        memberCount: d.memberCount ?? null,
        // Custom theme is a Pro feature; ignore for free users.
        ...(pro && d.themeColor ? { themeColor: d.themeColor } : {}),
      },
    });
    return NextResponse.json({ ok: true, profile: updated });
  }

  if (user.role === "VENUE") {
    const parsed = venueProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    const d = parsed.data;
    const updated = await prisma.venueProfile.update({
      where: { userId: user.id },
      data: {
        name: d.name,
        tagline: emptyToNull(d.tagline),
        description: emptyToNull(d.description),
        city: emptyToNull(d.city),
        address: emptyToNull(d.address),
        capacity: d.capacity ?? null,
        genresWanted: emptyToNull(d.genresWanted),
        imageUrl: emptyToNull(d.imageUrl),
        bannerUrl: emptyToNull(d.bannerUrl),
        websiteUrl: emptyToNull(d.websiteUrl),
        instagram: emptyToNull(d.instagram),
        acceptingSubmissions: d.acceptingSubmissions ?? true,
        ...(pro && d.themeColor ? { themeColor: d.themeColor } : {}),
      },
    });
    return NextResponse.json({ ok: true, profile: updated });
  }

  return NextResponse.json({ error: "Unknown account type" }, { status: 400 });
}

function emptyToNull(value: string | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}
