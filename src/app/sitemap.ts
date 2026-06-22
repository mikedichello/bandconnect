import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/venues",
    "/artists",
    "/pricing",
    "/login",
    "/signup",
  ].map((p) => ({ url: `${BASE}${p}`, lastModified: new Date(), changeFrequency: "daily", priority: p === "" ? 1 : 0.7 }));

  try {
    const [events, profiles] = await Promise.all([
      prisma.event.findMany({
        where: { startAt: { gte: new Date() } },
        select: { id: true, updatedAt: true },
        take: 2000,
      }),
      prisma.profile.findMany({ select: { slug: true, updatedAt: true }, take: 2000 }),
    ]);
    return [
      ...staticRoutes,
      ...events.map((e) => ({ url: `${BASE}/event/${e.id}`, lastModified: e.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
      ...profiles.map((p) => ({ url: `${BASE}/p/${p.slug}`, lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ];
  } catch {
    // No DB at build time — ship the static routes; dynamic ones fill in later.
    return staticRoutes;
  }
}
