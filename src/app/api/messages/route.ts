import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/session";
import { messageSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

/** Fetch the thread with another user (and mark their messages read). */
export async function GET(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  const other = new URL(req.url).searchParams.get("with");
  if (!other) {
    return NextResponse.json({ error: "Missing 'with'" }, { status: 400 });
  }

  const rows = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, recipientId: other },
        { senderId: other, recipientId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
    take: 300,
  });

  // Opening / polling the thread marks the other side's messages read.
  await prisma.message.updateMany({
    where: { senderId: other, recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({
    messages: rows.map((m) => ({
      id: m.id,
      body: m.body,
      mine: m.senderId === userId,
      createdAt: m.createdAt.toISOString(),
    })),
  });
}

/** Send a direct message to another user. */
export async function POST(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  if (parsed.data.recipientId === userId) {
    return NextResponse.json(
      { error: "You can't message yourself" },
      { status: 400 },
    );
  }

  const recipient = await prisma.user.findUnique({
    where: { id: parsed.data.recipientId },
    select: { id: true },
  });
  if (!recipient) {
    return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: userId,
      recipientId: parsed.data.recipientId,
      body: parsed.data.body,
    },
  });

  // Notify the recipient.
  const me = await prisma.profile.findUnique({
    where: { userId },
    select: { displayName: true },
  });
  await prisma.notification.create({
    data: {
      userId: parsed.data.recipientId,
      type: "MESSAGE",
      title: `New message from ${me?.displayName ?? "someone"}`,
      body: parsed.data.body.slice(0, 120),
      linkUrl: "/dashboard/messages",
    },
  });

  return NextResponse.json({ ok: true, message }, { status: 201 });
}

/** Mark all messages from a given sender as read. */
export async function PATCH(req: Request) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const otherId = (body as { otherId?: string })?.otherId;
  if (!otherId) {
    return NextResponse.json({ error: "otherId is required" }, { status: 400 });
  }

  await prisma.message.updateMany({
    where: { senderId: otherId, recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
