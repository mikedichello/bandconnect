# BandConnect: QA plan (Senior QA)

*Scope: PR #1 (`claude/band-connect-ux-review-0x6wu0` @ `19d4e84`), plus the target flow feature → `dev` (staging) → `main` (prod). Written 2026-09-24.*

**Current state.** The repo has **zero automated tests**. CI (`.github/workflows/ci.yml`) runs only `build`, `tsc --noEmit` and `next lint`, so nothing checks behavior today. docs/ADA_AUDIT.md sets a WCAG 2.1 AA bar in both themes, but nothing enforces it.

**How I tested.** I ran an exploratory pass against a scratch copy of the PR branch (port 3100, a copy of the seeded SQLite DB, no Stripe or Resend keys):
- an API probe script
- a Playwright smoke run of all 4 roles
- axe-core scans of 7 public pages × 2 themes, plus the host dashboards

It found **6 confirmed bugs, including 2 High** (§4). The repo was not modified.

---

## 1. Test strategy

### 1.1 Pyramid

| Layer | Tool | Target | What it covers | Runs on |
|---|---|---|---|---|
| **Unit** (~60%) | Vitest (node env), no DB | ≥ 90% lines on `src/lib/*` pure modules | `ct-geo` (haversine, `resolveCtLocation`, ZIP index, `coordsForTown`), `plans` (`planFor`, `isPro`, `isBillingEnabled`, limits, `EVENT_BOOST`), `discovery.rankProfiles` (featured-first, radius filter, distance sort, unresolved location), `validations` (every Zod schema: boundaries, `""` literals, URL/hex), `utils` (`slugify`, `parseTags`, `formatRate`, `domainFromUrl`/`domainFromEmail`, `toEmbedUrl`, `formatMiles`), `admin.isAdmin`, date-window helpers (`whenWindow`, once extracted from `page.tsx`, see QA-6) | every push |
| **API integration** (~30%) | Vitest + a real Prisma client against a throwaway SQLite file (`DATABASE_URL=file:./test-<worker>.db`, `prisma db push --force-reset` in `globalSetup`, a factory-based seed per test). Call the route handlers directly (`POST(new Request(...))`) and mock `getServerSession` (`vi.mock("next-auth")`) to switch the acting user. Stripe: `vi.mock("@/lib/stripe")` returns a fake client, and `stripe.webhooks.generateTestHeaderString` signs real webhook payloads. | Every route in `src/app/api/**`: status codes + DB side effects | Auth (401), **validation-order contract** (Zod → existence → ownership → conflict: assert the *first* failing gate wins, e.g. bad body + missing event ⇒ 400, not 404), ownership 404s, plan-limit 402, webhook state transitions, demo-billing 503s, notification fan-out | every push |
| **E2E smoke** (~8%) | Playwright (`@playwright/test`) against `next build && next start` on a seeded SQLite DB, Chromium only; `storageState` per role | 1 happy path per role + cross-role flows (§2 tagged **[E2E]**) | Real browser: login, forms, client islands, redirects, theme toggle | PR → `dev` (smoke subset), `dev` → `main` (full) |
| **Accessibility** (~2%) | `@axe-core/playwright`, tags `wcag2a, wcag2aa, wcag21a, wcag21aa`; each page scanned with `html.dark` **and** `html.light` | 0 serious/critical violations | Public pages + all 4 role dashboards + forms in error state | same jobs as E2E |
| **Postgres parity** | Nightly (and `dev` → `main`) job: the API integration suite with `DATABASE_URL=postgres://` (GH Actions `services: postgres:16`) | Same suite, different provider | Catches SQLite-vs-Postgres drift (e.g. `contains` is case-*sensitive* on Postgres, see BUG-7) | nightly + promotion |

Manual/exploratory work stays for new UX, Stripe test-mode round trips and mobile (390px) visual checks.

