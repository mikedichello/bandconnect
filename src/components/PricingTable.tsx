"use client";

import { useState } from "react";
import Link from "next/link";
import { PLANS } from "@/lib/plans";
import { UpgradeButton } from "@/components/dashboard/BillingClient";

export function PricingTable({
  loggedIn,
  isPro,
  billingEnabled,
}: {
  loggedIn: boolean;
  isPro: boolean;
  billingEnabled: boolean;
}) {
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const pro = PLANS.PRO;
  const proPrice = interval === "monthly" ? pro.priceMonthly : Math.round(pro.priceYearly / 12);
  const yearlySavings = pro.priceMonthly * 12 - pro.priceYearly;

  return (
    <div>
      {/* Interval toggle */}
      <div className="mx-auto mb-10 flex w-fit items-center gap-1 rounded-full border border-line bg-input p-1">
        <ToggleBtn active={interval === "monthly"} onClick={() => setInterval("monthly")}>
          Monthly
        </ToggleBtn>
        <ToggleBtn active={interval === "yearly"} onClick={() => setInterval("yearly")}>
          Yearly <span className="ml-1 text-xs text-emerald-300">save ${yearlySavings}</span>
        </ToggleBtn>
      </div>

      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="card flex flex-col p-8">
          <h3 className="text-xl font-bold">{PLANS.FREE.name}</h3>
          <p className="mt-1 text-sm text-subtle">{PLANS.FREE.tagline}</p>
          <div className="mt-5 font-display text-4xl font-bold text-fg">
            $0<span className="text-base font-normal text-subtle">/mo</span>
          </div>
          <ul className="mt-6 flex-1 space-y-3 text-sm text-muted">
            {PLANS.FREE.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 text-brand-400">✓</span> {f}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {loggedIn ? (
              <Link href="/dashboard" className="btn-ghost w-full">Go to dashboard</Link>
            ) : (
              <Link href="/signup" className="btn-ghost w-full">Get started free</Link>
            )}
          </div>
        </div>

        {/* Pro */}
        <div className="relative card flex flex-col overflow-hidden border-brand-400/40 p-8">
          <div className="aurora absolute inset-0 -z-10 opacity-60" />
          <span className="badge-brand w-fit">Most popular</span>
          <h3 className="mt-3 text-xl font-bold">{pro.name}</h3>
          <p className="mt-1 text-sm text-subtle">{pro.tagline}</p>
          <div className="mt-5 font-display text-4xl font-bold text-fg">
            ${proPrice}
            <span className="text-base font-normal text-subtle">/mo</span>
          </div>
          {interval === "yearly" && (
            <p className="mt-1 text-xs text-emerald-300">Billed ${pro.priceYearly}/year</p>
          )}
          <ul className="mt-6 flex-1 space-y-3 text-sm text-fg">
            {pro.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 text-brand-400">✓</span> {f}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            {isPro ? (
              <Link href="/dashboard/billing" className="btn-ghost w-full">Manage your plan</Link>
            ) : loggedIn ? (
              billingEnabled ? (
                <UpgradeButton interval={interval} className="btn-primary w-full" label={`Upgrade to Pro`} />
              ) : (
                <div>
                  <button disabled className="btn-primary w-full opacity-60">Upgrade to Pro</button>
                  <p className="mt-2 text-center text-xs text-amber-300">
                    Billing is in demo mode on this deployment.
                  </p>
                </div>
              )
            ) : (
              <Link href="/signup" className="btn-primary w-full">Start with Pro</Link>
            )}
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-subtle">
        Prices in USD. Cancel anytime. {billingEnabled ? "Secure payments by Stripe." : ""}
      </p>
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "rounded-full px-5 py-2 text-sm font-medium transition " +
        (active ? "bg-brand-500 text-white" : "text-muted hover:text-fg")
      }
    >
      {children}
    </button>
  );
}
