"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GENRES } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/utils";

export interface EventRow {
  id: string;
  title: string;
  startAt: string;
  endAt: string | null;
  city: string | null;
  locationName: string | null;
  familyFriendly: boolean;
  hasCoverCharge: boolean;
  coverType: string;
}

const blank = {
  title: "", description: "", coverUrl: "", coverType: "IMAGE" as "IMAGE" | "VIDEO", coverThumbUrl: "",
  startAt: "", endAt: "", familyFriendly: false, hasCoverCharge: false, genres: "", locationName: "", city: "", zip: "",
};

export function EventsManager({ initial, atLimit, limitLabel }: { initial: EventRow[]; atLimit: boolean; limitLabel: string }) {
  const router = useRouter();
  const [events, setEvents] = useState<EventRow[]>(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...blank });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const now = Date.now();
  const upcoming = events.filter((e) => new Date(e.startAt).getTime() >= now);
  const past = events.filter((e) => new Date(e.startAt).getTime() < now);

  function field<K extends keyof typeof blank>(k: K, val: (typeof blank)[K]) {
    setForm((f) => ({ ...f, [k]: val }));
  }
  function toggleGenre(g: string) {
    const cur = form.genres.split(",").map((s) => s.trim()).filter(Boolean);
    field("genres", (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]).join(", "));
  }

  function startCreate() {
    setEditing(null);
    setForm({ ...blank });
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const url = editing ? `/api/events/${editing}` : "/api/events";
    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not save event");
      setBusy(false);
      return;
    }
    setOpen(false);
    setBusy(false);
    router.refresh();
    // Optimistically reflect in the list.
    const e2 = data.event;
    const row: EventRow = {
      id: e2.id, title: e2.title, startAt: e2.startAt, endAt: e2.endAt, city: e2.city,
      locationName: e2.locationName, familyFriendly: e2.familyFriendly, hasCoverCharge: e2.hasCoverCharge, coverType: e2.coverType,
    };
    setEvents((prev) => {
      const without = prev.filter((p) => p.id !== row.id);
      return [...without, row].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    });
  }

  async function remove(id: string) {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEvents((p) => p.filter((e) => e.id !== id));
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">My events</h1>
          <p className="text-sm text-zinc-400">{limitLabel}</p>
        </div>
        <button className="btn-primary" onClick={startCreate} disabled={atLimit}>+ New event</button>
      </div>

      {atLimit && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          You&apos;ve hit your plan&apos;s upcoming-event limit. <Link href="/pricing" className="font-medium underline">Upgrade to Pro</Link> for unlimited.
        </div>
      )}

      {open && (
        <form onSubmit={submit} className="card space-y-4 p-6">
          <h2 className="font-semibold">{editing ? "Edit event" : "New event"}</h2>
          <div>
            <label className="label">Title *</label>
            <input className="input" value={form.title} onChange={(e) => field("title", e.target.value)} required placeholder="Friday Night Live" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Cover type</label>
              <select className="input" value={form.coverType} onChange={(e) => field("coverType", e.target.value as "IMAGE" | "VIDEO")}>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
              </select>
            </div>
            <div>
              <label className="label">{form.coverType === "VIDEO" ? "Video URL" : "Cover image URL"}</label>
              <input className="input" value={form.coverUrl} onChange={(e) => field("coverUrl", e.target.value)} placeholder={form.coverType === "VIDEO" ? "https://youtube.com/…" : "https://…/cover.jpg"} />
            </div>
            {form.coverType === "VIDEO" && (
              <div className="sm:col-span-2">
                <label className="label">Video thumbnail URL <span className="text-zinc-500">(shown in search/list)</span></label>
                <input className="input" value={form.coverThumbUrl} onChange={(e) => field("coverThumbUrl", e.target.value)} placeholder="https://…/thumb.jpg" />
              </div>
            )}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[90px]" value={form.description} onChange={(e) => field("description", e.target.value)} placeholder="Doors 8pm, all ages…" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Start *</label>
              <input type="datetime-local" className="input" value={form.startAt} onChange={(e) => field("startAt", e.target.value)} required />
            </div>
            <div>
              <label className="label">End <span className="text-zinc-500">(optional)</span></label>
              <input type="datetime-local" className="input" value={form.endAt} onChange={(e) => field("endAt", e.target.value)} />
            </div>
            <div>
              <label className="label">Venue / location name</label>
              <input className="input" value={form.locationName} onChange={(e) => field("locationName", e.target.value)} placeholder="The Space Ballroom" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">CT town</label>
                <input className="input" value={form.city} onChange={(e) => field("city", e.target.value)} placeholder="Hamden" />
              </div>
              <div>
                <label className="label">ZIP</label>
                <input className="input" value={form.zip} onChange={(e) => field("zip", e.target.value)} placeholder="06514" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-zinc-200">
              <input type="checkbox" className="h-5 w-5 accent-brand-500" checked={form.familyFriendly} onChange={(e) => field("familyFriendly", e.target.checked)} /> 👨‍👩‍👧 Family friendly
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-200">
              <input type="checkbox" className="h-5 w-5 accent-brand-500" checked={form.hasCoverCharge} onChange={(e) => field("hasCoverCharge", e.target.checked)} /> 💵 Has a cover charge
            </label>
          </div>
          <div>
            <label className="label">Genre tags</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const active = form.genres.split(",").map((s) => s.trim()).includes(g);
                return (
                  <button type="button" key={g} onClick={() => toggleGenre(g)} className={"rounded-full border px-3 py-1 text-xs transition " + (active ? "border-brand-400/60 bg-brand-500/20 text-white" : "border-white/10 bg-black/20 text-zinc-300 hover:border-white/25")}>{g}</button>
                );
              })}
            </div>
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
            <button type="submit" disabled={busy} className="btn-primary">{busy ? "Saving…" : editing ? "Save event" : "Create event"}</button>
          </div>
        </form>
      )}

      <Group title="Upcoming" rows={upcoming} onDelete={remove} empty="No upcoming events yet." />
      {past.length > 0 && <Group title="Past" rows={past} onDelete={remove} dim />}
    </div>
  );
}

