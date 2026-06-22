"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

type Role = "BAND" | "VENUE";

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialRole = (params.get("role") === "VENUE" ? "VENUE" : "BAND") as Role;

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, city }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }

      // Auto sign-in after registration.
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (signInRes?.error) {
        // Account created but auto-login failed — send them to login.
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
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Join BandConnect free — no credit card required.
        </p>
      </div>

      {/* Role toggle */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <RoleButton active={role === "BAND"} onClick={() => setRole("BAND")} emoji="🎸" label="I'm a band" sub="Find venues to play" />
        <RoleButton active={role === "VENUE"} onClick={() => setRole("VENUE")} emoji="🏛️" label="I'm a venue" sub="Find bands to book" />
      </div>

      <form onSubmit={onSubmit} className="card space-y-4 p-6">
        <div>
          <label className="label" htmlFor="name">
            {role === "BAND" ? "Band name" : "Venue name"}
          </label>
          <input
            id="name"
            className="input"
            placeholder={role === "BAND" ? "The Night Owls" : "The Underground"}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label" htmlFor="city">City <span className="text-zinc-500">(optional)</span></label>
          <input id="city" className="input" placeholder="Brooklyn, NY" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="input" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-300 hover:text-brand-200">
          Log in
        </Link>
      </p>
    </div>
  );
}

function RoleButton({
  active,
  onClick,
  emoji,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border p-4 text-left transition",
        active
          ? "border-brand-400/60 bg-brand-500/15 shadow-glow"
          : "border-white/10 bg-black/20 hover:border-white/20",
      )}
    >
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 font-semibold text-white">{label}</div>
      <div className="text-xs text-zinc-400">{sub}</div>
    </button>
  );
}
