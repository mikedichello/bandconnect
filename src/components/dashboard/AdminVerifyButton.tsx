"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Approve/reject controls for a pending verification request (admin queue). */
export function AdminVerifyButtons({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    const res = await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId, action }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="flex flex-shrink-0 gap-2">
      <button onClick={() => act("approve")} disabled={busy} className="btn-primary px-3 py-1.5 text-xs">Approve</button>
      <button onClick={() => act("reject")} disabled={busy} className="btn-ghost px-3 py-1.5 text-xs">Reject</button>
    </div>
  );
}
