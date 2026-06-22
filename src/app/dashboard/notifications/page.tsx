import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { NotificationsList, type NotifRow } from "@/components/dashboard/NotificationsList";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const items: NotifRow[] = rows.map((n) => ({
    id: n.id, type: n.type, title: n.title, body: n.body, linkUrl: n.linkUrl, read: n.read, createdAt: n.createdAt.toISOString(),
  }));

  return <NotificationsList initial={items} />;
}
