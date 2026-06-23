"use client";

import { useState } from "react";
import Link from "next/link";
import { BellPlus } from "lucide-react";

/**
 * Saves the current calendar location/genre filter as an alert. Only rendered
 * when signed in and at least one of city/genre is set.
 */
export function SaveAlertButton({ city, genre }: { city: string; genre: string }) {
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!city && !genre) return null;

  async function save() {
    setState("saving");
    setError(null);
    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, genre }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState("error");
      setError(data.error ?? "Could not save");
      return;
    }
    setState("saved");
  }

  if (state === "saved") {
    return (
      <span role="status" className="text-xs text-emerald-700 dark:text-emerald-400">
        ✓ Alert saved ·{" "}
        <Link href="/dashboard/alerts" className="underline link">manage</Link>
      </span>
    );
  }

  return (
    <button
      onClick={save}
      disabled={state === "saving"}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-elevated px-3 py-1.5 text-xs font-medium text-muted transition hover:text-fg"
      title="Get notified when matching shows are posted"
    >
      <BellPlus className="h-3.5 w-3.5" aria-hidden="true" />
      {state === "error" ? error : "Save this search"}
    </button>
  );
}
