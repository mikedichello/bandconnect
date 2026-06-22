import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { eventSchema } from "@/lib/validations";
import { planFor } from "@/lib/plans";
import { coordsForTown, resolveCtLocation } from "@/lib/ct-geo";

/** Create an event. Hosts are venues, musicians, or bands. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.profile) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (user.profile.type === "FAN") {
    return NextResponse.json(
      { error: "Fans can't create events. Upgrade your profile to a venue, musician, or band." },
      { status: 403 },
    );
  }

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

  // Plan limit on upcoming events.
  const limit = planFor(user.plan).limits.maxEvents;
  if (Number.isFinite(limit)) {
    const upcoming = await prisma.event.count({
      where: { hostProfileId: user.profile.id, startAt: { gte: new Date() } },
    });
    if (upcoming >= limit) {
      return NextResponse.json(
        {
          error: `Your plan allows up to ${limit} upcoming events. Upgrade to Pro for unlimited.`,
          code: "PLAN_LIMIT",
        },
        { status: 402 },
      );
    }
  }

  // Resolve coordinates: prefer the event city/zip, else fall back to the
  // host's profile location (handy for venues whose events are at home).
  const coords =
    coordsForTown(d.city) ??
    (d.zip ? resolveCtLocation(d.zip) : null) ??
    (user.profile.lat != null && user.profile.lng != null
      ? { lat: user.profile.lat, lng: user.profile.lng }
      : null);

  // If the host is a venue and didn't name a location, use their own.
  const isVenue = user.profile.type === "VENUE";
  const locationName = d.locationName || (isVenue ? user.profile.displayName : null);

  const event = await prisma.event.create({
    data: {
      hostProfileId: user.profile.id,
      venueProfileId: isVenue ? user.profile.id : null,
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
      locationName,
      address: d.address || (isVenue ? user.profile.address : null),
      city: d.city || user.profile.city || null,
      zip: d.zip || user.profile.zip || null,
      state: "CT",
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
    },
  });

  // Notify followers that a new event was posted.
  const followers = await prisma.follow.findMany({
    where: { followingId: user.profile.id },
    select: { follower: { select: { userId: true } } },
  });
  if (followers.length > 0) {
    await prisma.notification.createMany({
      data: followers.map((f) => ({
        userId: f.follower.userId,
        type: "EVENT_REMINDER",
        title: `${user.profile!.displayName} posted a new event`,
        body: d.title,
        linkUrl: `/event/${event.id}`,
      })),
    });
  }

  // Saved-search alerts: notify people whose alert matches this new event.
  await notifySavedSearches(event, user.id, user.profile!.displayName);

  return NextResponse.json({ ok: true, event }, { status: 201 });
}

async function notifySavedSearches(
  event: { id: string; title: string; city: string | null; genres: string | null },
  hostUserId: string,
  hostName: string,
) {
  // Bounded dataset for now; match in app code (city/genre contains).
  const searches = await prisma.savedSearch.findMany({
    include: { user: { select: { id: true, email: true } } },
    take: 2000,
  });
  const eventCity = (event.city ?? "").toLowerCase();
  const eventGenres = (event.genres ?? "").toLowerCase();
  const matchedUserIds = new Set<string>();

  for (const s of searches) {
    if (s.userId === hostUserId || matchedUserIds.has(s.userId)) continue;
    const cityOk = !s.city || eventCity.includes(s.city.toLowerCase());
    const genreOk = !s.genre || eventGenres.includes(s.genre.toLowerCase());
    if (cityOk && genreOk) matchedUserIds.add(s.userId);
  }
  if (matchedUserIds.size === 0) return;

  await prisma.notification.createMany({
    data: Array.from(matchedUserIds).map((userId) => ({
      userId,
      type: "EVENT_REMINDER",
      title: `New show matching your alert: ${event.title}`,
      body: `${hostName}${event.city ? ` · ${event.city}, CT` : ""}`,
      linkUrl: `/event/${event.id}`,
    })),
  });
}
