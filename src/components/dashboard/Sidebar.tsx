"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
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
      <nav className="card overflow-hidden p-2">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-brand-500/15 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <span className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                {item.label}
              </span>
              {item.badge ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {publicHref && (
        <Link
          href={publicHref}
          target="_blank"
          className="btn-outline mt-3 w-full"
        >
          {publicLabel} ↗
        </Link>
      )}
    </aside>
  );
}
