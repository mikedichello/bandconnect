"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => {});
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Reset your password</h1>
        <p className="mt-2 text-sm text-subtle">We&apos;ll email you a link to set a new one.</p>
      </div>

      {sent ? (
        <div role="status" className="card p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-elevated">
            <Mail className="h-6 w-6 text-subtle" aria-hidden="true" />
          </div>
          <p className="mt-3 text-fg">
            If an account exists for <strong>{email}</strong>, a reset link is on its way.
          </p>
          <p className="mt-2 text-sm text-subtle">Check your inbox (and spam). The link expires in 1 hour.</p>
          <Link href="/login" className="btn-primary mt-5">Back to log in</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <div>
            <label htmlFor="fp-email" className="label">Email</label>
            <input id="fp-email" type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-subtle">
        Remembered it?{" "}
        <Link href="/login" className="font-medium link">Log in</Link>
      </p>
    </div>
  );
}
