# CLAUDE.md

Working notes for BandConnect. Keep this compact — it's loaded into every session.

## What this is
**BandConnect** — a calendar-first social platform for **Connecticut's live-music
scene**. The home page is a statewide event calendar; four profile types (Fan,
Venue, Musician, Band) share one graph (follow / friend / RSVP / message). Free +
Pro (Stripe) tiers.

## Stack
Next.js 15 (App Router, async params/searchParams) · React 19 · TypeScript ·
Prisma (SQLite dev / Postgres prod) · NextAuth v4 (credentials + JWT + bcrypt;
uuid pinned ^11 via overrides) · Stripe · Resend · Tailwind 3 · lucide-react · Zod.
`npm audit` must stay at 0 vulnerabilities (postcss/uuid pinned in `overrides`).

## Commands
```bash
npm run dev            # local dev (http://localhost:3000)
npm run build          # prisma generate && next build
npm run lint           # next lint
npx tsc --noEmit       # typecheck
npm run db:push        # sync schema → DB
npm run db:seed        # load CT demo data (tsx prisma/seed.ts)
npm run db:reset       # wipe + reseed (dev only)
```
Always run `build` + `tsc --noEmit` + `lint` before committing code changes.
Demo logins: `fan@/venue@/musician@/band@demo.com`, password `password123`.

## Architecture
- **Server components** read via Prisma; **client islands** (`"use client"`) do
  interactive bits; JSON route handlers in `src/app/api/*` own all mutations.
- **`prisma/schema.prisma`** — unified `Profile` model, `type`-discriminated
  (FAN/VENUE/MUSICIAN/BAND). One `User` ↔ one `Profile`.
- **`src/lib/`** — `prisma`, `auth` (NextAuth), `session` (getCurrentProfile etc.),
  `stripe`, `email`, `plans` (billing source of truth), `ct-geo` (CT town/ZIP →
  coords + haversine, no external geocoder), `constants`, `validations`, `utils`.

## Conventions & gotchas (read before editing)
- **DB portability:** enum-like fields are `String` (not enums); booleans are
  `Boolean` (never `Bool`). SQLite dev ↔ Postgres prod via one `provider` change.
- **Server→Client boundary:** you CANNOT pass functions (e.g. Lucide icon
  components) from a Server Component to a Client Component. Pass a **string key**
  and map it to the component inside the client (see `dashboard/Sidebar.tsx`).
- **Theme = semantic CSS-var tokens** in `globals.css`: `app/surface/elevated/
  line/field/fg/muted/subtle`, consumed as `rgb(var(--c-x) / <alpha>)` via
  `tailwind.config.ts`. `darkMode: "class"`; **dark is default**, `.light` is the
  alt palette; no-flash script in `layout.tsx`.
- **No emoji in UI.** lucide-react is the only icon system (decorative icons get
  `aria-hidden`); this lucide version has no brand marks (no Instagram/Youtube
  icons — use Camera/Play/Music2/Disc3/Globe with text labels).
- **Color contrast (WCAG 2.1 AA, both themes) — IMPORTANT:** never use bare
  `text-{brand,emerald,amber,red}-300/200` for text (fails on white in light
  mode). Use the **`.link`** class for links, and **`text-X-700 dark:text-X-300`**
  for status/decorative color. Form-control borders use `border-field`
  (`--c-field`) for 3:1 non-text contrast. See `docs/ADA_AUDIT.md`.
- **Forms:** every input needs an associated label (`htmlFor`/`id`, or wrap the
  control in `<label>`); errors get `role="alert"`, success/async status gets
  `role="status"`; identity fields get `autocomplete`.
- **Graceful degradation:** no Stripe keys → demo billing mode; no
  `RESEND_API_KEY` → email log mode; no `CRON_SECRET` → open reminders endpoint.
  Don't break these fallbacks.
- **Billing:** `src/lib/plans.ts` is the single source of truth for pricing +
  gating. Pro = `$12/mo` or `$120/yr` (2 months free); `interval` flows through
  `/api/stripe/checkout` → `getPriceId` → `STRIPE_PRICE_ID_PRO_{MONTHLY,YEARLY}`.
- **Validation fail-fast ordering** in API routes is intentional (Zod →
  existence → ownership → conflict). Don't reorder to "fix" a test.

## Docs map (`docs/`)
`PLAN.md` (product/architecture) · `ROADMAP.md` (phases) · `DEPLOYMENT.md` ·
`ENVIRONMENTS.md` (branch → Vercel preview [dev] → PR → `main` [prod];
`DB_PUSH_ON_BUILD` schema sync) ·
`UX_AUDIT.md` · `ADA_AUDIT.md` (WCAG 2.1 AA) · `MONETIZATION.md` (pricing/levers,
benchmarked) · `WIREFRAMES.md` ·
`GTM.md` + `launch/` (go-to-market: target lists, outreach templates, tracker,
**`trust-and-verification.md`**).

## Status & next
- **Shipped:** Roadmap Phase 1 + 2; light/dark theme; WCAG 2.1 AA pass; go-to-market
  launch plan + research kit; annual Pro rate on the billing page; **profile
  verification** (`Profile.verified` + status/method, `POST /api/profile/verify`
  with email-domain auto-verify, admin queue at `/dashboard/admin` gated by
  `ADMIN_EMAILS`, `VerifiedBadge` on profile/card/event host); **paid event
  boosts** (`Event.featured`/`featuredUntil`, `POST /api/events/[id]/boost`
  one-time Stripe Checkout + webhook activation, ★ Featured pinned in the
  calendar; tune `EVENT_BOOST` in `plans.ts`; benchmarked in `docs/MONETIZATION.md`);
  **booking-search hard-gate** (booking-intent artist searches return verified
  only); **Spotify embeds** on artist profiles (`spotifyEmbedUrl` in utils);
  **weekly digest email** (`/api/cron/digest`, Thu 15:00 UTC, idempotent via
  `User.digestSentAt`); **design refresh** (all emoji → lucide); **Next 15 +
  React 19** (0 npm audit vulns); **Pro analytics** (`PageView` model,
  `lib/track.ts` `after()` tracking, `/dashboard/analytics` gated by
  `plans.limits.analytics`); engineering README.
- **Next (incremental):** Pro branding removal + custom profile URL/slug
  (`limits.removeBranding` exists, unimplemented); claim an *ownerless* seeded
  page (needs `Profile.userId` optional + handshake); social link-back + SMS
  OTP; embed fallbacks; rate limiting. Full list: README `TODO`. Spec:
  `docs/launch/trust-and-verification.md`.

## Workflow
- Develop on branch **`claude/tender-wright-04kyoq`**; create it if missing.
- **Commit/push only when work is complete & verified.** Push with
  `git push -u origin <branch>` (retry 4× w/ backoff on network errors).
- **Do NOT open a PR unless explicitly asked.** Repo scope: `mikedichello/bandconnect`.
- End commit messages with the required `Co-Authored-By` + `Claude-Session` trailers.
- Never put the model identifier in commits, code, or any pushed artifact.
- Use the session scratchpad for temp files. Screenshot tooling (`puppeteer-core` +
  `@sparticuz/chromium`, used because CDNs are egress-blocked) is installed **only
  when needed and uninstalled after** — keep it out of `package.json`.
