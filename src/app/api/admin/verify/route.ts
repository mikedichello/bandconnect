import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { isAdmin } from "@/lib/admin";

const schema = z.object({
  profileId: z.string().min(1),
  action: z.enum(["approve", "reject"]),
});

/** Admin-only: approve or reject a pending verification request (rung 4). */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const approve = parsed.data.action === "approve";
  try {
    await prisma.profile.update({
      where: { id: parsed.data.profileId },
      data: {
        verified: approve,
        verificationStatus: approve ? "verified" : "rejected",
        verificationMethod: approve ? "manual" : null,
        verifiedAt: approve ? new Date() : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
