import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { submissionSchema } from "@/lib/validations";
import { planFor } from "@/lib/plans";

/** A band sends a booking submission to a venue. */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (user.role !== "BAND" || !user.bandProfile) {
    return NextResponse.json(
      { error: "Only bands can submit to venues" },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const venue = await prisma.venueProfile.findUnique({
    where: { id: parsed.data.venueProfileId },
  });
  if (!venue) {
    return NextResponse.json({ error: "Venue not found" }, { status: 404 });
  }

  // Enforce monthly submission limit by plan.
  const limit = planFor(user.plan).limits.maxSubmissionsPerMonth;
  if (Number.isFinite(limit)) {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const sentThisMonth = await prisma.submission.count({
      where: {
        bandProfileId: user.bandProfile.id,
        createdAt: { gte: monthStart },
      },
    });
    if (sentThisMonth >= limit) {
      return NextResponse.json(
        {
          error: `You've used all ${limit} submissions this month. Upgrade to Pro for unlimited submissions.`,
          code: "PLAN_LIMIT",
        },
        { status: 402 },
      );
    }
  }

  const proposedDate = parsed.data.proposedDate
    ? new Date(parsed.data.proposedDate)
    : null;

  const submission = await prisma.submission.create({
    data: {
      bandProfileId: user.bandProfile.id,
      venueProfileId: venue.id,
      subject: parsed.data.subject,
      message: parsed.data.message,
      proposedDate:
        proposedDate && !Number.isNaN(proposedDate.getTime()) ? proposedDate : null,
    },
  });

  return NextResponse.json({ ok: true, submission }, { status: 201 });
}
