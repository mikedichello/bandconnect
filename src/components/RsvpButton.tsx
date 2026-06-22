"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Status = "GOING" | "MAYBE" | null;

export function RsvpButton({
  eventId,
  initialStatus,
  loggedIn,
  loginHref,
  compact,
}: {
  eventId: string;
  initialStatus: Status;
  loggedIn: boolean;
  loginHref: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [loading, setLoading] = useState(false);

  if (!loggedIn) {
    return (
      <Link href={loginHref} className={cn("btn-ghost", compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm")}>
        RSVP
      </Link>
    );
  }

  async function set(next: "GOING" | "MAYBE") {
    setLoading(true);
    const target = status === next ? "NONE" : next;
    const res = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, status: target }),
    });
    if (res.ok) {
      setStatus(target === "NONE" ? null : next);
      router.refresh();
    }
    setLoading(false);
  }

  const base = compact ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm";
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-line">
      <button
        onClick={() => set("GOING")}
        disabled={loading}
        className={cn(base, "font-semibold transition", status === "GOING" ? "bg-emerald-500 text-white" : "bg-elevated text-muted hover:bg-elevated")}
      >
        Going
      </button>
      <button
        onClick={() => set("MAYBE")}
        disabled={loading}
        className={cn(base, "font-semibold transition border-l border-line", status === "MAYBE" ? "bg-amber-500 text-white" : "bg-elevated text-muted hover:bg-elevated")}
      >
        Maybe
      </button>
    </div>
  );
}
