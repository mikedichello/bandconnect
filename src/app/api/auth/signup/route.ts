import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { coordsForTown } from "@/lib/ct-geo";

/**
 * Create an account of any of the four profile types. Passwords are hashed
 * with bcrypt; a matching profile (with a unique slug) is provisioned in the
 * same write so the user lands on a usable page immediately.
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

  const { email, password, role, displayName, city, zip } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const slug = await uniqueSlug(displayName);
  const coords = coordsForTown(city);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role,
        profile: {
          create: {
            type: role,
            displayName,
            slug,
            city: city || null,
            zip: zip || null,
            lat: coords?.lat ?? null,
            lng: coords?.lng ?? null,
          },
        },
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

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name) || "profile";
  let candidate = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const taken = await prisma.profile.findUnique({ where: { slug: candidate } });
    if (!taken) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}
