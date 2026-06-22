"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmissionActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);

  async function update(next: "ACCEPTED" | "DECLINED") {
    setLoading(true);
    const res = await fetch(`/api/submissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.ok) {
      setCurrent(next);
      router.refresh();
    }
    setLoading(false);
  }

  if (current === "ACCEPTED") {
    return <span className="badge-green">✓ Accepted</span>;
  }
  if (current === "DECLINED") {
    return <span className="badge">Declined</span>;
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => update("ACCEPTED")} disabled={loading} className="btn-primary px-4 py-1.5 text-xs">
        Accept
      </button>
      <button onClick={() => update("DECLINED")} disabled={loading} className="btn-ghost px-4 py-1.5 text-xs">
        Decline
      </button>
    </div>
  );
}
