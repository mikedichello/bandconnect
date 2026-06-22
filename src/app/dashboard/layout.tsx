import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Sidebar, type NavItem } from "@/components/dashboard/Sidebar";
import { isPro } from "@/lib/plans";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const isBand = user.role === "BAND";
  const profile = isBand ? user.bandProfile : user.venueProfile;

  // Unread message count + pending submission count for sidebar badges.
  const [unread, pendingSubs] = await Promise.all([
    prisma.message.count({
      where: { recipientId: user.id, readAt: null },
    }),
    isBand
      ? Promise.resolve(0)
      : user.venueProfile
        ? prisma.submission.count({
            where: { venueProfileId: user.venueProfile.id, status: "PENDING" },
          })
        : Promise.resolve(0),
  ]);

  const items: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: "🏠" },
    { href: "/dashboard/profile", label: "Edit profile", icon: "🎛️" },
    { href: "/dashboard/shows", label: "My shows", icon: "📅" },
    {
      href: "/dashboard/submissions",
      label: isBand ? "My submissions" : "Booking requests",
      icon: "📨",
      badge: pendingSubs || undefined,
    },
    { href: "/dashboard/messages", label: "Messages", icon: "✉️", badge: unread || undefined },
    { href: "/dashboard/billing", label: "Billing", icon: "💳" },
  ];

  const publicHref = profile ? (isBand ? `/bands/${profile.slug}` : `/venues/${profile.slug}`) : null;

  return (
    <div className="container-page py-8">
      {/* Header strip */}
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-zinc-400">
            {isBand ? "Band dashboard" : "Venue dashboard"}
          </p>
          <h1 className="text-2xl font-bold">{profile?.name ?? "Your account"}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={isPro(user.plan) ? "badge-brand" : "badge"}>
            {isPro(user.plan) ? "★ Pro plan" : "Free plan"}
          </span>
          {!isPro(user.plan) && (
            <Link href="/pricing" className="btn-primary px-4 py-2 text-xs">
              Upgrade
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[240px_1fr]">
        <Sidebar
          items={items}
          publicHref={publicHref}
          publicLabel="View public page"
        />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
