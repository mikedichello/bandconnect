"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
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

  function apply(overrides?: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    const set = (k: string, v: string | null) => {
      if (v == null || v === "" || v === "0") next.delete(k);
      else next.set(k, v);
    };
    set("loc", loc.trim());
    set("radius", loc.trim() ? radius : null);
    set("genre", genre);
    set("family", family ? "1" : null);
    set("noCover", noCover ? "1" : null);
    if (overrides) for (const [k, v] of Object.entries(overrides)) set(k, v);
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
          <label className="label">City or ZIP (Connecticut)</label>
          <input
            value={loc}
            onChange={(e) => setLoc(e.target.value)}
            className="input"
            placeholder="e.g. New Haven or 06511"
          />
          {loc.trim() && resolvedLabel && (
            <p className="mt-1 text-xs text-emerald-300">📍 {resolvedLabel}</p>
          )}
          {loc.trim() && !resolvedLabel && (
            <p className="mt-1 text-xs text-amber-300">Couldn&apos;t match that CT location.</p>
          )}
        </div>
        <div className="lg:w-40">
          <label className="label">Within</label>
          <select value={radius} onChange={(e) => setRadius(e.target.value)} className="input" disabled={!loc.trim()}>
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>{r} miles</option>
            ))}
          </select>
        </div>
        <div className="lg:w-44">
          <label className="label">Genre</label>
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="input">
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
          <button onClick={reset} className="ml-auto text-xs text-zinc-400 hover:text-white">
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
        active ? "border-brand-400/60 bg-brand-500/20 text-white" : "border-white/10 bg-black/20 text-zinc-300 hover:border-white/25",
      )}
    >
      {children}
    </button>
  );
}
