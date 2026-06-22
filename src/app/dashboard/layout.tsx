import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Sidebar, type NavItem } from "@/components/dashboard/Sidebar";
import { isPro } from "@/lib/plans";
import { isArtist, profileTypeMeta } from "@/lib/constants";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const profile = user.profile;
  if (!profile) {
    return <div className="container-page py-10 text-zinc-400">No profile found.</div>;
  }
  const type = profile.type;
  const meta = profileTypeMeta(type);

  const [unreadMessages, unreadNotifications, pendingFriends] = await Promise.all([
    prisma.message.count({ where: { recipientId: user.id, readAt: null } }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.friendship.count({ where: { addresseeId: profile.id, status: "PENDING" } }),
  ]);

  const items: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: "🏠" },
    { href: "/dashboard/profile", label: "Edit profile", icon: "🎛️" },
    ...(type !== "FAN" ? [{ href: "/dashboard/events", label: "My events", icon: "📅" } as NavItem] : []),
    { href: "/dashboard/calendar", label: type === "FAN" ? "My calendar" : "Calendar", icon: "🗓️" },
    ...(isArtist(type) ? [{ href: "/dashboard/availability", label: "Availability", icon: "✅" } as NavItem] : []),
    { href: "/dashboard/network", label: "Network", icon: "👥", badge: pendingFriends || undefined },
    { href: "/dashboard/messages", label: "Messages", icon: "✉️", badge: unreadMessages || undefined },
    { href: "/dashboard/notifications", label: "Notifications", icon: "🔔", badge: unreadNotifications || undefined },
    { href: "/dashboard/billing", label: "Billing", icon: "💳" },
  ];

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-zinc-400">{meta.emoji} {meta.label} dashboard</p>
          <h1 className="text-2xl font-bold">{profile.displayName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={isPro(user.plan) ? "badge-brand" : "badge"}>{isPro(user.plan) ? "★ Pro" : "Free plan"}</span>
          {!isPro(user.plan) && <Link href="/pricing" className="btn-primary px-4 py-2 text-xs">Upgrade</Link>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <Sidebar items={items} publicHref={`/p/${profile.slug}`} publicLabel="View public profile" />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
