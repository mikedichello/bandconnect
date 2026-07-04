"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Image as ImageIcon } from "lucide-react";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export interface MediaRow {
  id: string;
  kind: string;
  url: string;
  caption: string | null;
}

export function MediaManager({ initial }: { initial: MediaRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState<MediaRow[]>(initial);
  const [kind, setKind] = useState<"IMAGE" | "VIDEO">("IMAGE");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, url, caption }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not add");
      setBusy(false);
      return;
    }
    setItems((p) => [...p, data.item]);
    setUrl("");
    setCaption("");
    setBusy(false);
    router.refresh();
  }

  async function remove(id: string) {
    const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((p) => p.filter((i) => i.id !== id));
      router.refresh();
    }
  }

  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold">Media gallery</h2>
      <p className="mt-1 text-sm text-subtle">Add image URLs or video links (YouTube, Vimeo, or direct).</p>

      <form onSubmit={add} className="mt-4 grid gap-3 sm:grid-cols-[120px_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="m-kind" className="label">Type</label>
          <select id="m-kind" className="input" value={kind} onChange={(e) => setKind(e.target.value as "IMAGE" | "VIDEO")}>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
          </select>
        </div>
        <div>
          <label htmlFor="m-url" className="label">URL</label>
          <input id="m-url" className="input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={kind === "VIDEO" ? "https://youtube.com/watch?v=…" : "https://…/photo.jpg"} required />
        </div>
        <button className="btn-primary" disabled={busy}>{busy ? "Adding…" : "Add"}</button>
        <div className="sm:col-span-3">
          <input className="input" aria-label="Caption" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" maxLength={160} />
        </div>
      </form>
      {error && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>}

      {items.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {items.map((m) => (
            <div key={m.id} className="relative overflow-hidden rounded-xl border border-line">
              <div className="aspect-video w-full bg-input">
                {m.kind === "VIDEO" ? (
                  <div className="grid h-full w-full place-items-center"><Play className="h-6 w-6 text-subtle" aria-hidden="true" /></div>
                ) : (
                  <ImageWithFallback src={m.url} alt={m.caption ?? ""} className="h-full w-full object-cover" fallback={<div className="grid h-full w-full place-items-center"><ImageIcon className="h-6 w-6 text-subtle" aria-hidden="true" /></div>} />
                )}
              </div>
              <button onClick={() => remove(m.id)} className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white hover:bg-red-500/80">Remove</button>
              {m.caption && <p className="truncate px-2 py-1 text-xs text-subtle">{m.caption}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
