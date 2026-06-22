"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";

export interface OpenDate {
  id: string;
  date: string;
  note: string | null;
}

export function AvailabilityManager({ initial }: { initial: OpenDate[] }) {
  const router = useRouter();
  const [dates, setDates] = useState<OpenDate[]>(initial);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, note }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not add date");
      setBusy(false);
      return;
    }
    setDates((p) => [...p, data.item].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setDate("");
    setNote("");
    setBusy(false);
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/availability/${id}`, { method: "DELETE" });
    if (res.ok) {
      setDates((p) => p.filter((d) => d.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Availability</h1>
        <p className="text-sm text-zinc-400">Mark the dates you&apos;re open to play. Venues and bands can search by date.</p>
      </div>

      <form onSubmit={add} className="card grid gap-3 p-6 sm:grid-cols-[180px_1fr_auto] sm:items-end">
        <div>
          <label className="label">Open date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <label className="label">Note <span className="text-zinc-400">(optional)</span></label>
          <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Prefer evenings, will travel…" maxLength={160} />
        </div>
        <button className="btn-primary" disabled={busy}>{busy ? "Adding…" : "Add date"}</button>
        {error && <p className="text-sm text-red-300 sm:col-span-3">{error}</p>}
      </form>

      <div className="card p-6">
        <h2 className="text-lg font-semibold">Open dates</h2>
        {dates.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-400">No open dates yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-white/5">
            {dates.map((d) => (
              <li key={d.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-white">{formatDate(d.date)}</p>
                  {d.note && <p className="text-sm text-zinc-400">{d.note}</p>}
                </div>
                <button onClick={() => remove(d.id)} className="text-sm text-zinc-400 hover:text-red-300">Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