**Test-data rule.** Tests never touch `prisma/dev.db`. The Prisma client resolves a relative `file:./dev.db` against the schema that generated it, so always use an **absolute** `DATABASE_URL` for test DBs (I hit this during exploration).

**Fixture gap.** Every seeded host login (`venue@`, `musician@`, `band@`) is **PRO**. No demo account exercises the Free-tier gates (3-event limit, Insights teaser, theme lock). Add `free-band@demo.com` and `free-venue@demo.com` to the seed (QA-3).

### 1.2 Promotion gates

| Gate | Required checks (branch protection) |
|---|---|
| **feature → `dev`** (PR) | `build` · `tsc --noEmit` · `lint` · **unit** (all green, coverage on `src/lib` must not drop) · **API integration (SQLite)** · **E2E smoke** (login ×4 roles, RSVP, post event, billing demo page) · **axe on the changed routes, both themes, 0 serious/critical** · 1 approving review · a new or changed API route/lib function ships with tests |
| **`dev` → `main`** (release PR) | All of the above **plus** the full E2E regression (§2) · the full axe sweep · **Postgres-parity** integration run · `prisma db push --accept-data-loss=false` dry run / schema diff against prod reviewed · Stripe **test-mode** webhook round trip on staging (subscribe, cancel, boost) · manual release checklist (§5) signed off by QA · no open Sev-1/Sev-2 bugs |
| **Hotfix → `main`** | The feature → `dev` gate + targeted E2E, then back-merge `main` → `dev` the same day |

### 1.3 Definition of Done (per ticket)

1. The acceptance criteria are met, and the PO has verified them on the `dev` preview.
2. Tests at the right layer:
   - lib change → unit test
   - route change → integration test, including the 401/400/404/403/409/402 branches it touches
   - user-visible flow → an E2E case added to or updated in §2
3. CI is green: build, tsc, lint, unit, integration, E2E smoke, axe.
4. **A11y:** no new axe serious/critical issues in **both** themes. Keyboard-only walkthrough of the changed UI done. Forms follow CLAUDE.md (labels, `role="alert"`/`status`, `autocomplete`).
5. **DB portability:** no Prisma enums/`Bool`, and no case-sensitive `contains` without a Postgres-safe path. Passes the Postgres-parity job if the ticket touches queries.
6. The graceful-degradation fallbacks still work: no Stripe keys, no Resend key, no `CRON_SECRET`, no `ADMIN_EMAILS`.
7. Dates are stored in UTC, and entered and displayed in `America/New_York` (after BUG-1).
8. Docs and CLAUDE.md are updated if behavior or config changed. No secrets or model identifiers in the diff.

---

## 2. Critical-path regression suite

Legend: **[U]** unit · **[I]** API integration · **[E2E]** Playwright · **[A]** axe. P1 cases are the smoke subset for PR → `dev`.

### A. Auth & account (all roles)
| # | Case | Layer | Pri |
|---|---|---|---|
| A1 | Sign up as **Fan**: role picker, name, town "West Hartford" → 201. Lands on the dashboard with the onboarding checklist. Profile lat/lng set from `coordsForTown`. | E2E+I | P1 |
| A2 | Sign up as **Venue** / **Musician** / **Band** (parametrized): the profile `type` matches the role, the slug is unique (a second "Toad's Place" gets `toads-place-2`). | E2E+I | P1 |
| A3 | Signup validation: bad email, password < 8, name < 2, missing role → 400 with the first Zod message, rendered with `role="alert"`. Duplicate email (any case) → 409. | I+E2E | P1 |
| A4 | Login succeeds for each demo role. Wrong password → a generic error (no user enumeration). Email is case-insensitive. | E2E | P1 |
| A5 | Signed-out access to `/dashboard/*` redirects to `/login`. API mutations → 401. | E2E+I | P1 |
| A6 | Forgot password: a registered and an unknown email both → 200 `{ok:true}`. With no `RESEND_API_KEY` the reset link is logged. A second request invalidates the first token. | I | P1 |
| A7 | Reset password: valid token → 200, can log in with the new password. Reused, expired and bogus tokens → 400. Password < 8 → 400. | I+E2E | P1 |
| A8 | Logout clears the session. Theme toggle persists and causes no flash (`.dark` is the default). | E2E | P2 |

