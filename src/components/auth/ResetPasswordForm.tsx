"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Could not reset password");
      setLoading(false);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1800);
  }

  if (!token) {
    return (
      <div className="card w-full max-w-md p-6 text-center">
        <p className="text-fg">This reset link is missing its token.</p>
        <Link href="/forgot-password" className="btn-primary mt-4">Request a new link</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Set a new password</h1>
        <p className="mt-2 text-sm text-subtle">Choose a strong password you don&apos;t use elsewhere.</p>
      </div>

      {done ? (
        <div className="card p-6 text-center">
          <div className="text-3xl">✅</div>
          <p className="mt-3 text-fg">Password updated! Taking you to log in…</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <div>
            <label htmlFor="rp-password" className="label">New password</label>
            <input id="rp-password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="At least 8 characters" />
          </div>
          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Saving…" : "Update password"}
          </button>
        </form>
      )}
    </div>
  );
}
