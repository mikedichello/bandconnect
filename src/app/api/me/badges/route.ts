import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";

/** Unread counts for the navbar bell. */
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ notifications: 0, messages: 0 });

  const [notifications, messages] = await Promise.all([
    prisma.notification.count({ where: { userId, read: false } }),
    prisma.message.count({ where: { recipientId: userId, readAt: null } }),
  ]);
  return NextResponse.json({ notifications, messages });
}
