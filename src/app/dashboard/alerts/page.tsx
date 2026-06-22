import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AlertsManager, type AlertRow } from "@/components/dashboard/AlertsManager";

export const metadata = { title: "Alerts" };

export default async function AlertsPage() {
  const user = await requireUser();
  const rows = await prisma.savedSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const alerts: AlertRow[] = rows.map((r) => ({ id: r.id, label: r.label, city: r.city, genre: r.genre }));
  return <AlertsManager initial={alerts} />;
}
