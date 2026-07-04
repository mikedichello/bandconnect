"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell } from "lucide-react";

export interface AlertRow {
  id: string;
  label: string;
  city: string | null;
  genre: string | null;
}

export function AlertsManager({ initial }: { initial: AlertRow[] }) {
  const router = useRouter();
  const [alerts, setAlerts] = useState(initial);

  async function remove(id: string) {
    const res = await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAlerts((p) => p.filter((a) => a.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Alerts</h1>
        <p className="text-sm text-subtle">
          Get notified when a new show matches. Create one from the{" "}
          <Link href="/" className="link">calendar</Link> — filter
          by town or genre, then “Save this search”.
        </p>
      </div>

      {alerts.length === 0 ? (
        <div className="card p-10 text-center">
          <Bell className="mx-auto h-7 w-7 text-subtle" aria-hidden="true" />
          <p className="mt-3 text-subtle">No alerts yet.</p>
          <Link href="/" className="btn-primary mt-4">Browse the calendar</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li key={a.id} className="card flex items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300">
                  <Bell className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium text-fg">{a.label}</p>
                  <p className="text-xs text-subtle">
                    {[a.city, a.genre].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
              <button onClick={() => remove(a.id)} className="text-sm text-subtle hover:text-red-600 dark:hover:text-red-300">Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
