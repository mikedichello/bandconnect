# Stack Review — Council Decision Record

**Date:** 2026-07-04 · **Status:** Decided · **Ruling: keep the current stack — no rewrite.** (Unanimous, 4–0.)

## Question

Is Next.js 14 / TypeScript / Prisma / NextAuth / Stripe / Tailwind / Zod the right
stack for BandConnect, or should the project be rebuilt from scratch?

## Facts before the council

- ~7,600 lines of TypeScript across 101 files; 307-line Prisma schema.
- Roadmap Phases 1 + 2 shipped, plus revenue features in production shape:
  Stripe Pro subscriptions, profile verification + admin queue, paid event boosts.
- CI workflow and Vercel/Supabase deployment wiring in place; SQLite-dev →
  Postgres-prod provider switch is automated (`scripts/set-db-provider.mjs`).
- Graceful-degradation fallbacks (demo billing, email log mode, open reminders
  endpoint) let the app run with zero external keys.

## Deliberation

### Product/architecture fit
BandConnect is a server-rendered, read-heavy CRUD app: a public statewide event
calendar, a four-type profile graph, and payments. The App Router
server-component model matches this exactly — Prisma reads in server
components, small client islands for interactivity, JSON route handlers owning
mutations. Rails, Laravel, Remix, or SvelteKit would be lateral moves with full
migration cost and no step-change benefit. SEO-critical public pages (events,
profiles) get server rendering for free.

### Delivery risk
Nothing on the roadmap — hard-gating unverified profiles, ownerless page
claims, social link-back, SMS OTP — is blocked by the stack. A rewrite would
spend weeks re-reaching feature parity (auth, billing, webhooks, verification,
theming, WCAG pass) while shipping zero user value, with high odds of
regressing subtle shipped behavior (Stripe webhook activation, email-domain
auto-verify, CT geo search). Rewrites are warranted when the stack blocks the
roadmap; this one does not.

### Operations & cost
Vercel + Supabase Postgres runs at near-zero fixed cost and scales past any
plausible Connecticut-launch traffic. The dual SQLite/Postgres setup is a mild
wart, deliberately mitigated by conventions (string enums, `Boolean` fields)
and automated by the provider-switch script.

### The case for rebuilding (steelmanned, and why it fails)
The real critique is **version drift, not architecture**: Next 14 / React 18,
NextAuth v4, Prisma 5, Tailwind 3, Zod 3 are each one major behind current.
Credentials-only JWT auth is aging, and there is no automated test suite to
protect upgrades. Every item is addressable incrementally in-place; none
requires discarding working, revenue-generating code. The critique therefore
argues for an upgrade lane, not a rewrite.

## Ruling

**Keep the stack. Do not rebuild.** Continue feature work on the existing
codebase.

## Recommended upgrade lane (incremental, each step independently shippable)

1. **Test harness first** — a minimal Vitest + Playwright smoke suite around
   auth, calendar, and billing, so the upgrades below are safe to land.
2. **Next 15 + React 19** (codemod-assisted), then **Prisma 6**, then
   **Auth.js v5** (NextAuth successor), then **Tailwind 4** and **Zod 4** —
   in that order, one PR each, verified against the smoke suite.
3. Only after the lane is clear: consider OAuth providers alongside
   credentials auth.

None of this blocks roadmap work; upgrades can interleave with feature PRs.
