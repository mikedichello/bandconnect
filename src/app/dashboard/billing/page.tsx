import Link from "next/link";
import { Star, Check } from "lucide-react";
import { requireUser } from "@/lib/session";
import { PLANS, isPro, isBillingEnabled } from "@/lib/plans";
import { formatDate } from "@/lib/utils";
import { UpgradeButton, ManageBillingButton } from "@/components/dashboard/BillingClient";

export const metadata = { title: "Billing" };

export default async function BillingPage(
  props: {
    searchParams: Promise<{ status?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const user = await requireUser();
  const pro = isPro(user.plan);
  const billingEnabled = isBillingEnabled();
  const plan = pro ? PLANS.PRO : PLANS.FREE;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Billing</h1>
        <p className="text-sm text-subtle">Manage your BandConnect subscription.</p>
      </div>

      {searchParams.status === "success" && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
          You&apos;re on Pro! It may take a few seconds to reflect everywhere — refresh if needed.
        </div>
      )}

      {!billingEnabled && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-200">
          <strong>Billing is in demo mode.</strong> Stripe keys aren&apos;t configured on
          this deployment, so subscriptions are disabled. See the README to wire
          up Stripe and enable live payments.
        </div>
      )}

      {/* Current plan */}
      <section className="card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-subtle">Current plan</p>
            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-2xl font-bold">{plan.name}</h2>
              {pro ? (
                <span className="badge-brand"><Star className="h-3 w-3 fill-current" aria-hidden="true" />Pro</span>
              ) : (
                <span className="badge">Free</span>
              )}
            </div>
            <p className="mt-1 text-sm text-subtle">{plan.tagline}</p>
            {pro && user.planRenewsAt && (
              <p className="mt-2 text-xs text-subtle">
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
              <div className="mt-2 font-display text-3xl font-bold text-fg">
                ${p.priceMonthly}
                <span className="text-sm font-normal text-subtle">/mo</span>
              </div>
              {id === "PRO" && (
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                  or ${p.priceYearly}/yr — 2 months free
                </p>
              )}
              <ul className="mt-4 space-y-2 text-sm text-muted">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand-600 dark:text-brand-400" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              {id === "PRO" && !pro && (
                <div className="mt-5 space-y-2">
                  <UpgradeButton className="btn-primary w-full" label={`Go Pro — $${PLANS.PRO.priceMonthly}/mo`} />
                  <UpgradeButton interval="yearly" className="btn-ghost w-full" label={`Pay yearly — $${PLANS.PRO.priceYearly} (save $${PLANS.PRO.priceMonthly * 12 - PLANS.PRO.priceYearly})`} />
                </div>
              )}
            </div>
          );
        })}
      </section>

      <p className="text-center text-xs text-subtle">
        Questions about billing? See <Link href="/pricing" className="link">pricing</Link>.
      </p>
    </div>
  );
}
