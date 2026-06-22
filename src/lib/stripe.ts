import Stripe from "stripe";

// A single Stripe client. When STRIPE_SECRET_KEY is unset (the default in dev),
// `stripe` is null and the app runs in "billing disabled" mode.
// apiVersion is intentionally omitted so the SDK uses its own pinned version,
// keeping us off a hard-coded string that drifts between Stripe releases.
export const stripe: Stripe | null = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { typescript: true })
  : null;

export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || "",
  yearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY || "",
};

export function getPriceId(interval: "monthly" | "yearly"): string {
  return interval === "yearly" ? STRIPE_PRICE_IDS.yearly : STRIPE_PRICE_IDS.monthly;
}
