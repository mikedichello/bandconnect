# BandConnect sprint plan: Sprints 0–4 (2-week sprints)

This plan was put together on 2026-09-24 from three role inputs, kept in full under
[`docs/planning/2026-09/`](planning/2026-09/):

- [Product Owner](planning/2026-09/po.md): stories and acceptance criteria.
- [Senior Dev](planning/2026-09/dev.md): the Sprint 0 reconciliation, designs and estimates.
- [Senior QA](planning/2026-09/qa.md): test strategy, regression suite and bugs found.

Every ticket is a GitHub issue labelled `sprint-N`, `type:*`, `owner:*` and `P0–P2`. The key in each
title (e.g. `S1-04`) is what feature branches and PR titles use:

- branch: `feat/S1-04-postgres-migrate`
- PR title: `S1-04: Postgres everywhere + prisma migrate`

The branch model is described in [`BRANCHING.md`](BRANCHING.md).

**North Star:** weekly RSVPs. **Beachhead:** New Haven.

## How the three inputs were reconciled

- **Multi-role accounts ship in Sprint 2, not Sprint 1.** The Product Owner wanted Sprint 1. The dev critical path shows it depends on
  Postgres + `prisma migrate` (S1-04) and on the test suites, and touches about 60 files. Sprint 1 builds that
  foundation plus the multi-role schema; Sprint 2 delivers the feature end to end.
- **QA's three High bugs go straight into Sprint 1:** event times off by 4 hours, the Free event-limit bypass,
  and self-granted verification.
- **Sprint 0 merges the parallel branch by cherry-picking.** `stack-review-council` overlaps PR #1. We keep PR #1's icons and search, take the
  council branch's Next 15, page views, weekly digest and verified-only booking search, and skip its icon commit. That cuts
  about 60 conflict hunks to about 6.
- **The demo-seed guard (S0-06) blocks the first release.** The seeded demo build wipes the DB whenever `DEMO_SEED=1`,
  and nothing tells the demo database apart from prod.

## Sprints

| Sprint | Goal | Exit metrics |
| --- | --- | --- |
| **S0: Stabilize & reconcile** | One green `main` containing PR #1 + the council work, seeded demo live with no prod risk, tests started, multi-role spec signed off | CI green on `main`, 0 divergent branches, `v0.3.0` tagged, funnel baseline recorded |
| **S1: Foundations & fixes** | Prod-safe data layer (Postgres + migrations), route + E2E + a11y tests gating PRs, High bugs fixed, multi-role schema migrated | 0 open Sev-1/2, suites required on PR → `dev`, backfill verified |
| **S2: One login, many hats** | Users switch between profiles; bands invite members with granular rights; hero search | 0 P0 auth bugs; ≥30% of beta bands have ≥2 members; hero search in ≥35% of home sessions |
| **S3: Claim & discover** | Seeded pages get claimed; lineups, trending and followed-artist alerts; booking API | ≥40% of contacted venues claimed; weekly RSVPs +20% vs S0 |
| **S4: Get booked** | EPK, request-to-book, venue inbox, boost credit, Pro copy refresh | ≥50 requests sent, ≥20% replied, artist Free→Pro ≥3% |

### Ticket map

**Sprint 0: Stabilize & reconcile**

| Key | Issue | Title | Owner | P |
| --- | --- | --- | --- | --- |
| S0-01 | #2 | Branch topology: `main` default, protect `main` + `dev` | Dev + admin | P0 |
| S0-02 | #3 | Land PR #1 into `dev` | Dev | P0 |
| S0-03 | #4 | Integrate council branch via cherry-pick | Dev | P0 |
| S0-04 | #5 | Unify InsightsCard + `/dashboard/analytics` | Dev | P1 |
| S0-05 | #6 | Next 15 / React 19 regression pass | QA | P0 |
| S0-06 | #7 | **Seed safety guard** (blocks release) | Dev | P0 |
| S0-07 | #8 | Vitest harness + CI test job + `src/lib` unit tests | QA | P0 |
| S0-08 | #9 | Test DB, factories, Free-tier demo accounts | QA | P1 |
| S0-09 | #10 | a11y: onboarding progress bar name | Dev | P2 |
| S0-10 | #11 | Multi-role spec + migration plan | **PO** + Dev | P0 |
| S0-11 | #12 | Funnel instrumentation baseline | **PO** + Dev | P1 |
| S0-12 | #13 | Docs: ENVIRONMENTS.md, PR template, CODEOWNERS | Dev | P2 |
| S0-13 | #14 | **Release `dev → main` v0.3.0** + demo live | QA + Dev | P0 |

