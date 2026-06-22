"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GENRES, INSTRUMENTS, MUSICIAN_STATUS, isArtist } from "@/lib/constants";

export interface ProfileValues {
  type: string;
  displayName: string;
  tagline?: string | null;
  bio?: string | null;
  city?: string | null;
  zip?: string | null;
  address?: string | null;
  genres?: string | null;
  instruments?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  websiteUrl?: string | null;
  instagram?: string | null;
  spotify?: string | null;
  youtube?: string | null;
  bandcamp?: string | null;
  availableForGigs?: boolean;
  rateMin?: number | null;
  rateMax?: number | null;
  rateHidden?: boolean;
  isSolo?: boolean;
  wantsStartBand?: boolean;
  wantsJoinBand?: boolean;
  openForFillIns?: boolean;
  needsMusicians?: boolean;
  themeColor?: string | null;
}

export function ProfileEditor({ isPro, initial }: { isPro: boolean; initial: ProfileValues }) {
  const router = useRouter();
  const type = initial.type;
  const artist = isArtist(type);
  const [v, setV] = useState<ProfileValues>({ ...initial, themeColor: initial.themeColor || "#7c4dff" });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProfileValues>(k: K, val: ProfileValues[K]) {
    setV((p) => ({ ...p, [k]: val }));
    setStatus("idle");
  }

  function toggleTag(field: "genres" | "instruments", tag: string) {
    const cur = (v[field] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const next = cur.includes(tag) ? cur.filter((g) => g !== tag) : [...cur, tag];
    set(field, next.join(", "));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: v.displayName,
        tagline: v.tagline ?? "",
        bio: v.bio ?? "",
        city: v.city ?? "",
        zip: v.zip ?? "",
        address: v.address ?? "",
        genres: v.genres ?? "",
        instruments: v.instruments ?? "",
        avatarUrl: v.avatarUrl ?? "",
        bannerUrl: v.bannerUrl ?? "",
        websiteUrl: v.websiteUrl ?? "",
        instagram: v.instagram ?? "",
        spotify: v.spotify ?? "",
        youtube: v.youtube ?? "",
        bandcamp: v.bandcamp ?? "",
        availableForGigs: v.availableForGigs ?? false,
        rateMin: v.rateMin ?? null,
        rateMax: v.rateMax ?? null,
        rateHidden: v.rateHidden ?? false,
        isSolo: v.isSolo ?? false,
        wantsStartBand: v.wantsStartBand ?? false,
        wantsJoinBand: v.wantsJoinBand ?? false,
        openForFillIns: v.openForFillIns ?? false,
        needsMusicians: v.needsMusicians ?? false,
        themeColor: v.themeColor ?? "",
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Could not save");
      return;
    }
    setStatus("saved");
    router.refresh();
  }

  const selGenres = (v.genres ?? "").split(",").map((s) => s.trim());
  const selInstruments = (v.instruments ?? "").split(",").map((s) => s.trim());

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Section title="Basics">
        <Field label={type === "VENUE" ? "Venue name" : "Name"} required>
          <input className="input" value={v.displayName} onChange={(e) => set("displayName", e.target.value)} required />
        </Field>
        <Field label="Tagline">
          <input className="input" maxLength={140} value={v.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} placeholder="One short line about you" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="CT town"><input className="input" value={v.city ?? ""} onChange={(e) => set("city", e.target.value)} placeholder="New Haven" /></Field>
          <Field label="ZIP"><input className="input" value={v.zip ?? ""} onChange={(e) => set("zip", e.target.value)} placeholder="06511" /></Field>
        </div>
        {type === "VENUE" && (
          <Field label="Address"><input className="input" value={v.address ?? ""} onChange={(e) => set("address", e.target.value)} placeholder="295 Treadwell St" /></Field>
        )}
        <Field label={type === "VENUE" ? "About the venue" : "Bio"}>
          <textarea className="input min-h-[120px]" value={v.bio ?? ""} onChange={(e) => set("bio", e.target.value)} placeholder="Tell people who you are…" />
        </Field>
      </Section>

      {(type === "VENUE" || artist) && (
        <Section title={type === "VENUE" ? "Genres you book" : "Genres"}>
          <TagGrid options={GENRES as readonly string[]} selected={selGenres} onToggle={(t) => toggleTag("genres", t)} />
        </Section>
      )}

      {type === "MUSICIAN" && (
        <Section title="Instruments">
          <TagGrid options={INSTRUMENTS as readonly string[]} selected={selInstruments} onToggle={(t) => toggleTag("instruments", t)} />
        </Section>
      )}

      {artist && (
        <Section title="Gigs & availability" subtitle="Let venues and bands know what you're up for.">
          <label className="flex items-center gap-3">
            <input type="checkbox" className="h-5 w-5 accent-brand-500" checked={v.availableForGigs ?? false} onChange={(e) => set("availableForGigs", e.target.checked)} />
            <span className="text-sm text-zinc-200">Available for gigs</span>
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Rate min ($)"><input type="number" min={0} className="input" value={v.rateMin ?? ""} onChange={(e) => set("rateMin", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="Rate max ($)"><input type="number" min={0} className="input" value={v.rateMax ?? ""} onChange={(e) => set("rateMax", e.target.value ? Number(e.target.value) : null)} /></Field>
            <Field label="blank">
              <label className="flex h-[42px] items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" className="h-4 w-4 accent-brand-500" checked={v.rateHidden ?? false} onChange={(e) => set("rateHidden", e.target.checked)} />
                Hide my rate
              </label>
            </Field>
          </div>
          {type === "MUSICIAN" && (
            <div className="space-y-2">
              <p className="label">I&apos;m…</p>
              {MUSICIAN_STATUS.map((s) => (
                <label key={s.key} className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4 accent-brand-500" checked={Boolean(v[s.key as keyof ProfileValues])} onChange={(e) => set(s.key as keyof ProfileValues, e.target.checked as never)} />
                  <span className="text-sm text-zinc-200">{s.label}</span>
                </label>
              ))}
            </div>
          )}
          {type === "BAND" && (
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-5 w-5 accent-brand-500" checked={v.needsMusicians ?? false} onChange={(e) => set("needsMusicians", e.target.checked)} />
              <span className="text-sm text-zinc-200">We have an open spot — looking for musicians</span>
            </label>
          )}
        </Section>
      )}

      <Section title="Photos & links" subtitle="Paste hosted image URLs and your links.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Avatar URL"><input className="input" value={v.avatarUrl ?? ""} onChange={(e) => set("avatarUrl", e.target.value)} placeholder="https://…/photo.jpg" /></Field>
          <Field label="Banner URL"><input className="input" value={v.bannerUrl ?? ""} onChange={(e) => set("bannerUrl", e.target.value)} placeholder="https://…/banner.jpg" /></Field>
          <Field label="Website"><input className="input" value={v.websiteUrl ?? ""} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://…" /></Field>
          <Field label="Instagram"><input className="input" value={v.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} placeholder="@handle" /></Field>
          {artist && <>
            <Field label="Spotify"><input className="input" value={v.spotify ?? ""} onChange={(e) => set("spotify", e.target.value)} placeholder="https://open.spotify.com/…" /></Field>
            <Field label="YouTube"><input className="input" value={v.youtube ?? ""} onChange={(e) => set("youtube", e.target.value)} placeholder="https://youtube.com/…" /></Field>
            <Field label="Bandcamp"><input className="input" value={v.bandcamp ?? ""} onChange={(e) => set("bandcamp", e.target.value)} placeholder="https://….bandcamp.com" /></Field>
          </>}
        </div>
      </Section>

      <Section title="Branding">
        <div className="flex items-center gap-4">
          <input type="color" disabled={!isPro} value={v.themeColor ?? "#7c4dff"} onChange={(e) => set("themeColor", e.target.value)} className="h-11 w-16 cursor-pointer rounded-lg border border-white/10 bg-transparent disabled:opacity-50" />
          <div className="text-sm">
            {isPro ? <span className="text-zinc-300">Theme color: {v.themeColor}</span> : (
              <span className="text-zinc-400">Custom theme is a Pro feature. <Link href="/pricing" className="text-brand-300 hover:text-brand-200">Upgrade →</Link></span>
            )}
          </div>
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink-soft/90 px-4 py-3 backdrop-blur">
        <div className="text-sm">
          {status === "saved" && <span className="text-emerald-300">✓ Saved</span>}
          {status === "error" && <span className="text-red-300">{error}</span>}
          {status === "saving" && <span className="text-zinc-400">Saving…</span>}
          {status === "idle" && <span className="text-zinc-500">Make it yours.</span>}
        </div>
        <button type="submit" disabled={status === "saving"} className="btn-primary">{status === "saving" ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label === "blank" ? " " : label} {required && <span className="text-accent">*</span>}</label>
      {children}
    </div>
  );
}

function TagGrid({ options, selected, onToggle }: { options: readonly string[]; selected: string[]; onToggle: (t: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = selected.includes(o);
        return (
          <button type="button" key={o} onClick={() => onToggle(o)} className={"rounded-full border px-3 py-1.5 text-sm transition " + (active ? "border-brand-400/60 bg-brand-500/20 text-white" : "border-white/10 bg-black/20 text-zinc-300 hover:border-white/25")}>
            {o}
          </button>
        );
      })}
    </div>
  );
}
