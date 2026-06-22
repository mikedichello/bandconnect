"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn, timeAgo } from "@/lib/utils";

export interface NotifRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  linkUrl: string | null;
  read: boolean;
  createdAt: string;
}

const ICONS: Record<string, string> = {
  FOLLOW: "👤", FRIEND_REQUEST: "🤝", FRIEND_ACCEPT: "✅", MESSAGE: "✉️",
  RSVP: "🎟️", SHARE: "🔗", EVENT_REMINDER: "🔔",
};

export function NotificationsList({ initial }: { initial: NotifRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);

  async function markAll() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" });
    setItems((p) => p.map((i) => ({ ...i, read: true })));
    router.refresh();
  }

  async function markOne(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setItems((p) => p.map((i) => (i.id === id ? { ...i, read: true } : i)));
    router.refresh();
  }

  const unread = items.filter((i) => !i.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          <p className="text-sm text-zinc-400">{unread > 0 ? `${unread} unread` : "You're all caught up."}</p>
        </div>
        {unread > 0 && <button onClick={markAll} className="btn-ghost text-sm">Mark all read</button>}
      </div>

      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-3xl">🔔</div>
          <p className="mt-3 text-zinc-400">No notifications yet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => {
            const inner = (
              <div className="flex items-start gap-3">
                <span className="text-lg">{ICONS[n.type] ?? "🔔"}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{n.title}</p>
                  {n.body && <p className="truncate text-sm text-zinc-400">{n.body}</p>}
                  <p className="mt-0.5 text-xs text-zinc-400">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <>
                    <span className="sr-only">Unread.</span>
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  </>
                )}
              </div>
            );
            return (
              <li key={n.id}>
                {n.linkUrl ? (
                  <Link href={n.linkUrl} onClick={() => markOne(n.id)} className={cn("block card p-4 transition hover:border-white/20", !n.read && "border-brand-400/30 bg-brand-500/5")}>
                    {inner}
                  </Link>
                ) : (
                  <button onClick={() => markOne(n.id)} className={cn("block w-full text-left card p-4 transition hover:border-white/20", !n.read && "border-brand-400/30 bg-brand-500/5")}>
                    {inner}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