function Group({ title, rows, onDelete, empty, dim }: { title: string; rows: EventRow[]; onDelete: (id: string) => void; empty?: string; dim?: boolean }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</h2>
      {rows.length === 0 ? (
        <p className="card p-6 text-sm text-zinc-400">{empty}</p>
      ) : (
        <ul className={"space-y-3 " + (dim ? "opacity-70" : "")}>
          {rows.map((e) => (
            <li key={e.id} className="card flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl bg-brand-500/15 text-center">
                  <div className="text-xs font-semibold uppercase text-brand-300">{new Date(e.startAt).toLocaleDateString("en-US", { month: "short" })}</div>
                  <div className="font-display text-lg font-bold leading-none text-white">{new Date(e.startAt).getDate()}</div>
                </div>
                <div>
                  <Link href={`/event/${e.id}`} className="font-semibold text-white hover:text-brand-200">{e.title}</Link>
                  <p className="text-sm text-zinc-400">
                    {formatDate(e.startAt)} · {formatTime(e.startAt)}{e.locationName ? ` · ${e.locationName}` : ""}{e.city ? ` · ${e.city}` : ""}
                  </p>
                  <div className="mt-1 flex gap-1.5">
                    {e.coverType === "VIDEO" && <span className="badge text-[10px]">▶ Video</span>}
                    {e.familyFriendly && <span className="badge-green text-[10px]">Family</span>}
                    <span className={e.hasCoverCharge ? "badge text-[10px]" : "badge-accent text-[10px]"}>{e.hasCoverCharge ? "Cover" : "Free"}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => onDelete(e.id)} className="text-sm text-zinc-500 hover:text-red-300">Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
