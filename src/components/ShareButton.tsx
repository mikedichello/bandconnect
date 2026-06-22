"use client";

import { useState } from "react";

/** Copies the current page URL to the clipboard (with a graceful fallback). */
export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button onClick={share} className="btn-ghost w-full text-sm">
      {copied ? "✓ Link copied" : "🔗 Share"}
    </button>
  );
}
