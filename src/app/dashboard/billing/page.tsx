import Link from "next/link";
import { requireUser } from "@/lib/session";
import { PLANS, isPro, isBillingEnabled } from "@/lib/plans";
import { formatDate } from "@/lib/utils";
import { UpgradeButton, ManageBillingButton } from "@/components/dashboard/BillingClient";

export const metadata = { title: "Billing" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const user = await requireUser();
  const pro = isPro(user.plan);
  const billingEnabled = isBillingEnabled();
  const plan = pro ? PLANS.PRO : PLANS.FREE;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Billing</h1>
        <p className="text-sm text-zinc-400">Manage your BandConnect subscription.</p>
      </div>

      {searchParams.status === "success" && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          🎉 You&apos;re on Pro! It may take a few seconds to reflect everywhere — refresh if needed.
        </div>
      )}

      {!billingEnabled && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          <strong>Billing is in demo mode.</strong> Stripe keys aren&apos;t configured on
          this deployment, so subscriptions are disabled. See the README to wire
          up Stripe and enable live payments.
        </div>
      )}

      {/* Current plan */}
      <section className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-zinc-400">Current plan</p>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              {pro ? <span className="badge-brand">★ Pro</span> : <span className="badge">Free</span>}
            </div>
            <p className="mt-1 text-sm text-zinc-400">{plan.tagline}</p>
            {pro && user.planRenewsAt && (
              <p className="mt-2 text-xs text-zinc-500">
                {user.planStatus === "canceled"
                  ? `Access ends ${formatDate(user.planRenewsAt)}`
                  : `Renews ${formatDate(user.planRenewsAt)}`}
              </p>
            )}
          </div>
          <div>
            {pro ? (
              <ManageBillingButton />
            ) : (
              <UpgradeButton label={`Upgrade — $${PLANS.PRO.priceMonthly}/mo`} />
            )}
          </div>
        </div>
      </section>

      {/* Plan comparison */}
      <section className="grid gap-4 md:grid-cols-2">
        {(["FREE", "PRO"] as const).map((id) => {
          const p = PLANS[id];
          const isCurrent = (id === "PRO") === pro;
          return (
            <div
              key={id}
              className={
                "card p-6 " + (id === "PRO" ? "border-brand-400/30" : "")
              }
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                {isCurrent && <span className="badge-green">Current</span>}
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-white">
                ${p.priceMonthly}
                <span className="text-sm font-normal text-zinc-500">/mo</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-brand-400">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {id === "PRO" && !pro && (
                <div className="mt-5">
                  <UpgradeButton className="btn-primary w-full" />
                </div>
              )}
            </div>
          );
        })}
      </section>

      <p className="text-center text-xs text-zinc-500">
        Questions about billing? See <Link href="/pricing" className="text-brand-300 hover:text-brand-200">pricing</Link>.
      </p>
    </div>
  );
}
