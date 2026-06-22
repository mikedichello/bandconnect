"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, SlidersHorizontal, CalendarPlus, CalendarDays, CalendarCheck,
  Users, Mail, Bell, CreditCard, ExternalLink, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icons are mapped here (a Client Component) by string key, because component
// functions can't be passed as props from a Server Component to a Client one.
const ICONS: Record<string, LucideIcon> = {
  overview: Home,
  profile: SlidersHorizontal,
  events: CalendarPlus,
  calendar: CalendarDays,
  availability: CalendarCheck,
  network: Users,
  messages: Mail,
  notifications: Bell,
  billing: CreditCard,
};

export interface NavItem {
  href: string;
  label: string;
  icon: string; // key into ICONS
  badge?: number;
}

export function Sidebar({
  items,
  publicHref,
  publicLabel,
}: {
  items: NavItem[];
  publicHref: string | null;
  publicLabel: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="md:sticky md:top-20 md:h-fit">
      <nav className="card overflow-hidden p-2" aria-label="Dashboard">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const Icon = ICONS[item.icon] ?? Home;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-brand-500/15 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {item.label}
              </span>
              {item.badge ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white">
                  {item.badge}
                  <span className="sr-only"> new</span>
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {publicHref && (
        <Link href={publicHref} target="_blank" className="btn-outline mt-3 w-full">
          {publicLabel}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </aside>
  );
}