### B. Fan
| # | Case | Layer | Pri |
|---|---|---|---|
| B1 | RSVP **Going**, then **Maybe**, then **None** (clears) on `/event/[id]`. The count updates. The mobile sticky RSVP bar shows at 390px, desktop shows the sidebar control, and the two are never both visible. | E2E | P1 |
| B2 | RSVP API: missing or invalid status → 400 (before the existence check). Unknown event → 404. Host gets **one** RSVP notification per fan per event (see BUG-4). | I | P1 |
| B3 | Follow / unfollow a band (toggle). Target gets a FOLLOW notification. Self-follow → 400. Unknown target → 404. | I+E2E | P1 |
| B4 | Friend request → the addressee accepts → both show "Friends". A third party / requester can't accept (400). Remove works from either side. Duplicate request is idempotent. | I+E2E | P1 |
| B5 | Messaging: send to a venue → 201, and the recipient sees an unread badge and a MESSAGE notification. Opening the thread marks it read. Empty body / > 2000 chars → 400. Messaging yourself → 400. Unknown recipient → 404. | I+E2E | P1 |
| B6 | "Following" feed and personal calendar list the RSVP'd and followed shows. `.ics` download has the correct **local** time (BUG-1). | E2E | P2 |
| B7 | Saved-search alert (city=New Haven, genre=Jazz): a host posts a matching event → the fan gets a notification. A non-match gets none. The host is never notified of their own event. | I | P2 |
| B8 | Cron reminders: an RSVP'd show within 24h → 1 email/log and `reminderSentAt` set. A second run sends nothing. With `CRON_SECRET` set, a missing or bad bearer → 401. | I | P2 |

### C. Hosts (Venue / Musician / Band)
| # | Case | Layer | Pri |
|---|---|---|---|
| C1 | Post an event (title, start, city) → 201, lat/lng resolved, it appears on `/` and the host profile, followers get notified. A Fan posting → 403. | E2E+I | P1 |
| C2 | **Free 3-event limit**: a Free host with 3 upcoming events → the 4th returns 402 `PLAN_LIMIT` and the UI shows the upgrade CTA. Pro is unlimited. Past events don't count. **Also: a PATCH that moves a past event into the future must respect the limit** (BUG-2). | I+E2E | P1 |
| C3 | Edit or delete your own event → 200. Someone else's event → 404 (not 403, by design). Invalid body on your own event → 400. | I | P1 |
| C4 | Entered time round-trips: enter 8:00 PM in the form (ET browser) → the public page, dashboard, calendar, `.ics` and reminder email all show 8:00 PM ET (BUG-1). | E2E | P1 |
| C5 | **Boost, demo mode**: with no Stripe keys, boost → 503 `BILLING_DISABLED` and a friendly message. Past show → 400. Already featured → 409. Not your event → 404. | I+E2E | P1 |
| C6 | **Boost, Stripe test mode**: Checkout session `mode=payment`, metadata `kind=boost,eventId,days=30`. A signed `checkout.session.completed` webhook sets `featured=true`, `featuredUntil≈now+30d`, and the event shows ★ Featured pinned in the calendar. The same event id redelivered must not extend the window (idempotency, BUG-6). | I (+staging manual) | P1 |
| C7 | Availability dates + "needs musicians"/rate fields persist, and only for the right profile types. | I | P2 |
| C8 | Insights card: Free sees 30-day followers + a locked teaser. Pro sees RSVP demand, top show and top towns. | E2E | P2 |
| C9 | Media add/remove (image URL, YouTube → embed). Invalid URL → 400. | I | P3 |

