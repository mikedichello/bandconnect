// Subscription plan definitions. Drives both billing and feature-gating.

export type PlanId = "FREE" | "PRO";

export interface PlanLimits {
  maxEvents: number; // upcoming shows a user can publish
  maxSubmissionsPerMonth: number; // booking submissions a band can send
  customTheme: boolean; // custom profile colors / branding
  featuredPlacement: boolean; // boosted in discovery
  analytics: boolean;
  removeBranding: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  priceMonthly: number; // USD
  priceYearly: number; // USD (per year)
  tagline: string;
  features: string[];
  limits: PlanLimits;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  FREE: {
    id: "FREE",
    name: "Starter",
    priceMonthly: 0,
    priceYearly: 0,
    tagline: "Everything you need to get discovered.",
    features: [
      "Public single-page profile",
      "Listed in band & venue discovery",
      "Up to 3 upcoming shows on your calendar",
      "Send up to 5 booking submissions / month",
      "Direct messaging with bands & venues",
    ],
    limits: {
      maxEvents: 3,
      maxSubmissionsPerMonth: 5,
      customTheme: false,
      featuredPlacement: false,
      analytics: false,
      removeBranding: false,
    },
  },
  PRO: {
    id: "PRO",
    name: "Pro",
    priceMonthly: 12,
    priceYearly: 120,
    tagline: "Stand out, book more, grow faster.",
    features: [
      "Everything in Starter",
      "Unlimited upcoming shows",
      "Unlimited booking submissions",
      "Custom profile theme color & branding",
      "Featured placement in discovery",
      "Profile analytics",
      "Remove BandConnect branding",
    ],
    limits: {
      maxEvents: Infinity,
      maxSubmissionsPerMonth: Infinity,
      customTheme: true,
      featuredPlacement: true,
      analytics: true,
      removeBranding: true,
    },
  },
};

export function planFor(planId: string | null | undefined): PlanDefinition {
  return planId === "PRO" ? PLANS.PRO : PLANS.FREE;
}

export function isPro(planId: string | null | undefined): boolean {
  return planId === "PRO";
}

// Billing is "enabled" only when Stripe keys are configured. When disabled the
// app still works end-to-end; upgrade flows explain that billing isn't set up.
export function isBillingEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
