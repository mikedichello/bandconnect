import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Returns the current NextAuth session, or null. */
export async function getSession() {
  return getServerSession(authOptions);
}

/** Returns the signed-in user's id, or null. */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user?.id ?? null;
}

/** Load the full current user with their profile. Null when signed out. */
export async function getCurrentUser() {
  const id = await getCurrentUserId();
  if (!id) return null;
  return prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
}

/** Load just the current user's profile (null when signed out / no profile). */
export async function getCurrentProfile() {
  const id = await getCurrentUserId();
  if (!id) return null;
  return prisma.profile.findUnique({ where: { userId: id } });
}

/** Require auth in a server component; redirects to /login if signed out. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