### D. Billing
| # | Case | Layer | Pri |
|---|---|---|---|
| D1 | **Demo mode**: `/pricing` and `/dashboard/billing` show the "Billing is in demo mode" notice, prices read $12/mo and $120/yr from `plans.ts`, and upgrade → 503 `BILLING_DISABLED` handled gracefully. | E2E+I+A | P1 |
| D2 | Checkout: `interval=yearly` → `STRIPE_PRICE_ID_PRO_YEARLY`, default is monthly. Missing price id → 503. Stripe customer created once and reused. | I | P1 |
| D3 | Webhook security: no Stripe → 503. No secret → 503. Missing signature → 400. Bad signature → 400. No DB write in any of these. | I | P1 |
| D4 | Webhook `checkout.session.completed` (subscription) → `plan=PRO`, status, sub id, `planRenewsAt`. Session refresh (`update()`) shows Pro in the UI. The profile ranks ★ Featured in `/artists` or `/venues`. | I+E2E | P1 |
| D5 | `customer.subscription.updated`: `active`/`trialing` → PRO, `past_due`/`unpaid`/`canceled` → FREE. `customer.subscription.deleted` → FREE, sub cleared. Unknown customer → 200, no-op. Unknown event type → 200. | I | P1 |
| D6 | Downgrade from Pro to Free with 5 upcoming events: the existing events stay, new ones are blocked (402), and the custom theme is ignored. | I | P2 |
| D7 | Portal: no customer → friendly error. Demo mode → 503. | I | P3 |

### E. Discovery & search
| # | Case | Layer | Pri |
|---|---|---|---|
| E1 | `/` radius: `loc=New Haven&radius=10` returns only events ≤ 10 mi, sorted by date. "Use my location" works. Tonight / This weekend / This week windows are computed in **ET** (BUG-1). | U+E2E | P1 |
| E2 | `/artists`: `loc=06511&radius=25` → only artists within 25 mi, sorted by distance with an "X mi" label and a result count. Pro/featured first. Type, genre, available, seeking and date filters combine (AND). | U+E2E | P1 |
| E3 | `/venues`: same radius behavior. Legacy `?city=` links still work. Unmatched location shows "Couldn't match that CT location" and no radius filter. | E2E | P1 |
| E4 | `resolveCtLocation` table tests: exact town, "Town, CT", prefix, ≥3-char substring, ZIP, unknown ZIP, empty. **"CT"/"ct" must return null** (BUG-5). | U | P1 |
| E5 | Text search is case-insensitive **on Postgres** (`q=jazz` finds "Jazz"), Postgres-parity job (BUG-7). | I(pg) | P1 |
| E6 | `distanceMiles` known pairs (Hartford↔New Haven ≈ 34 mi ±1). Symmetric, zero for the same point. | U | P2 |

### F. Verification & admin
| # | Case | Layer | Pri |
|---|---|---|---|
| F1 | Host requests verification with a website on the same domain as the account email → auto-verified (`method=domain`). A Fan → 400. Already verified → 200 no-op. | I+E2E | P1 |
| F2 | **Negative:** a free-mail domain (gmail.com, outlook.com, yahoo.com, icloud.com …) must **never** auto-verify (BUG-3). | I | P1 |
| F3 | **Negative:** changing `displayName` or `websiteUrl` after verification resets it to `pending` / unverified, or needs re-review (BUG-3). | I | P1 |
| F4 | A non-matching domain → `pending`, and the request shows in `/dashboard/admin`. | I+E2E | P1 |
| F5 | Admin queue: `ADMIN_EMAILS` unset → `/dashboard/admin` 404, API 403. A listed admin (case-insensitive, whitespace-trimmed) approves → `VerifiedBadge` on the profile, card and event host. Reject → `rejected`, no badge. Unknown profile → 404. A non-admin → 403. | I+E2E | P1 |

