"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Bell, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const publicLinks = [
  { href: "/", label: "Calendar" },
  { href: "/venues", label: "Venues" },
  { href: "/artists", label: "Artists" },
  { href: "/pricing", label: "Pricing" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const role = session?.user?.role;
  const canPost = role && role !== "FAN";

  // Hide the marketing navbar chrome on auth pages for a cleaner look.
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // Poll unread notification + message counts for the bell badge.
  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    const load = () =>
      fetch("/api/me/badges")
        .then((r) => r.json())
        .then((d) => active && setUnread((d.notifications || 0) + (d.messages || 0)))
        .catch(() => {});
    load();
    const t = setInterval(load, 60000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [status, pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-app/80 backdrop-blur-lg">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-white shadow-glow">
            <BoltIcon />
          </span>
          <span className="font-display text-lg font-bold text-fg">
            Band<span className="text-brand-400">Connect</span>
          </span>
        </Link>

        {!isAuthPage && (
          <div className="hidden items-center gap-1 md:flex">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm font-medium",
                  (link.href === "/" ? pathname === "/" : pathname.startsWith(link.href))
                    ? "bg-elevated text-fg"
                    : "text-muted hover:text-fg",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          {status === "authenticated" ? (
            <>
              {canPost && (
                <Link href="/dashboard/events" className="btn-primary px-4 py-2 text-sm">
                  <Plus className="h-4 w-4" aria-hidden="true" /> Post event
                </Link>
              )}
              <Link
                href="/dashboard/notifications"
                aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
                className="relative grid h-9 w-9 place-items-center rounded-full bg-elevated text-fg hover:bg-elevated"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
              <Link href="/dashboard" className="btn-ghost">
                Dashboard
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-sm text-subtle hover:text-fg">
                Sign out
              </button>
            </>
          ) : status === "loading" ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-elevated" />
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted hover:text-fg">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="text-muted"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <MenuIcon />
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-line bg-app md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {publicLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-fg hover:bg-elevated"
              >
                {link.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-elevated" />
            {status === "authenticated" ? (
              <>
                {canPost && (
                  <Link href="/dashboard/events" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-300 hover:bg-elevated">
                    + Post event
                  </Link>
                )}
                <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-fg hover:bg-elevated">
                  Notifications
                  {unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white">{unread > 9 ? "9+" : unread}</span>}
                </Link>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-fg hover:bg-elevated">
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-lg px-3 py-2 text-left text-sm text-subtle hover:bg-elevated"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-fg hover:bg-elevated">
                  Log in
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-300 hover:bg-elevated">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}
