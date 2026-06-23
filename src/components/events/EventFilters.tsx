"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { MapPin, LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";
import { GENRES } from "@/lib/constants";
import { RADIUS_OPTIONS } from "@/lib/constants";

export function EventFilters({ resolvedLabel }: { resolvedLabel: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [loc, setLoc] = useState(params.get("loc") ?? "");
  const [radius, setRadius] = useState(params.get("radius") ?? "25");
  const [genre, setGenre] = useState(params.get("genre") ?? "");
  const [family, setFamily] = useState(params.get("family") === "1");
  const [noCover, setNoCover] = useState(params.get("noCover") === "1");
  const [locating, setLocating] = useState(false);
  const geoActive = Boolean(params.get("lat") && params.get("lng"));

  function apply(overrides?: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    const set = (k: string, v: string | null) => {
      if (v == null || v === "" || v === "0") next.delete(k);
      else next.set(k, v);
    };
    set("loc", loc.trim());
    // A typed town/ZIP overrides "use my location".
    if (loc.trim()) {
      set("lat", null);
      set("lng", null);
    }
    set("radius", loc.trim() || next.get("lat") ? radius : null);
    set("genre", genre);
    set("family", family ? "1" : null);
    set("noCover", noCover ? "1" : null);
    if (overrides) for (const [k, v] of Object.entries(overrides)) set(k, v);
    router.push(`${pathname}?${next.toString()}`);
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = new URLSearchParams(params.toString());
        next.set("lat", pos.coords.latitude.toFixed(4));
        next.set("lng", pos.coords.longitude.toFixed(4));
        next.set("radius", radius);
        next.delete("loc");
        setLoc("");
        setLocating(false);
        router.push(`${pathname}?${next.toString()}`);
      },
      () => setLocating(false),
      { timeout: 10000, maximumAge: 300000 },
    );
  }

  function clearGeo() {
    const next = new URLSearchParams(params.toString());
    next.delete("lat");
    next.delete("lng");
    next.delete("radius");
    router.push(`${pathname}?${next.toString()}`);
  }

  function reset() {
    const next = new URLSearchParams();
    const view = params.get("view");
    if (view) next.set("view", view);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="card p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
        className="flex flex-col gap-3 lg:flex-row lg:items-end"
      >
        <div className="flex-1">
          <label htmlFor="loc" className="label">City or ZIP (Connecticut)</label>
          <div className="flex gap-2">
            <input
              id="loc"
              value={loc}
              onChange={(e) => setLoc(e.target.value)}
              className="input"
              placeholder="e.g. New Haven or 06511"
            />
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              className="btn-ghost flex-shrink-0 px-3"
              aria-label="Use my location"
              title="Use my location"
            >
              <LocateFixed className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          {geoActive && (
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
              <MapPin className="h-3 w-3" aria-hidden="true" /> Near your location
              <button type="button" onClick={clearGeo} className="ml-1 text-subtle underline hover:text-fg">clear</button>
            </p>
          )}
          {!geoActive && loc.trim() && resolvedLabel && (
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">📍 {resolvedLabel}</p>
          )}
          {!geoActive && loc.trim() && !resolvedLabel && (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">Couldn&apos;t match that CT location.</p>
          )}
        </div>
        <div className="lg:w-40">
          <label htmlFor="radius" className="label">Within</label>
          <select id="radius" value={radius} onChange={(e) => { setRadius(e.target.value); if (geoActive) { const n = new URLSearchParams(params.toString()); n.set("radius", e.target.value); router.push(`${pathname}?${n.toString()}`); } }} className="input" disabled={!loc.trim() && !geoActive}>
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>{r} miles</option>
            ))}
          </select>
        </div>
        <div className="lg:w-44">
          <label htmlFor="genre" className="label">Genre</label>
          <select id="genre" value={genre} onChange={(e) => setGenre(e.target.value)} className="input">
            <option value="">All genres</option>
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Chip active={family} onClick={() => { setFamily((v) => !v); apply({ family: family ? null : "1" }); }}>
          👨‍👩‍👧 Family friendly
        </Chip>
        <Chip active={noCover} onClick={() => { setNoCover((v) => !v); apply({ noCover: noCover ? null : "1" }); }}>
          🆓 No cover
        </Chip>
        {(params.toString().replace(/view=\w+&?/, "").length > 0) && (
          <button onClick={reset} className="ml-auto text-xs text-subtle hover:text-fg">
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition",
        active ? "border-brand-400/60 bg-brand-500/20 text-fg" : "border-line bg-input text-muted hover:border-line",
      )}
    >
      {children}
    </button>
  );
}