### G. Cross-cutting
| # | Case | Layer | Pri |
|---|---|---|---|
| G1 | axe 0 serious/critical on `/`, `/artists`, `/venues`, `/event/[id]`, `/p/[slug]`, `/pricing`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, and each role's `/dashboard`, `/dashboard/events`, `/dashboard/messages`, `/dashboard/billing`, `/dashboard/profile`, in **dark and light**. | A | P1 |
| G2 | 390px mobile: no horizontal scroll, the hamburger nav is keyboard operable, the genre shortcut row scrolls. | E2E | P2 |
| G3 | The graceful-degradation matrix boots and works with each of `STRIPE_*`, `RESEND_API_KEY`, `CRON_SECRET` and `ADMIN_EMAILS` unset. | E2E | P2 |
| G4 | No console errors or hydration warnings on the smoke pages (server/client date mismatch is a known source, see BUG-1). | E2E | P2 |

---

## 3. QA tickets

Estimates are in ideal dev-days. Sprint 0 is setup/hardening.

| ID | Title | Description | Est | Sprint | Depends on |
|---|---|---|---|---|---|
| **QA-1** | Vitest harness + CI job | Add `vitest` + `@vitest/coverage-v8`, `vitest.config.ts` with the `@/` alias, and `npm test` / `test:unit` scripts. Add a `test` job to `ci.yml` (it must go green before `build`). Coverage report as an artifact. | 1 | 0 | none |
| **QA-2** | Unit tests for `src/lib` | ct-geo, plans, discovery, validations, utils, admin: all the [U] cases in §2, table-driven. Include the failing tests for BUG-5, marked `it.fails` until fixed. | 2 | 0 | QA-1 |
| **QA-3** | Test DB + factories + Free-tier fixtures | `globalSetup` builds a per-worker SQLite DB with an absolute path and `db push --force-reset`. Factories for user, profile, event and rsvp. Add Free-tier host demo logins to `prisma/seed.ts`. | 1.5 | 0 | QA-1 |
| **QA-4** | API integration suite: auth, social, messaging | Sections A, B and C3 of §2 at route level, including the validation-order contract tests (first failing gate wins). Session mock helper `asUser(email)`. | 3 | 1 | QA-3 |
| **QA-5** | API integration suite: events, plan limits, billing, webhook, boost, verify, admin | C1–C2, C5–C6, D1–D7 and F1–F5. Signed webhook payloads via `generateTestHeaderString`. | 3 | 1 | QA-3 |
| **QA-6** | Timezone contract + tests (pairs with the BUG-1 fix) | Pull `whenWindow` out into `src/lib/dates.ts`. Unit tests with the clock frozen at 23:30 ET and 00:30 UTC. E2E C4 with `timezoneId: America/New_York` and the server at `TZ=UTC`. | 1.5 | 1 | QA-2, dev fix |
| **QA-7** | Playwright E2E smoke + per-role `storageState` | `@playwright/test` config (webServer = `next start` on the seeded test DB, Chromium). Login fixtures for 4 roles plus Free hosts. The P1 E2E cases from §2. Runs on PR → `dev`. | 3 | 1 | QA-3 |
| **QA-8** | axe a11y gate, both themes | `checkA11y(page)` helper that sets `.dark`/`.light` via `addInitScript` and fails on serious/critical. Covers the G1 page list. Fix or triage the current `aria-progressbar-name` finding (BUG-8). | 1.5 | 1 | QA-7 |
| **QA-9** | Postgres-parity CI job | A nightly workflow and a `dev` → `main` check: `services: postgres:16`, provider switched via `scripts/set-db-provider.mjs`, and the integration suite runs. Must include E5. | 1.5 | 2 | QA-4, QA-5 |
| **QA-10** | Full E2E regression + release workflow | All the remaining P2/P3 E2E cases. A `release.yml` on PRs to `main` running full E2E + axe + pg-parity. Branch protection rules for `dev` and `main` (the PO or repo owner applies them). | 3 | 2 | QA-7, QA-8, QA-9 |
| **QA-11** | Regression gate for merging `stack-review-council` (Next 15 / React 19) | That branch overlaps PR #1 in **33 files** (every page touched by the icon swap, `EventsManager`, `artists`/`venues`/`page.tsx`, `utils.ts`, `constants.ts`), and adds a schema change (`PageView`) and `src/lib/track.ts`. Next 15 makes `params`/`searchParams` async, which affects **every** `[id]` route handler and every page reading `searchParams`. Plan: land QA-4/5/7/8 on `dev` **first**, rebase the upgrade on top, and require the full suite + a manual icon/visual diff of the 33 shared files. Explicit checks: hydration warnings, `next-auth` v4 on React 19, lucide import names. | 2 | 2 | QA-4, QA-5, QA-7, QA-8 |
| **QA-12** | Stripe test-mode staging runbook | Configure test keys and a webhook on `dev` staging. Script `stripe trigger` / CLI forwarding for subscribe, update (past_due), cancel and boost. Record the expected DB state. This is the manual gate for `dev` → `main`. | 1 | 2 | QA-5 |
| **QA-13** | Security/abuse regression pack | Tests for BUG-2, BUG-3 and the reset-password session invalidation (BUG-9). Rate-limit tests once limits exist (signup, forgot-password, messages). Cron auth with the secret set. | 1.5 | 3 | QA-5, dev fixes |
| **QA-14** | Test plan for multi-role accounts / `ProfileMember` (UX P0) | When the "acting as" switcher lands (UX_REVIEW §3), extend the suite: every `getCurrentProfile` caller acts as the *active* profile. Ownership checks cover member roles (OWNER/ADMIN/MEMBER). Invite = claim flow. JWT carries `activeProfileId`. This needs its own risk-based plan because it touches auth, the session and every mutation. | 2 | 3 | QA-4, QA-5, QA-7 |
| **QA-15** | Visual/mobile regression snapshots | Playwright screenshots at 390px and 1280px for the key pages in both themes, with a threshold diff. Catches icon and EventArt regressions. | 1.5 | 4 | QA-10 |
| **QA-16** | Flake budget + test observability | Retry=1 in CI only, trace-on-first-retry, a flaky-test quarantine label, and a weekly report. | 0.5 | 4 | QA-10 |

