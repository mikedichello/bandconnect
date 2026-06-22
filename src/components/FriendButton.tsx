"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FriendState = "none" | "pending_out" | "pending_in" | "accepted";

export function FriendButton({
  targetProfileId,
  initialState,
  loggedIn,
  loginHref,
}: {
  targetProfileId: string;
  initialState: FriendState;
  loggedIn: boolean;
  loginHref: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<FriendState>(initialState);
  const [loading, setLoading] = useState(false);

  if (!loggedIn) {
    return <Link href={loginHref} className="btn-ghost px-4 py-2 text-sm">Add friend</Link>;
  }

  async function call(action: "request" | "accept" | "remove") {
    setLoading(true);
    const res = await fetch("/api/friend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetProfileId, action }),
    });
    const data = await res.json();
    if (res.ok) {
      setState(action === "remove" ? "none" : action === "accept" ? "accepted" : "pending_out");
      router.refresh();
    }
    setLoading(false);
  }

  if (state === "accepted")
    return <button onClick={() => call("remove")} disabled={loading} className="btn-ghost px-4 py-2 text-sm">Friends ✓</button>;
  if (state === "pending_out")
    return <button onClick={() => call("remove")} disabled={loading} className="btn-ghost px-4 py-2 text-sm">Request sent</button>;
  if (state === "pending_in")
    return <button onClick={() => call("accept")} disabled={loading} className="btn-primary px-4 py-2 text-sm">Accept request</button>;
  return <button onClick={() => call("request")} disabled={loading} className="btn-primary px-4 py-2 text-sm">Add friend</button>;
}
