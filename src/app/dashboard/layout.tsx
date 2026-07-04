import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Star } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/dashboard/Sidebar";
import { ProfileTypeIcon } from "@/components/ProfileTypeIcon";
import { isPro } from "@/lib/plans";
import { isAdmin } from "@/lib/admin";
import { isArtist, profileTypeMeta } from "@/lib/constants";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const profile = user.profile;
  if (!profile) {
    return <div className="container-page py-10 text-subtle">No profile found.</div>;
  }
  const type = profile.type;
  const meta = profileTypeMeta(type);

  const [unreadMessages, unreadNotifications, pendingFriends] = await Promise.all([
    prisma.message.count({ where: { recipientId: user.id, readAt: null } }),
    prisma.notification.count({ where: { userId: user.id, read: false } }),
    prisma.friendship.count({ where: { addresseeId: profile.id, status: "PENDING" } }),
  ]);

  const items: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: "overview" },
    { href: "/dashboard/profile", label: "Edit profile", icon: "profile" },
    ...(type !== "FAN" ? [{ href: "/dashboard/events", label: "My events", icon: "events" } as NavItem] : []),
    { href: "/dashboard/calendar", label: type === "FAN" ? "My calendar" : "Calendar", icon: "calendar" },
    ...(isArtist(type) ? [{ href: "/dashboard/availability", label: "Availability", icon: "availability" } as NavItem] : []),
    { href: "/dashboard/network", label: "Network", icon: "network", badge: pendingFriends || undefined },
    { href: "/dashboard/messages", label: "Messages", icon: "messages", badge: unreadMessages || undefined },
    { href: "/dashboard/notifications", label: "Notifications", icon: "notifications", badge: unreadNotifications || undefined },
    { href: "/dashboard/alerts", label: "Alerts", icon: "alerts" },
    { href: "/dashboard/billing", label: "Billing", icon: "billing" },
    ...(isAdmin(user.email) ? [{ href: "/dashboard/admin", label: "Admin", icon: "admin" } as NavItem] : []),
  ];

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm text-subtle">
            <ProfileTypeIcon icon={meta.icon} className="h-4 w-4" />
            {meta.label} dashboard
          </p>
          <h1 className="text-2xl font-bold">{profile.displayName}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isPro(user.plan) ? (
            <span className="badge-brand"><Star className="h-3 w-3 fill-current" aria-hidden="true" />Pro</span>
          ) : (
            <span className="badge">Free plan</span>
          )}
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