Totals: Sprint 0 = 4.5d, Sprint 1 = 12d, Sprint 2 = 7.5d, Sprint 3 = 3.5d, Sprint 4 = 2d. Sprint 1 is heavy, so split QA-4, QA-5 and QA-7 across QA and dev pairs.

---

## 4. Bugs found (exploratory, PR #1 branch)

Environment: scratch copy of `19d4e84`, `next dev -p 3100`, seeded SQLite, server TZ = UTC (the same as Vercel), no Stripe/Resend keys.

### BUG-1: Event times are stored as UTC wall-clock; hosts see a 4-hour discrepancy. **Severity: High (Sev-2)**
The `datetime-local` value (`"2026-10-01T20:00"`, with no offset) is sent raw from `EventsManager` and parsed by `new Date()` **on the server**, which runs in UTC. The seed uses `setHours(20)` on the server the same way.
- **Repro:**
  1. Log in as `venue@demo.com` in a browser set to America/New_York.
  2. Go to `/dashboard/events`. The first event, "The Night Owls + Harbor Lights", shows **4:00 PM**.
  3. Open `/event/[id]` for the same event: it shows **8:00 PM** (server-rendered in UTC).
  4. API check: POST `/api/events` `{startAt:"2026-10-01T20:00"}` → stored `2026-10-01T20:00:00.000Z` (= 4 PM EDT).
- **Knock-on effects:**
  - The `.ics` export writes `DTSTART:…T200000Z`, so a show lands at 4 PM in the fan's calendar.
  - Reminder emails use server-local formatting.
  - "Tonight" and "This weekend" compute day boundaries in UTC, so "Tonight" ends at 7:59 PM ET, drops late shows, and flips at 8 PM ET.
  - The availability date and `/artists?date=` filters are off by one day near midnight.
