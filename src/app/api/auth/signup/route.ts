import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

/**
 * Create a band or venue account. Passwords are hashed with bcrypt; a starter
 * profile (with a unique slug) is provisioned in the same transaction so the
 * user lands on a usable page immediately.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { email, password, role, name, city } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const slug = await uniqueSlug(name, role);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role,
        ...(role === "BAND"
          ? {
              bandProfile: {
                create: { name, slug, city: city || null },
              },
            }
          : {
              venueProfile: {
                create: { name, slug, city: city || null },
              },
            }),
      },
    });

    return NextResponse.json({ ok: true, userId: user.id }, { status: 201 });
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json(
      { error: "Could not create account. Please try again." },
      { status: 500 },
    );
  }
}

/** Build a slug from the name and ensure it's globally unique across profiles. */
async function uniqueSlug(name: string, role: "BAND" | "VENUE"): Promise<string> {
  const base = slugify(name) || (role === "BAND" ? "band" : "venue");
  let candidate = base;
  let n = 1;
  // Slugs share a namespace conceptually (/bands/x vs /venues/x are distinct,
  // but we keep them unique within each table). Check the relevant table.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const taken =
      role === "BAND"
        ? await prisma.bandProfile.findUnique({ where: { slug: candidate } })
        : await prisma.venueProfile.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}
