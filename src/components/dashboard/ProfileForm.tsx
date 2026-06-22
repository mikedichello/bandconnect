"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GENRES } from "@/lib/utils";

type Role = "BAND" | "VENUE";

// A loose shape covering both profile types; only relevant fields are used.
export interface ProfileFormValues {
  name: string;
  tagline?: string | null;
  bio?: string | null;
  description?: string | null;
  genre?: string | null;
  genresWanted?: string | null;
  city?: string | null;
  address?: string | null;
  capacity?: number | null;
  memberCount?: number | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  websiteUrl?: string | null;
  instagram?: string | null;
  spotify?: string | null;
  bandcamp?: string | null;
  youtube?: string | null;
  lookingForGigs?: boolean;
  acceptingSubmissions?: boolean;
  themeColor?: string | null;
}

export function ProfileForm({
  role,
  isPro,
  initial,
}: {
  role: Role;
  isPro: boolean;
  initial: ProfileFormValues;
}) {
  const router = useRouter();
  const isBand = role === "BAND";
  const [v, setV] = useState<ProfileFormValues>({
    ...initial,
    themeColor: initial.themeColor || "#7c4dff",
  });
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProfileFormValues>(key: K, value: ProfileFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError(null);

    const payload: Record<string, unknown> = {
      name: v.name,
      tagline: v.tagline ?? "",
      city: v.city ?? "",
      imageUrl: v.imageUrl ?? "",
      bannerUrl: v.bannerUrl ?? "",
      websiteUrl: v.websiteUrl ?? "",
      instagram: v.instagram ?? "",
      themeColor: v.themeColor ?? "",
    };
    if (isBand) {
      Object.assign(payload, {
        bio: v.bio ?? "",
        genre: v.genre ?? "",
        spotify: v.spotify ?? "",
        bandcamp: v.bandcamp ?? "",
        youtube: v.youtube ?? "",
        lookingForGigs: v.lookingForGigs ?? true,
        memberCount: v.memberCount ?? null,
      });
    } else {
      Object.assign(payload, {
        description: v.description ?? "",
        address: v.address ?? "",
        genresWanted: v.genresWanted ?? "",
        capacity: v.capacity ?? null,
        acceptingSubmissions: v.acceptingSubmissions ?? true,
      });
    }

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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

  function toggleGenre(genre: string, field: "genre" | "genresWanted") {
    const current = (v[field] ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const exists = current.includes(genre);
    const next = exists ? current.filter((g) => g !== genre) : [...current, genre];
    set(field, next.join(", "));
  }

  const selectedGenres = (isBand ? v.genre : v.genresWanted) ?? "";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basics */}
      <Section title="Basics" subtitle="The essentials shown at the top of your page.">
        <Field label={isBand ? "Band name" : "Venue name"} required>
          <input className="input" value={v.name} onChange={(e) => set("name", e.target.value)} required />
        </Field>
        <Field label="Tagline" hint="One short line under your name.">
          <input className="input" maxLength={120} placeholder={isBand ? "Loud, fast & from Brooklyn" : "200-cap room in the heart of downtown"} value={v.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City">
            <input className="input" placeholder="Brooklyn, NY" value={v.city ?? ""} onChange={(e) => set("city", e.target.value)} />
          </Field>
          {isBand ? (
            <Field label="Members">
              <input type="number" min={1} max={50} className="input" value={v.memberCount ?? ""} onChange={(e) => set("memberCount", e.target.value ? Number(e.target.value) : null)} />
            </Field>
          ) : (
            <Field label="Capacity">
              <input type="number" min={0} className="input" value={v.capacity ?? ""} onChange={(e) => set("capacity", e.target.value ? Number(e.target.value) : null)} />
            </Field>
          )}
        </div>
        {!isBand && (
          <Field label="Address" hint="Shown on your public page so bands can find you.">
            <input className="input" placeholder="123 Main St" value={v.address ?? ""} onChange={(e) => set("address", e.target.value)} />
          </Field>
        )}
        <Field label={isBand ? "Bio" : "About the venue"}>
          <textarea
            className="input min-h-[120px]"
            placeholder={isBand ? "Tell venues who you are and what you sound like…" : "Describe your room, sound system, vibe, and what nights you book…"}
            value={(isBand ? v.bio : v.description) ?? ""}
            onChange={(e) => set(isBand ? "bio" : "description", e.target.value)}
          />
        </Field>
      </Section>

      {/* Genres */}
      <Section
        title={isBand ? "Genres" : "Genres you book"}
        subtitle="Tap to toggle. These power discovery and matching."
      >
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const active = selectedGenres.split(",").map((s) => s.trim()).includes(g);
            return (
              <button
                type="button"
                key={g}
                onClick={() => toggleGenre(g, isBand ? "genre" : "genresWanted")}
                className={
                  "rounded-full border px-3 py-1.5 text-sm transition " +
                  (active
                    ? "border-brand-400/60 bg-brand-500/20 text-white"
                    : "border-white/10 bg-black/20 text-zinc-300 hover:border-white/25")
                }
              >
                {g}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Links & media */}
      <Section title="Links & media" subtitle="Add image URLs and your links. (Paste any hosted image URL.)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Profile image URL">
            <input className="input" placeholder="https://…/photo.jpg" value={v.imageUrl ?? ""} onChange={(e) => set("imageUrl", e.target.value)} />
          </Field>
          <Field label="Banner image URL">
            <input className="input" placeholder="https://…/banner.jpg" value={v.bannerUrl ?? ""} onChange={(e) => set("bannerUrl", e.target.value)} />
          </Field>
          <Field label="Website">
            <input className="input" placeholder="https://…" value={v.websiteUrl ?? ""} onChange={(e) => set("websiteUrl", e.target.value)} />
          </Field>
          <Field label="Instagram" hint="Handle or full URL.">
            <input className="input" placeholder="@yourhandle" value={v.instagram ?? ""} onChange={(e) => set("instagram", e.target.value)} />
          </Field>
          {isBand && (
            <>
              <Field label="Spotify">
                <input className="input" placeholder="https://open.spotify.com/…" value={v.spotify ?? ""} onChange={(e) => set("spotify", e.target.value)} />
              </Field>
              <Field label="Bandcamp">
                <input className="input" placeholder="https://….bandcamp.com" value={v.bandcamp ?? ""} onChange={(e) => set("bandcamp", e.target.value)} />
              </Field>
              <Field label="YouTube">
                <input className="input" placeholder="https://youtube.com/…" value={v.youtube ?? ""} onChange={(e) => set("youtube", e.target.value)} />
              </Field>
            </>
          )}
        </div>
      </Section>

      {/* Availability */}
      <Section title="Availability" subtitle="Let the other side know you're open for business.">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-white/20 bg-black/40 accent-brand-500"
            checked={isBand ? (v.lookingForGigs ?? true) : (v.acceptingSubmissions ?? true)}
            onChange={(e) => set(isBand ? "lookingForGigs" : "acceptingSubmissions", e.target.checked)}
          />
          <span className="text-sm text-zinc-200">
            {isBand ? "We're actively looking for gigs" : "We're accepting booking submissions"}
          </span>
        </label>
      </Section>

      {/* Branding (Pro) */}
      <Section title="Branding" subtitle="Customize your page theme color.">
        <div className="flex items-center gap-4">
          <input
            type="color"
            disabled={!isPro}
            value={v.themeColor ?? "#7c4dff"}
            onChange={(e) => set("themeColor", e.target.value)}
            className="h-11 w-16 cursor-pointer rounded-lg border border-white/10 bg-transparent disabled:cursor-not-allowed disabled:opacity-50"
          />
          <div className="text-sm">
            {isPro ? (
              <span className="text-zinc-300">Theme color: {v.themeColor}</span>
            ) : (
              <span className="text-zinc-400">
                Custom theme colors are a Pro feature.{" "}
                <Link href="/pricing" className="text-brand-300 hover:text-brand-200">
                  Upgrade →
                </Link>
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* Sticky save bar */}
      <div className="sticky bottom-4 z-10 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-ink-soft/90 px-4 py-3 backdrop-blur">
        <div className="text-sm">
          {status === "saved" && <span className="text-emerald-300">✓ Saved</span>}
          {status === "error" && <span className="text-red-300">{error}</span>}
          {status === "saving" && <span className="text-zinc-400">Saving…</span>}
          {status === "idle" && <span className="text-zinc-500">Unsaved changes save instantly.</span>}
        </div>
        <button type="submit" disabled={status === "saving"} className="btn-primary">
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
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

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}