- **Fix direction:** convert on the client (`new Date(local).toISOString()`), and render and compute every window with `timeZone: "America/New_York"`.

### BUG-2: Free 3-event limit bypass via past-dated create + PATCH. **Severity: High (Sev-2, revenue)**
`POST /api/events` counts only *upcoming* events and accepts past dates. `PATCH /api/events/[id]` has no plan-limit check.
- **Repro:**
  1. Sign up a new Band (Free).
  2. POST 2 future events → 201.
  3. POST 3 events with `startAt` 10 days in the past → all 201.
  4. PATCH each of those to 20 days in the future → 200.
  5. Result: **5 upcoming events on the Free plan** (confirmed in the DB).
- **Fix direction:** re-run the limit check in PATCH when an event moves from past to upcoming. Optionally reject past `startAt` on create.

### BUG-3: Verification can be self-granted and survives identity changes. **Severity: High (Sev-2, trust/safety)**
- (a) Auto-verification compares the email domain to the website domain, but **signup never confirms email ownership** and free-mail domains aren't excluded.
  - **Repro:** sign up a Venue named "Toad's Place" as `anything@gmail.com`, then POST `/api/profile/verify {websiteUrl:"https://gmail.com"}` → `{verified:true, autoVerified:true}`.
  - The same attack works with *any* domain the attacker doesn't own (e.g. sign up as `booking@toadsplace.com` without owning that mailbox).
- (b) After verification, `PUT /api/profile {displayName:"Foxwoods Resort Casino", websiteUrl:"https://foxwoods.com"}` → 200, **still `verified:true`**.
- **Fix direction:**
  - Require an email-ownership confirmation before domain auto-verify.
  - Keep a free-mail denylist.
  - Reset verification when `displayName` or `websiteUrl` changes.
  - This relates to `docs/launch/trust-and-verification.md`.

### BUG-4: RSVP toggles spam the host with notifications. **Severity: Low (Sev-4)**
The code comment says "first RSVP only", but every non-NONE POST creates a notification.
- **Repro:** as a fan, RSVP GOING → MAYBE → GOING → NONE → GOING on one event. The host receives **4** RSVP notifications.
- **Fix direction:** notify only when no RSVP existed before.

### BUG-5: Location "CT" silently resolves to Hartford. **Severity: Low (Sev-4)**
`resolveCtLocation("CT")` strips `, CT`, which leaves an empty name. `startsWith("")` then matches the first town.
- **Repro:** `/venues?loc=CT&radius=5` → "0 venues within 5 mi of Hartford". The same happens on `/?loc=CT`.
- **Expected:** treat it as "no location" (statewide).

### BUG-6: Stripe webhook is not idempotent, and boost ignores `payment_status`. **Severity: Medium (Sev-3), code review**
- A redelivered `checkout.session.completed` (kind=boost) resets `featuredUntil` to now+30d, so a Stripe retry extends the paid window.
- A boost activates without checking `session.payment_status === "paid"` (async payment methods).
- No `event.id` dedupe store.
- **Separately:** `sub.current_period_end` moves to subscription items in newer Stripe API versions. The pinned SDK default is fine today, but the next `stripe` major bump will write `Invalid Date` and cause a 500. Add a contract test (D4/D5).

### BUG-7: Text search is case-sensitive on Postgres (prod). **Severity: Medium (Sev-3), code review, predicted**
- `/artists` and `/venues` use Prisma `contains` with no `mode: "insensitive"`. There are 5 call sites.
- SQLite (dev/CI) is case-insensitive for ASCII, so this can't show up locally. On Postgres, `q=jazz` won't match "Jazz".
- Saved-search matching is not affected: it lowercases in app code.
- **Verify with QA-9.**

