"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate, formatTime } from "@/lib/utils";

export interface ShowItem {
  id: string;
  title: string;
  date: string; // ISO
  city: string | null;
  venueName: string | null;
  bandName: string | null;
  ticketUrl: string | null;
  isPublic: boolean;
}

export function ShowsManager({
  initialShows,
  atLimit,
  limitLabel,
}: {
  initialShows: ShowItem[];
  atLimit: boolean;
  limitLabel: string;
}) {
  const router = useRouter();
  const [shows, setShows] = useState<ShowItem[]>(initialShows);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const now = Date.now();
  const upcoming = shows.filter((s) => new Date(s.date).getTime() >= now);
  const past = shows.filter((s) => new Date(s.date).getTime() < now);

  async function addShow(form: FormData) {
    setSaving(true);
    setError(null);
    const payload = {
      title: form.get("title"),
      date: form.get("date"),
      city: form.get("city"),
      venueName: form.get("venueName"),
      bandName: form.get("bandName"),
      ticketUrl: form.get("ticketUrl"),
      description: form.get("description"),
      isPublic: true,
    };
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not add show");
      setSaving(false);
      return;
    }
    setShows((prev) =>
      [...prev, { ...data.event, date: data.event.date }].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    );
    setOpen(false);
    setSaving(false);
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setShows((prev) => prev.filter((s) => s.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">My shows</h1>
          <p className="text-sm text-zinc-400">{limitLabel}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            if (atLimit) return;
            setOpen((o) => !o);
          }}
          disabled={atLimit}
        >
          + Add show
        </button>
      </div>

      {atLimit && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          You&apos;ve reached your plan&apos;s upcoming-show limit.{" "}
          <Link href="/pricing" className="font-medium underline">Upgrade to Pro</Link> for unlimited shows.
        </div>
      )}

      {open && (
        <form
          action={addShow}
          className="card space-y-4 p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Show title *</label>
              <input name="title" required className="input" placeholder="Friday Night Live" />
            </div>
            <div>
              <label className="label">Date & time *</label>
              <input name="date" type="datetime-local" required className="input" />
            </div>
            <div>
              <label className="label">City</label>
              <input name="city" className="input" placeholder="Brooklyn, NY" />
            </div>
            <div>
              <label className="label">Venue</label>
              <input name="venueName" className="input" placeholder="The Underground" />
            </div>
            <div>
              <label className="label">Lineup / band</label>
              <input name="bandName" className="input" placeholder="The Night Owls + guests" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Ticket link</label>
              <input name="ticketUrl" className="input" placeholder="https://…" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Details</label>
              <textarea name="description" className="input min-h-[80px]" placeholder="Doors at 8, $10 cover…" />
            </div>
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Adding…" : "Add show"}
            </button>
          </div>
        </form>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="card p-6 text-sm text-zinc-400">No upcoming shows yet.</p>
        ) : (
          <ul className="space-y-3">
            {upcoming.map((s) => (
              <ShowRow key={s.id} show={s} onDelete={() => remove(s.id)} />
            ))}
          </ul>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Past</h2>
          <ul className="space-y-3 opacity-70">
            {past.map((s) => (
              <ShowRow key={s.id} show={s} onDelete={() => remove(s.id)} past />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ShowRow({ show, onDelete, past }: { show: ShowItem; onDelete: () => void; past?: boolean }) {
  return (
    <li className="card flex items-center justify-between gap-4 p-4">
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl bg-brand-500/15 text-center">
          <div className="text-xs font-semibold uppercase text-brand-300">
            {new Date(show.date).toLocaleDateString("en-US", { month: "short" })}
          </div>
          <div className="font-display text-lg font-bold leading-none text-white">
            {new Date(show.date).getDate()}
          </div>
        </div>
        <div>
          <p className="font-semibold text-white">{show.title}</p>
          <p className="text-sm text-zinc-400">
            {formatDate(show.date)} · {formatTime(show.date)}
            {show.venueName ? ` · ${show.venueName}` : ""}
            {show.city ? ` · ${show.city}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {show.ticketUrl && !past && (
          <a href={show.ticketUrl} target="_blank" rel="noreferrer" className="text-sm text-brand-300 hover:text-brand-200">
            Tickets ↗
          </a>
        )}
        <button onClick={onDelete} className="text-sm text-zinc-500 hover:text-red-300" aria-label="Delete show">
          Delete
        </button>
      </div>
    </li>
  );
}
