"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function FollowButton({
  targetProfileId,
  initialFollowing,
  loggedIn,
  loginHref,
  size = "md",
}: {
  targetProfileId: string;
  initialFollowing: boolean;
  loggedIn: boolean;
  loginHref: string;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const cls =
    size === "sm"
      ? "px-3 py-1 text-xs"
      : "px-4 py-2 text-sm";

  if (!loggedIn) {
    return (
      <Link href={loginHref} className={`btn-ghost ${cls}`}>
        Follow
      </Link>
    );
  }

  async function toggle() {
    setLoading(true);
    const res = await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetProfileId }),
    });
    const data = await res.json();
    if (res.ok) {
      setFollowing(data.following);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`${following ? "btn-ghost" : "btn-primary"} ${cls}`}
    >
      {following ? "Following ✓" : "Follow"}
    </button>
  );
}
