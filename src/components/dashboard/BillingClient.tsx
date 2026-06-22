"use client";

import { useState } from "react";

export function UpgradeButton({
  interval = "monthly",
  label = "Upgrade to Pro",
  className = "btn-primary",
}: {
  interval?: "monthly" | "yearly";
  label?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interval }),
    });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    setError(data.error ?? "Could not start checkout.");
    setLoading(false);
  }

  return (
    <div>
      <button onClick={go} disabled={loading} className={className}>
        {loading ? "Redirecting…" : label}
      </button>
      {error && <p className="mt-2 text-sm text-amber-300">{error}</p>}
    </div>
  );
}

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (res.ok && data.url) {
      window.location.href = data.url;
      return;
    }
    setError(data.error ?? "Could not open billing portal.");
    setLoading(false);
  }

  return (
    <div>
      <button onClick={go} disabled={loading} className="btn-ghost">
        {loading ? "Opening…" : "Manage billing"}
      </button>
      {error && <p className="mt-2 text-sm text-amber-300">{error}</p>}
    </div>
  );
}
