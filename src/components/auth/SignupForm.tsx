"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";
import { PROFILE_TYPES, type ProfileType } from "@/lib/constants";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const roleParam = params.get("role")?.toUpperCase();
  const initialRole = (PROFILE_TYPES.find((t) => t.id === roleParam)?.id ?? "FAN") as ProfileType;

  const [role, setRole] = useState<ProfileType>(initialRole);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const meta = PROFILE_TYPES.find((t) => t.id === role)!;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password, role, city, zip }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        router.push("/login");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold">Join BandConnect</h1>
        <p className="mt-2 text-sm text-subtle">Choose how you want to show up in the Connecticut scene.</p>
      </div>

      {/* Role picker */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PROFILE_TYPES.map((t) => (
          <button
            type="button"
            key={t.id}
            onClick={() => setRole(t.id)}
            aria-pressed={role === t.id}
            className={cn(
              "rounded-2xl border p-3 text-center transition",
              role === t.id ? "border-brand-400/60 bg-brand-500/15 shadow-glow" : "border-line bg-input hover:border-line",
            )}
          >
            <div className="text-2xl" aria-hidden="true">{t.emoji}</div>
            <div className="mt-1 text-sm font-semibold text-fg">{t.label}</div>
          </button>
        ))}
      </div>
      <p className="mb-5 rounded-xl border border-line bg-input px-4 py-2.5 text-center text-sm text-muted">
        {meta.blurb}
      </p>

      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label htmlFor="su-name" className="label">{role === "FAN" ? "Your name" : role === "VENUE" ? "Venue name" : "Name"}</label>
          <input id="su-name" autoComplete={role === "FAN" ? "name" : "organization"} className="input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder={role === "VENUE" ? "The Space Ballroom" : role === "BAND" ? "The Night Owls" : "Your name"} />
        </div>
        <div>
          <label htmlFor="su-email" className="label">Email</label>
          <input id="su-email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="su-city" className="label">CT town <span className="text-subtle">(optional)</span></label>
            <input id="su-city" autoComplete="address-level2" className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="New Haven" />
          </div>
          <div>
            <label htmlFor="su-zip" className="label">ZIP <span className="text-subtle">(optional)</span></label>
            <input id="su-zip" autoComplete="postal-code" className="input" value={zip} onChange={(e) => setZip(e.target.value)} placeholder="06511" />
          </div>
        </div>
        <div>
          <label htmlFor="su-password" className="label">Password</label>
          <input id="su-password" type="password" autoComplete="new-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="At least 8 characters" />
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : `Create ${meta.label.toLowerCase()} account`}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-subtle">
        Already have an account?{" "}
        <Link href="/login" className="font-medium link">Log in</Link>
      </p>
    </div>
  );
}
