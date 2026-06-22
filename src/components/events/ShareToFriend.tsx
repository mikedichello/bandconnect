"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { initials } from "@/lib/utils";

export interface FriendOption {
  id: string;
  displayName: string;
}

/** Share an event with a friend via DM + notification. Fan-to-fan only. */
export function ShareToFriend({ eventId, friends }: { eventId: string; friends: FriendOption[] }) {
  const [open, setOpen] = useState(false);
  const [toId, setToId] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (friends.length === 0) return null;

  async function send() {
    if (!toId) return;
    setState("sending");
    setError(null);
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, toProfileId: toId, note }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setState("error");
      setError(data.error ?? "Could not send");
      return;
    }
    setState("sent");
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-ghost w-full text-sm">
        <Send className="h-4 w-4" aria-hidden="true" /> Send to a friend
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-elevated p-3">
      {state === "sent" ? (
        <p className="text-sm text-emerald-400">✓ Shared! Your friend got a message.</p>
      ) : (
        <>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">Send to a friend</p>
          <div className="max-h-40 space-y-1 overflow-y-auto thin-scroll">
            {friends.map((f) => (
              <button
                key={f.id}
                onClick={() => setToId(f.id)}
                className={
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm " +
                  (toId === f.id ? "bg-brand-500/15 text-fg" : "text-muted hover:bg-app")
                }
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-500/20 text-[10px] font-bold text-brand-200">
                  {initials(f.displayName)}
                </span>
                {f.displayName}
              </button>
            ))}
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            maxLength={300}
            className="input mt-2 text-sm"
          />
          {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
          <div className="mt-2 flex justify-end gap-2">
            <button onClick={() => setOpen(false)} className="btn-ghost px-3 py-1.5 text-xs">Cancel</button>
            <button onClick={send} disabled={!toId || state === "sending"} className="btn-primary px-3 py-1.5 text-xs">
              {state === "sending" ? "Sending…" : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