**Sprint 1: Foundations & fixes**

| Key | Issue | Title | Owner | P |
| --- | --- | --- | --- | --- |
| S1-01 | #15 | BUG: event times off by 4 hours | Dev | P0 |
| S1-02 | #16 | BUG: Free 3-event limit bypass | Dev | P0 |
| S1-03 | #17 | BUG: verification self-grant | Dev | P0 |
| S1-04 | #18 | Postgres everywhere + `prisma migrate` baseline | Dev | P0 |
| S1-05 | #19 | API route integration suites | QA | P0 |
| S1-06 | #20 | Playwright E2E per role + axe gate | QA | P0 |
| S1-07 | #21 | CI hardening + per-PR preview DBs | Dev | P1 |
| S1-08 | #22 | Observability + fail-closed crons | Dev | P1 |
| S1-09 | #23 | Multi-role schema + backfill | Dev | P0 |
| S1-10 | #24 | BUGs: RSVP notification spam, "CT" → Hartford, case-sensitive search | Dev | P2 |

**Sprint 2: One login, many hats**

| Key | Issue | Title | Owner | P |
| --- | --- | --- | --- | --- |
| S2-01 | #25 | Active profile in JWT + entitlements | Dev | P0 |
| S2-02 | #26 | Refactor session call sites + role checks | Dev | P0 |
| S2-03 | #27 | "Acting as" switcher + create another profile | Dev · PO accepts | P0 |
| S2-04 | #28 | Band Members tab: invites + granular rights | Dev · PO accepts | P0 |
| S2-05 | #29 | Stripe hardening (idempotency, `payment_status`) | Dev | P1 |
| S2-06 | #30 | PageView hardening + rollup | Dev | P1 |
| S2-07 | #31 | Hero search above the fold | Dev · PO accepts | P1 |
| S2-08 | #32 | Postgres parity, release workflow, Stripe runbook | QA | P1 |
| S2-09 | #33 | Multi-role risk-based test plan | QA | P0 |

**Sprint 3: Claim & discover**

| Key | Issue | Title | Owner | P |
| --- | --- | --- | --- | --- |
| S3-01 | #34 | Profile-scoped inbox + notifications | Dev | P1 |
| S3-02 | #35 | Claim ownerless pages + admin invites + name-squat protection | Dev · PO accepts | P0 |
| S3-03 | #36 | Multi-act lineups | Dev | P1 |
| S3-04 | #37 | Followed artist near you alerts | Dev | P1 |
| S3-05 | #38 | "Trending in CT" strip | Dev | P1 |
| S3-06 | #39 | Rate limiting + security pack (reset invalidates sessions) | Dev + QA | P1 |
| S3-07 | #40 | BookingRequest model + API | Dev | P1 |

**Sprint 4: Get booked**

| Key | Issue | Title | Owner | P |
| --- | --- | --- | --- | --- |
| S4-01 | #41 | EPK page | Dev · PO accepts | P1 |
| S4-02 | #42 | Request-to-book UI + artist pipeline | Dev | P1 |
| S4-03 | #43 | Venue booking inbox (owner) | Dev | P1 |
| S4-04 | #44 | Pro monthly boost credit | Dev | P1 |
| S4-05 | #45 | Pricing + contextual upsells refresh | **PO** + Dev | P1 |
| S4-06 | #46 | `loading.tsx` / error boundaries | Dev | P2 |
| S4-07 | #47 | Visual regression + flake budget | QA | P2 |

**Critical path:** S0-03 → S0-13 → S1-04 → S1-09 → S2-01 → S2-02 → {S2-03, S2-04, S3-07} → S4-02 → S4-03.
S2-07 (hero search) has no dependencies, so a second dev can pick it up at any time.

**Backlog (S5+):**
- "Offer a date" (PO-24)
- Insights v2: attendance funnel + follower CSV export (PO-25)
- "Notify my followers nearby" (PO-26)
- Bulk import
- The parked list in [po.md §4](planning/2026-09/po.md), e.g. Fan Plus, ticketing, OAuth/uploads before the Hartford expansion

## Product decisions (decided 2026-09-24, inputs to S0-10)

