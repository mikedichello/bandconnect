"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

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
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" /> Link copied
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" aria-hidden="true" /> Share
        </>
      )}
    </button>
  );
}