### BUG-8: Onboarding progress bar has no accessible name. **Severity: Low (Sev-4, a11y, WCAG 4.1.2)**
- axe `aria-progressbar-name` (serious) fires on `/dashboard` for venue, musician and band, in both themes.
- Source: `OnboardingChecklist.tsx:49`, `role="progressbar"` with no `aria-label`/`aria-labelledby`.
- **Everything else scanned was clean:** 0 violations on `/`, `/artists`, `/venues`, `/login`, `/signup`, `/pricing` and `/forgot-password` in dark and light, and on the fan dashboard.

### BUG-9: Password reset doesn't invalidate existing sessions. **Severity: Medium (Sev-3), code review**
- JWT sessions last 30 days and there is no token version or `passwordChangedAt` check, so a stolen session survives a reset.
- No rate limiting on `/api/auth/signup`, `/api/auth/forgot-password` or `/api/messages`.

**Verified OK:**
- Demo billing: checkout and boost → 503 `BILLING_DISABLED`; webhook → 503.
- Admin API as a non-admin → 403; `/dashboard/admin` → 404 for a non-admin, 200 for an admin.
- Unauthenticated RSVP → 401.
- Zod-before-existence ordering holds on RSVP.
- All 4 demo logins land on `/dashboard`.

---

## 5. Release checklist: `dev` → `main`

**Code & CI**
- [ ] Release PR `dev` → `main` is open, the changelog lists tickets and bug IDs, and there are no unrelated commits.
- [ ] Green: build, tsc, lint, unit, API integration (SQLite **and** Postgres parity), full E2E (§2 all P1+P2), axe sweep in both themes (0 serious/critical).
- [ ] No open Sev-1/Sev-2 bugs. Known Sev-3/4 bugs are listed in the release notes with an owner.
- [ ] Coverage on `src/lib` has not dropped.

**Data & schema**
- [ ] Schema diff against prod reviewed. `prisma db push` has no data-loss prompts, or a migration plan exists. Backup/snapshot of the prod DB taken.
- [ ] Still no enums or `Bool`. New string filters are Postgres case-safe.
- [ ] The seed is **not** run against prod.

**Config & environment (prod)**
- [ ] `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` and `DATABASE_URL`/`POSTGRES_*` are set.
- [ ] Stripe **live** keys, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_PRICE_ID_PRO_{MONTHLY,YEARLY}` match $12/mo and $120/yr in `plans.ts`.
- [ ] The webhook endpoint is subscribed to `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`.
- [ ] `RESEND_API_KEY` + a verified sending domain are set.
- [ ] **`CRON_SECRET` is set** (otherwise the reminders endpoint is public) and the Vercel cron sends the bearer.
- [ ] `ADMIN_EMAILS` is set to real admins only.
- [ ] The server timezone assumption is documented (UTC) and the BUG-1 fix is verified on staging.

**Staging (dev) sign-off**
- [ ] Stripe test mode on staging: subscribe (monthly + yearly) → Pro badge + ranking; cancel → Free; `past_due` → Free; boost → ★ Featured for 30 days; replayed webhook doesn't extend it.
- [ ] Manual smoke per role on the staging URL: signup, login, reset email received, RSVP, follow, friend, message, post event (Free limit enforced), verification request → admin approve.
- [ ] Mobile 390px pass on `/`, `/event/[id]`, `/dashboard`. Keyboard-only pass on signup and event creation.
- [ ] If this release includes the Next 15/React 19 upgrade: QA-11 is complete, there are no hydration warnings, and every `[id]` route and filtered page has been exercised.

**Go-live**
- [ ] Merge, confirm the Vercel prod deploy is green, then run a smoke on prod: home loads, login works, `/pricing` shows live billing (not demo), and `POST /api/stripe/webhook` without a signature returns 400 (not 503).
- [ ] Watch logs and Stripe webhook deliveries for 30 min. Rollback plan: Vercel "promote previous deployment", and the DB snapshot if the schema changed.
- [ ] Back-merge any hotfixes `main` → `dev`. Tag the release.