1. **Billing covers everything a user owns.** One Pro subscription applies to every profile the paying user
   owns. Entitlements come from the profile's billing owner (`ownerUserId`).
2. **Messages to a band are profile-addressed.** They fan out to the band's admins, plus any member who has
   been granted messaging rights.
3. **Only bands have members; venues don't.**
   - A venue is single-owner: its owner account manages it, and there are no venue co-workers.
   - Band roles are `OWNER` / `ADMIN` / `MEMBER`.
   - A band admin grants each member individual rights: **post events**, **edit events**, **message as the band**.
   - Members get no rights by default. Billing, boosts, delete, settings and member management stay
     OWNER/ADMIN only.
4. **Band membership is many-to-many.**
   - A band has many members, and a musician can be in many bands. There's no limit on either side.
   - Role and rights are **per band**: the same person can be ADMIN of one band and a post-only MEMBER of another.
   - Leaving one band doesn't affect the others.
   - Each membership can link the member's musician profile. The musician page then shows "Plays in: Band A · Band B · …",
     and the band page links each member.
   - One login can own or belong to any mix of profiles (a venue, a musician, several bands) and switch between
     them with the "Acting as" switcher.

Superseded in the role inputs: [po.md](planning/2026-09/po.md) and [dev.md](planning/2026-09/dev.md) mention
venue members, a shared venue inbox and venue assignees. Those are out of scope under decision 3.

## Definition of Done (every ticket)

1. The acceptance criteria are met and the PO has verified them on the `dev` preview.
2. Tests are added at the right layer:
   - `lib` change → unit test
   - route change → integration test, covering the 400/401/403/404/409/402 branches it touches
   - user-visible flow → E2E case
3. CI is green: build · tsc · lint · unit · integration · E2E smoke · axe.
4. No new serious/critical axe issues in **both themes**, and a keyboard-only pass is done. Forms follow the CLAUDE.md rules.
5. No Prisma enums; string filters are case-safe on Postgres.
6. The graceful fallbacks still work: no Stripe, no Resend, no `CRON_SECRET`, no `ADMIN_EMAILS`.
7. Dates are stored in UTC and entered and displayed in `America/New_York` (after S1-01).
8. Docs and CLAUDE.md are updated if behavior or config changed. There are no secrets or model identifiers in the diff.

## Release checklist: `dev` → `main`

**Code & CI**
- [ ] Release PR `dev → main` is titled `Release YYYY-MM-DD`, its changelog lists the ticket keys, and the `promotion-guard` check is green.
- [ ] These are green: build, tsc, lint, unit, integration (SQLite **and** Postgres), full E2E, and the axe sweep in both themes.
- [ ] No open Sev-1/Sev-2 bugs. Sev-3/4 bugs are listed in the release notes, each with an owner.

**Data**
- [ ] The prod DB snapshot is taken and the schema diff reviewed. Migrations are applied per `DEPLOYMENT.md`.
- [ ] The demo seed **cannot** target prod (S0-06).

**Prod config**
- [ ] `NEXTAUTH_SECRET/URL` and `NEXT_PUBLIC_APP_URL` are set, along with the DB vars.
- [ ] Live Stripe keys, the webhook secret, and price IDs that match `plans.ts` ($12/mo · $120/yr).
- [ ] The webhook is subscribed to the checkout and subscription events.
- [ ] `RESEND_API_KEY` is set and the sending domain verified.
- [ ] **`CRON_SECRET` is set.**
- [ ] `ADMIN_EMAILS` lists real admins only.

**Staging sign-off (on the `dev` Preview)**
- [ ] Stripe test mode:
  - subscribe monthly and yearly → Pro badge and ranking
  - cancel → Free
  - `past_due` → Free
  - boost → Featured for 30 days
  - a replayed webhook doesn't extend the boost
- [ ] Manual smoke test per role, a 390px mobile pass, and a keyboard-only pass on signup and event creation.

**Go-live**
- [ ] Merge with a **merge commit**. Check prod:
  - home page loads and login works
  - `/pricing` shows live billing
  - an unsigned `POST /api/stripe/webhook` returns 400
- [ ] Watch logs and Stripe deliveries for 30 minutes. Rollback is Vercel's "promote previous deployment", plus the DB snapshot.
- [ ] Tag `vYYYY.MM.DD`, and back-merge any hotfixes from `main` → `dev`.
