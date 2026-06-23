import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { domainFromEmail, domainFromUrl } from "@/lib/utils";

const schema = z.object({
  info: z.string().trim().max(2000).optional(),
  websiteUrl: z.string().trim().max(300).optional(),
});

/**
 * Request verification of the signed-in user's profile. Auto-verifies when the
 * account email's domain matches the profile's website domain (rung 1: domain
 * match); otherwise queues the request for manual admin review.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !user.profile) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const me = user.profile;
  if (me.type === "FAN") {
    return NextResponse.json({ error: "Only venues, bands, and musicians can be verified." }, { status: 400 });
  }
  if (me.verified) {
    return NextResponse.json({ ok: true, verified: true, status: "verified" });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const site = parsed.data.websiteUrl?.trim() || me.websiteUrl;
  const emailDomain = domainFromEmail(user.email);
  const siteDomain = domainFromUrl(site);
  const autoVerified = Boolean(emailDomain && siteDomain && emailDomain === siteDomain);

  const updated = await prisma.profile.update({
    where: { id: me.id },
    data: {
      websiteUrl: site || me.websiteUrl,
      verificationInfo: parsed.data.info?.trim() || null,
      verified: autoVerified,
      verificationStatus: autoVerified ? "verified" : "pending",
      verificationMethod: autoVerified ? "domain" : null,
      verifiedAt: autoVerified ? new Date() : null,
    },
    select: { verified: true, verificationStatus: true },
  });

  return NextResponse.json({ ok: true, verified: updated.verified, status: updated.verificationStatus, autoVerified });
}
