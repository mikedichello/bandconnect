import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { eventSchema } from "@/lib/validations";
import { planFor } from "@/lib/plans";

/** Create a show on the signed-in user's calendar (enforces plan limits). */
export async function POST(req: Request) {
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

  const parsed = eventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const when = new Date(parsed.data.date);
  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  // Enforce upcoming-show limit by plan.
  const limit = planFor(user.plan).limits.maxEvents;
  if (Number.isFinite(limit)) {
    const upcoming = await prisma.event.count({
      where: { ownerId: user.id, date: { gte: new Date() } },
    });
    if (upcoming >= limit) {
      return NextResponse.json(
        {
          error: `Your plan allows up to ${limit} upcoming shows. Upgrade to Pro for unlimited shows.`,
          code: "PLAN_LIMIT",
        },
        { status: 402 },
      );
    }
  }

  const d = parsed.data;
  const event = await prisma.event.create({
    data: {
      ownerId: user.id,
      title: d.title,
      description: d.description || null,
      date: when,
      city: d.city || null,
      venueName: d.venueName || null,
      bandName: d.bandName || null,
      ticketUrl: d.ticketUrl || null,
      isPublic: d.isPublic ?? true,
      bandProfileId: user.bandProfile?.id ?? null,
      venueProfileId: user.venueProfile?.id ?? null,
    },
  });

  return NextResponse.json({ ok: true, event }, { status: 201 });
}
