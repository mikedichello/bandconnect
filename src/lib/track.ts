import { after } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Record a profile/event page view without blocking the render. Callers skip
 * owner self-views; logged-out viewers are recorded with a null viewerId.
 */
export function trackView(targetType: "PROFILE" | "EVENT", targetId: string, viewerId: string | null) {
  after(async () => {
    try {
      await prisma.pageView.create({ data: { targetType, targetId, viewerId } });
    } catch (err) {
      console.error("trackView failed", err);
    }
  });
}
