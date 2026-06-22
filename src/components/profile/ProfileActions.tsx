"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Props {
  targetUserId: string;
  isOwner: boolean;
  loggedIn: boolean;
  viewerRole: "BAND" | "VENUE" | null;
  loginHref: string;
  // Present only on venue pages — enables the "Submit to play" flow.
  venue?: { id: string; name: string; accepting: boolean } | null;
  accent?: string;
}

export function ProfileActions({
  targetUserId,
  isOwner,
  loggedIn,
  viewerRole,
  loginHref,
  venue,
  accent,
}: Props) {
  const [showSubmit, setShowSubmit] = useState(false);
  const style = accent ? { backgroundColor: accent } : undefined;

  if (isOwner) {
    return (
      <Link href="/dashboard/profile" className="btn-ghost">
        Edit your page
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {loggedIn ? (
        <Link href={`/dashboard/messages?to=${targetUserId}`} className="btn-primary" style={style}>
          ✉️ Message
        </Link>
      ) : (
        <Link href={loginHref} className="btn-primary" style={style}>
          ✉️ Message
        </Link>
      )}

      {venue && (
        <>
          {!loggedIn ? (
            <Link href={loginHref} className="btn-ghost">
              🎤 Submit to play
            </Link>
          ) : viewerRole === "BAND" ? (
            venue.accepting ? (
              <button onClick={() => setShowSubmit(true)} className="btn-ghost">
                🎤 Submit to play
              </button>
            ) : (
              <span className="badge">Not accepting submissions</span>
            )
          ) : null}
        </>
      )}

      {showSubmit && venue && (
        <SubmitDialog venue={venue} onClose={() => setShowSubmit(false)} />
      )}
    </div>
  );
}

function SubmitDialog({
  venue,
  onClose,
}: {
  venue: { id: string; name: string };
  onClose: () => void;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [proposedDate, setProposedDate] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venueProfileId: venue.id, subject, message, proposedDate }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("error");
      setError(data.error ?? "Could not send submission.");
      return;
    }
    setStatus("done");
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        {status === "done" ? (
          <div className="text-center">
            <div className="text-3xl">✅</div>
            <h3 className="mt-3 text-lg font-semibold">Submission sent!</h3>
            <p className="mt-1 text-sm text-zinc-400">
              {venue.name} will see your request in their booking inbox.
            </p>
            <button onClick={onClose} className="btn-primary mt-5">Done</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Submit to {venue.name}</h3>
              <p className="text-sm text-zinc-400">Pitch your band and propose a date.</p>
            </div>
            <div>
              <label className="label">Subject *</label>
              <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Indie trio available this fall" required />
            </div>
            <div>
              <label className="label">Message *</label>
              <textarea className="input min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell them about your band, draw, and links…" required />
            </div>
            <div>
              <label className="label">Proposed date <span className="text-zinc-500">(optional)</span></label>
              <input type="date" className="input" value={proposedDate} onChange={(e) => setProposedDate(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
              <button type="submit" disabled={status === "sending"} className="btn-primary">
                {status === "sending" ? "Sending…" : "Send submission"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
