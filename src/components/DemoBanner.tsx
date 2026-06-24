"use client";

import { signIn } from "next-auth/react";

// Shown only on demo deploys (NEXT_PUBLIC_DEMO=1). One-click sample logins make
// the seeded demo easy to explore as each profile type.
const ACCOUNTS = [
  { label: "Fan", email: "fan@demo.com" },
  { label: "Venue", email: "venue@demo.com" },
  { label: "Musician", email: "musician@demo.com" },
  { label: "Band", email: "band@demo.com" },
];

export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO !== "1") return null;
  return (
    <div className="bg-brand-600 text-white">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-1.5 text-center text-xs sm:text-sm">
        <span className="font-semibold">🎭 Demo site — seeded with Connecticut sample data.</span>
        <span className="flex flex-wrap items-center justify-center gap-1.5">
          Explore as:
          {ACCOUNTS.map((a) => (
            <button
              key={a.email}
              onClick={() => signIn("credentials", { email: a.email, password: "password123", callbackUrl: "/dashboard" })}
              className="rounded-full bg-white/20 px-2.5 py-0.5 font-medium transition hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              {a.label}
            </button>
          ))}
        </span>
      </div>
    </div>
  );
}
