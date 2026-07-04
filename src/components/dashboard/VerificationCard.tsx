"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Check } from "lucide-react";

/**
 * Self-service verification request for the signed-in venue/band/musician.
 * Submitting from an email at the profile's website domain auto-verifies;
 * otherwise it queues for admin review. Not rendered for fans.
 */
export function VerificationCard({ status, verified }: { status: string; verified: boolean }) {
  const router = useRouter();
  const [info, setInfo] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "error">("idle");
  const [result, setResult] = useState<{ verified: boolean; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isVerified = result?.verified ?? verified;
  const effectiveStatus = result?.status ?? status;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("saving");
    setError(null);
    const res = await fetch("/api/profile/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ info, websiteUrl: website }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState("error");
      setError(data.error ?? "Could not submit");
      return;
    }
    setResult({ verified: data.verified, status: data.status });
    setState("idle");
    router.refresh();
  }

  return (
    <section className="card p-6">
      <div className="flex items-center gap-2">
        <BadgeCheck className="h-5 w-5 text-sky-700 dark:text-sky-300" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Verification</h2>
      </div>

      {isVerified ? (
        <p role="status" className="mt-2 flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-300">
          <Check className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          Your page is verified — the badge now shows on your profile, cards, and events.
        </p>
      ) : effectiveStatus === "pending" ? (
        <p role="status" className="mt-2 text-sm text-amber-700 dark:text-amber-300">
          Verification pending review. We&apos;ll confirm you control this page and add the badge.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-subtle">
            Get a Verified badge so fans and bookers know it&apos;s really you. Tip: request from an
            email at your official website domain and you&apos;re verified instantly.
          </p>
          <form onSubmit={submit} className="mt-4 space-y-3">
            <div>
              <label htmlFor="vf-site" className="label">Official website</label>
              <input id="vf-site" className="input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourvenue.com" />
            </div>
            <div>
              <label htmlFor="vf-info" className="label">How can we verify you? <span className="text-subtle">(socials, booking email — anything public)</span></label>
              <textarea id="vf-info" className="input min-h-[80px]" value={info} onChange={(e) => setInfo(e.target.value)} placeholder="@ourinstagram · booking@yourvenue.com · link to your official site" />
            </div>
            {error && <p role="alert" className="text-sm text-red-700 dark:text-red-300">{error}</p>}
            <button type="submit" disabled={state === "saving"} className="btn-primary">
              {state === "saving" ? "Submitting…" : "Request verification"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
