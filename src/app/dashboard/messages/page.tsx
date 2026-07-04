import { Suspense } from "react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { MessagesInbox, type Conversation } from "@/components/dashboard/MessagesInbox";

export const metadata = { title: "Messages" };

function displayFor(u: {
  role: string;
  profile: { displayName: string; slug: string; type: string } | null;
}) {
  if (u.profile) return { name: u.profile.displayName, slug: u.profile.slug, role: u.profile.type };
  return { name: "BandConnect user", slug: null, role: u.role };
}

export default async function MessagesPage(
  props: {
    searchParams: Promise<{ to?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const user = await requireUser();

  const messages = await prisma.message.findMany({
    where: {
      OR: [{ senderId: user.id }, { recipientId: user.id }],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { include: { profile: true } },
      recipient: { include: { profile: true } },
    },
  });

  // Group into conversations keyed by the other participant.
  const map = new Map<string, Conversation>();
  for (const m of messages) {
    const other = m.senderId === user.id ? m.recipient : m.sender;
    const otherId = other.id;
    if (!map.has(otherId)) {
      const d = displayFor(other);
      map.set(otherId, {
        otherId,
        name: d.name,
        slug: d.slug,
        role: d.role,
        messages: [],
        unread: 0,
        lastAt: m.createdAt.toISOString(),
      });
    }
    const convo = map.get(otherId)!;
    convo.messages.push({
      id: m.id,
      body: m.body,
      mine: m.senderId === user.id,
      createdAt: m.createdAt.toISOString(),
    });
    convo.lastAt = m.createdAt.toISOString();
    if (m.recipientId === user.id && !m.readAt) convo.unread += 1;
  }

  let conversations = Array.from(map.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime(),
  );

  // If a ?to= target has no existing thread, seed an empty conversation.
  const to = searchParams.to;
  if (to && to !== user.id && !map.has(to)) {
    const target = await prisma.user.findUnique({
      where: { id: to },
      include: { profile: true },
    });
    if (target) {
      const d = displayFor(target);
      conversations = [
        {
          otherId: to,
          name: d.name,
          slug: d.slug,
          role: d.role,
          messages: [],
          unread: 0,
          lastAt: new Date().toISOString(),
        },
        ...conversations,
      ];
    }
  }

  return (
    <Suspense>
      <MessagesInbox conversations={conversations} initialOtherId={to ?? conversations[0]?.otherId ?? null} />
    </Suspense>
  );
}
