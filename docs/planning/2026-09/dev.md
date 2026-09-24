# BandConnect: Senior Developer / Tech Lead input to the sprint plan

*Date: 2026-09-24. Everything here was read-only. Branch facts were checked against `origin` and a throwaway worktree. No repo files were changed.*

---

## 0. Branch facts (verified)

| Ref | SHA | What it is |
| --- | --- | --- |
| `origin/main` = `origin/claude/tender-wright-04kyoq` | `f52d8d0` | Prod baseline. Next 14.2.15, React 18. |
| `origin/dev` | `4b0d728` | main plus 3 commits: `demo-seed.mjs` in the build script, `DemoBanner`, dormant `deploy-dev.yml`, `.devcontainer`. 9 files. |
| PR #1 `claude/band-connect-ux-review-0x6wu0` | `19d4e84` | 1 commit, 43 files (+707/−177). Lucide icons, `EventArt`, `LocationFields`, `src/lib/discovery.ts` (radius search plus Pro-derived featured), `InsightsCard`, `plans.ts` copy, `bg-input` token. |
| `claude/stack-review-council-d88sez` | `5307775` | 7 commits on top of main, 58 files (+1976/−925). See the list below. |

Council commits, oldest first:
`d2219b3` stack-review doc · `6de4051` booking-search verified gate + Spotify embed + weekly digest (`User.digestSentAt`, `/api/cron/digest`) · `5a82512` **emoji→Lucide (36 files)** · `343b7df` **Next 15.5.20 + React 19.2 + codemod (async `params`/`searchParams`) + npm overrides** · `3278b44` Pro analytics (`PageView` model, `src/lib/track.ts` via `after()`, `/dashboard/analytics`) · `705f0d6` README/CLAUDE.md · `5307775` `docs/ENVIRONMENTS.md` + `scripts/db-sync.mjs` in the build.

### Trial-merge results

| Merge | Result |
| --- | --- |
| dev ← PR #1 | **Clean**, 0 conflicts |
| dev ← council (full merge) | 1 conflict: `package.json` build script (demo-seed vs db-sync) |
| PR #1 ← council (full merge) | **31 files / 60 conflict hunks**. Worst: `p/[slug]` 8, `event/[id]` 4, `artists` / `venues` / `page.tsx` / `dashboard/page.tsx` / `NotificationsList` 3 each. Almost all are icon-vs-icon (both branches did the emoji swap) plus codemod signatures. |
| (dev + PR #1) ← council cherry-picked **one commit at a time, skipping `5a82512`** | `d2219b3` clean · `6de4051` conflicts in `artists/page.tsx` (2 hunks) · `343b7df` conflicts in `venues/page.tsx` (1), plus `artists` (codemod vs radius params) once resolved properly · `3278b44` clean or 1 hunk in `p/[slug]` · `705f0d6` `CLAUDE.md` (1) · `5307775` `package.json` (1). **About 5–7 hunks in 5 files, down from 60.** |
| `343b7df` (Next 15) cherry-picked alone onto main or dev | **Clean** (usable as a hotfix path) |

Two icon systems collide. Council adds `src/components/ProfileTypeIcon.tsx` (keyed by `icon: "ticket"|"landmark"…` plus a new `icon` field on `PROFILE_TYPES`). PR #1 adds `src/components/icons/ProfileTypeIcon.tsx` (keyed by profile `type`). Dropping `5a82512` removes the duplicate completely. The Sidebar `analytics` key comes in with `3278b44`, not the icon commit.

---

## 1. Sprint 0 reconciliation plan

### Recommended order into `dev`

1. **Retarget PR #1 to `dev` and merge it** (DEV-2). It merged clean in the trial, it is the reviewed UX work, and it becomes the base that wins on icons.
2. **Cut `integrate/council` off the new `dev`** and cherry-pick in this order: `d2219b3`, `6de4051`, `343b7df`, `3278b44`, `705f0d6`, `5307775`. **Drop `5a82512`** because PR #1 already covers everything in it. Open it as a PR into `dev` (DEV-3). Afterwards, tag the council branch (`archive/council-2026-07`) and delete it so nobody merges it wholesale.
3. **Keep dev's 3 demo commits in place.** They are already on `dev`. Resolve `package.json` by combining both build scripts:
   `set-db-provider → db-sync (later: migrate deploy) → prisma generate → demo-seed → next build`.
4. **Fix-ups on dev** (DEV-4, DEV-5, DEV-6), then a **release PR `dev → main`** (DEV-7). Make `main` the default branch and protect both branches (DEV-1).

Why PR #1 goes first rather than council: PR #1 is the source of truth for UX and icons. Taking it as the base lets us drop the one commit that causes about 50 of the 60 conflict hunks. The codemod in `343b7df` is mechanical, and under Next 15 types `tsc` reports every page PR #1 touched that still reads `searchParams` synchronously (home, artists, venues, event, profile). So re-applying the codemod is low risk.

### Which implementation wins where

| Overlap | Winner | Resolution |
| --- | --- | --- |
| **Icons** | **PR #1** | Keep `components/icons/ProfileTypeIcon` (type-keyed) and `EventArt`. Drop council's `components/ProfileTypeIcon.tsx` and the `icon` field on `PROFILE_TYPES`. Also delete any leftover council-only icon usages. |
| **Artist/venue search** | **Both, combined** | Keep PR #1's `rankProfiles()` (radius, distance sort, plan-derived featured). Add council's `bookingIntent ? { verified: true }` to the Prisma `where` and its notice copy. Keep PR #1's result-count line above the notice. Apply the Next 15 `await props.searchParams` shape, including the new `loc` and `radius` keys. |
| **Featured logic** | **PR #1** (`discovery.ts`: `featured \|\| isPro(owner.plan)`) | Council still orders by `featured desc` in the DB. That is harmless, but PR #1's in-memory ranking is authoritative. Later (DEV-15) `isPro(p.user.plan)` becomes `isPro(billingOwner.plan)`. Event boosts (`Event.featured/featuredUntil`) are unchanged. |
| **Analytics vs insights** | **Keep both, share one query layer** | `InsightsCard` (PR #1) stays as the dashboard summary and Free teaser. `/dashboard/analytics` (council) is the Pro deep dive. Pull the shared queries into `src/lib/insights.ts` (followers 30d vs prior, RSVP demand, top towns, **profile/event views from `PageView`**). The card shows "views (30d)" and links to the analytics page. Update the `plans.ts` Pro copy so it once again promises "page views & RSVP funnel", since it now exists. |
| **Spotify embed, weekly digest, verified gate** | Council (no overlap) | Taken as-is. Digest adds a Vercel cron. Confirm `CRON_SECRET` is set in prod before release. |
| **ENVIRONMENTS.md** | Council, edited | It describes feature→`main` with Previews and calls `dev` "optional". Rewrite it for the adopted **feature → dev → main** flow (DEV-30). |
| `CLAUDE.md` | Hand-merge | Combine the status sections. Replace "Develop on `claude/tender-wright-04kyoq`" with the new branching rules. |

### Next 15 / React 19 upgrade risk: **Medium-low, take it now**

- **Why now:** `next@14.2.15` has open high/critical advisories (DoS, cache poisoning, SSRF). We have no `middleware.ts`, so the headline middleware-bypass CVE does not apply, but the rest do. `track.ts` also depends on `after()` from Next 15. Postponing the upgrade means every new PR adds more synchronous-`searchParams` code that will need converting later.
- **Already done in council:** codemod on 15 files, `next-auth` resolved to 4.24.14 (supports Next 15 / React 19 peers), `postcss`/`uuid` overrides, build, tsc and lint green, manual smoke test.
- **Remaining risks:** (a) new PR #1 code paths still need the async conversion (tsc catches these). (b) React 19 changes: `useFormState` → `useActionState` (a grep showed none) and changed ref/`defaultProps` handling in client islands. (c) Next 15 no longer caches GET route handlers or `fetch` by default. That is safer for us, but check the `.ics` route and cron routes. (d) `lucide-react@1.x` with React 19 is fine. (e) next-auth v4 is in maintenance mode. Migrating to Auth.js v5 is **not** in this plan because the multi-role work already changes the JWT and doing both at once doubles the risk.
- **Mitigation:** DEV-5 regression checklist on the dev preview, covering all 4 demo logins, signup, event CRUD, RSVP, radius search, boost checkout (test mode), webhook, verify flow, dark/light. **Hotfix fallback:** if the dev→main release slips past Sprint 0, cherry-pick `343b7df` alone onto `main` (verified clean).

---

## 2. Technical design notes

### 2.1 Multi-role accounts + `ProfileMember` team access (P0)

**Current state:** `Profile.userId @unique`, `User.profile Profile?`, and `User.role` duplicates `Profile.type`. `User.plan` holds billing. Messages and notifications are keyed by **User**. Follow, RSVP, friendships, events and media are keyed by **Profile**. That split is useful: the social graph already acts "as a profile".

**Schema**

```prisma
model Profile {
  ownerUserId String?            // was userId @unique. Billing owner/creator. Nullable => ownerless seeded pages (trust spec "claim")
  owner       User?  @relation("OwnedProfiles", fields: [ownerUserId], references: [id], onDelete: SetNull)
  members     ProfileMember[]
  @@index([ownerUserId])
}
model ProfileMember {
  id        String  @id @default(cuid())
  profileId String
  userId    String
  role      String  // "OWNER" | "ADMIN" | "MEMBER"   (String, not enum: DB portability rule)
  title     String? // "Drums", "Talent buyer", shown on band/venue page
  showOnPage Boolean @default(true)
  createdAt DateTime @default(now())
  @@unique([profileId, userId])
  @@index([userId])
}
model ProfileInvite { id, profileId, email, role, tokenHash @unique, invitedById, expiresAt, acceptedAt? }
model User { lastActiveProfileId String?  /* role: deprecated, kept 1 release then dropped */ }
```

**Role matrix:**
- OWNER: everything, including billing, delete and transfer.
- ADMIN: edit profile, events, lineup, booking inbox, boosts. No billing, no member removal of OWNERs.
- MEMBER: post and edit events, availability, messages. No profile settings, members or boosts.

**Migrating existing 1:1 data.** This is a data migration, so it needs `prisma migrate` (DEV-12) first:
1. Add `ProfileMember`. Rename `Profile.userId` → `ownerUserId` in SQL (`ALTER TABLE … RENAME COLUMN`, not drop/add), drop the unique index, make it nullable.
2. `INSERT INTO "ProfileMember"(id, "profileId", "userId", role) SELECT gen_random_uuid(), id, "ownerUserId", 'OWNER' FROM "Profile" WHERE "ownerUserId" IS NOT NULL;`
3. `UPDATE "User" u SET "lastActiveProfileId" = p.id FROM "Profile" p WHERE p."ownerUserId" = u.id;`
4. Keep `User.role` written for one release (signup still sets it), then drop it.
5. Update `prisma/seed.ts`: seed a multi-role demo user (e.g. `musician@demo.com` is also a member of a demo band) and 1–2 ownerless venue pages.

**JWT "active profile"**
- `token.activeProfileId` is set at sign-in from `lastActiveProfileId`, falling back to the first OWNER membership.
- The switcher calls `useSession().update({ activeProfileId })`. The `jwt` callback with `trigger === "update"` **re-checks membership in the DB** before accepting it (never trust client input), and persists `lastActiveProfileId`.
- `session.user.activeProfileId`, `activeProfileType` and `activeRole` are exposed. Update `src/types/next-auth.d.ts`.
- Revocation: `getCurrentProfile()` always re-validates membership. It is wrapped in React `cache()` so it runs once per request. If the membership is gone, it falls back to another membership. A stale JWT therefore never grants access.

**Session API (keeps call sites mostly unchanged)**
- `getCurrentUser()` keeps returning `{ ...user, profile }`, but `profile` is now the **active** profile plus `membership.role`. Most of the ~39 `user.profile` references keep working.
- New `requireProfileRole(min: "MEMBER"|"ADMIN"|"OWNER")` for route handlers. It slots into the existing fail-fast order at the "ownership" step.
- New `getEntitlements(profile)`: Pro is resolved from the **profile's billing owner** (`owner.plan`), not the viewer's `user.plan`. A MEMBER acting for a Pro band gets Pro limits, and a Pro user's personal fan profile is unaffected. This affects `maxEvents`, analytics, `InsightsCard`, boosts and `discovery.ts`. **PO decision needed:** does one Pro subscription cover every profile the user owns? Recommendation: yes for v1 (simple), and revisit per-profile pricing later.

**Size of the change (counted on PR #1):**
- 41 files call session helpers: `requireUser` 25 refs / 13 files, `getCurrentProfile` 23 / 12, `getCurrentUser` 19 / 9, `getCurrentUserId` 19 / 8, `getServerSession`/`getSession` 5 / 2, `useSession` in `Navbar`.
- 21 are API route files, 12 dashboard files, 8 others.
- Plus 10 `where: { userId }` profile lookups and about 39 `profile: true` / `user.profile` references across 22 files (heaviest: `api/events/route.ts` with 15 and `api/profile/route.ts` with 5).
- About **60 files** are touched overall. Most edits are mechanical, and `tsc` finds every site because `findUnique({ where: { userId } })` stops compiling once `@unique` is removed.
- The real design work is in `auth.ts`, `session.ts`, `messages`, `notifications`, `me/badges` and billing.

**Messaging and notifications:** add nullable `senderProfileId`/`recipientProfileId` to `Message` and `profileId` to `Notification`, and backfill them from the owner profile. The inbox is scoped to the active profile, so every ADMIN and MEMBER of a venue sees its booking threads. Notification fan-out: a profile-level event goes to members with `role >= ADMIN`. This ships in a follow-up PR (DEV-19). Until then, DMs stay per user.

**UX hooks:**
- "Acting as ▾" switcher: a client island that receives plain `{id, displayName, type}` rows (string keys only, per the Server→Client rule).
- `/dashboard/profiles/new` to create another profile.
- `/dashboard/members` tab.
- Band page shows members with `showOnPage` who have a musician profile linked.
- Ownerless page claims (trust spec) reuse invites: an admin approves the claim, which creates an OWNER membership.

**PR plan:** 4 PRs.
1. Schema + backfill.
2. Session/JWT + entitlements + call-site refactor, with no UI change. Each user has exactly one membership, so behavior is identical, which makes it safe to release on its own.
3. Switcher + create profile.
4. Members/invites.

### 2.2 Request-to-book pipeline (P1)

```prisma
model BookingRequest {
  id            String   @id @default(cuid())
  fromProfileId String   // MUSICIAN | BAND (active profile)
  toProfileId   String   // VENUE
  sentByUserId  String   // audit: which member sent it
  proposedDate  DateTime?
  altDates      String?  // JSON array of ISO dates (String for portability)
  feeAsk        Int?
  message       String
  status        String   @default("SENT") // SENT|VIEWED|REPLIED|OFFERED|ACCEPTED|DECLINED|WITHDRAWN|EXPIRED
  viewedAt      DateTime?
  respondedAt   DateTime?
  eventId       String?  // set when ACCEPTED → Event (+ EventLineup row)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([toProfileId, status, createdAt])
  @@index([fromProfileId, createdAt])
}
```

- **API:** `POST /api/bookings` checks in fail-fast order: Zod → the target exists and is a VENUE → the sender's active profile is an artist with membership ≥ MEMBER → conflict (an open request to the same venue for the same date returns 409) → **quota**. The quota check comes last so earlier failures never use up allowance. It uses Free `maxSubmissionsPerMonth: 5` (already in `plans.ts`), counted per `fromProfileId` per calendar month in America/New_York, and returns 402 with an upgrade CTA.
- `PATCH /api/bookings/[id]` handles venue reply, offer, decline and accept, plus artist withdraw.
- "Viewed" is set server-side the first time a venue member opens the detail view.
- The thread reuses `Message` with a `bookingRequestId` FK, so there is no second chat system.
- **Accept** creates a draft `Event` hosted by the venue with the artist in `EventLineup` (CONFIRMED), and the venue reviews it before publishing.
- **Anti-spam:** the sender must be verified (continues the trust spec's hard gate), plus a rate limit (DEV-28). A cron expires requests past `proposedDate`.
- **EPK:** v1 is a profile section (press photos from `MediaItem`, rider/stage-plot URLs as links). File upload is out of scope because there is no storage yet.
- **Venue inbox** filters: genre, follower-town overlap (reuses the insights top-towns query), available on a date (`AvailabilityDate`).

### 2.3 Multi-act lineup (P1)

```prisma
model EventLineup {
  id        String  @id @default(cuid())
  eventId   String
  profileId String?  // registered act; null => free-text act
  name      String   // display name (denormalized; required for free-text)
  billing   String   @default("SUPPORT") // HEADLINER | SUPPORT | OPENER | DJ
  sortOrder Int      @default(0)
  setTime   DateTime?
  status    String   @default("CONFIRMED") // PENDING | CONFIRMED | DECLINED
  @@unique([eventId, profileId])
  @@index([profileId, status])
}
```

- **Consent:** tagging a registered profile you don't control creates a PENDING row and sends a notification. Only CONFIRMED rows appear on the act's page. This blocks someone from spoofing a well-known act onto their show. Tagging a profile you are a member of confirms it automatically.
- **Backfill:** one HEADLINER row for every event whose host is MUSICIAN or BAND.
- **Read paths:**
  - Event page shows the lineup as the hero (DICE pattern).
  - `EventCard` shows "+ N more".
  - The profile "Upcoming shows" list is the union of events the profile hosts and events where it has a CONFIRMED lineup row.
  - The home calendar's text search and genre filter also match lineup names.
  - Follower alerts (the future "playing near you" feature) include lineup acts.
- **Editor:** in `EventsManager`, a profile typeahead (`/api/profiles/search?types=MUSICIAN,BAND`) plus free text, with drag order via up/down buttons, which are more accessible than drag and drop.

### 2.4 Page-view tracking

`PageView` (from council) is taken as-is. Hardening (DEV-24):
- Skip bots by user-agent regex and skip `purpose: prefetch` / `next-router-prefetch` headers. **Test that `<Link>` prefetch does not inflate counts** once `loading.tsx` lands.
- Dedupe with a `visitorHash = sha256(ip + ua + dailySalt)`, where the salt rotates daily and is never stored with the raw IP. This is privacy-safe and needs no cookie banner. Add `@@index([targetType, targetId, createdAt])` (already present) and an index on `visitorHash`.
- Retention: a nightly cron rolls rows into `PageViewDaily(targetType, targetId, day, views, uniques)` and deletes raw rows older than 90 days.
- Reads use the daily table plus today's raw rows. `after()` depends on Next 15, which is one more reason to land the upgrade first.

### 2.5 Postgres migrations: move off `db push` before prod data matters

- **Problem:** Prisma migrations are tied to a single provider (`migration_lock.toml`). The current SQLite-dev / Postgres-prod split (`set-db-provider.mjs`) **cannot share a migrations folder**. Council's `db-sync.mjs` runs `db push` on every build, which cannot run a data migration. The multi-role change needs one (rename + backfill).
- **Decision:**
  - Local dev and CI move to **Postgres**: `docker compose` service plus devcontainer feature, and a Postgres service container in GitHub Actions.
  - The zero-key Codespaces demo keeps working using the devcontainer's Postgres.
  - Retire SQLite and simplify `set-db-provider.mjs` to Supabase vs plain URL only.
- **Baseline:**
  - Generate `prisma migrate diff --from-empty --to-schema-datamodel` → `migrations/0_init`.
  - Run `prisma migrate resolve --applied 0_init` on the prod and dev DBs **after** DEV-7 has pushed `PageView`/`digestSentAt`, so the baseline equals the live schema. Verify with `migrate diff --from-url` showing an empty diff.
- **Build:**
  - Prod runs `prisma migrate deploy` with the direct (non-pooled) URL.
  - Previews run `migrate deploy` against their own branch DB (see DEV-13).
  - `db-sync.mjs` / `DB_PUSH_*` are removed.
  - `demo-seed.mjs` switches to `migrate reset --force` against the demo DB only (guarded).
- **CI:** a `prisma migrate diff --exit-code` drift check fails the build if `schema.prisma` changed without a migration.
- **Convention:** migrations are expand → migrate → contract. Never do a destructive change in the same release as the code that stops using the column.

---

## 3. Engineering tickets

Points use the Fibonacci scale, where 1 point is about half a day for one dev. "S" means sprint and assumes 2-week sprints. **Total ≈ 130 pts.** Sprint 0 is about 21 pts and should stay reconciliation and infra only.

| ID | Title | Description | Pts | S | Deps |
| --- | --- | --- | --- | --- | --- |
| **DEV-1** | Branch topology + protection | Make `main` the default. Protect `main` and `dev`: PR required, required `CI / build` check, no force-push or deletes, linear history on `main`. Retarget open PRs to `dev`. | 1 | 0 | — |
| **DEV-2** | Land PR #1 into `dev` | Retarget base to `dev`, run a QA pass on the preview, merge (verified conflict-free). | 1 | 0 | DEV-1 |
| **DEV-3** | Integrate council work via cherry-pick | `integrate/council` off dev. Pick `d2219b3, 6de4051, 343b7df, 3278b44, 705f0d6, 5307775`, **skip `5a82512`**. Resolve artists/venues (radius + verified gate + async searchParams), `p/[slug]`, CLAUDE.md, `package.json` build chain. Archive-tag and delete the council branch. | 5 | 0 | DEV-2 |
| **DEV-4** | Unify insights and analytics | Create `src/lib/insights.ts`, used by both `InsightsCard` and `/dashboard/analytics`. Card shows 30d views and links to the analytics page. Restore the analytics line in the `plans.ts` Pro copy. | 3 | 0 | DEV-3 |
| **DEV-5** | Next 15 / React 19 regression pass | Scripted smoke checklist on the dev preview (4 roles, signup, event CRUD, RSVP, radius search, boost test checkout plus webhook, verify, digest/reminder crons manually, both themes). Fix issues found. | 3 | 0 | DEV-3 |
| **DEV-6** | Seed safety guard | `demo-seed.mjs` refuses to run unless `DEMO_SEED=1` **and** the DB carries a demo marker row (or is empty) **and** the host matches `DEMO_DB_HOST`. Log the target host. Add the same guard to `db:reset`. The union build script runs demo-seed after generate. | 2 | 0 | DEV-3 |
| **DEV-7** | First release `dev → main` | Release PR. Apply additive schema changes (`PageView`, `digestSentAt`) to prod. Set `CRON_SECRET`. Register the digest cron. Tag `v0.3.0`. Rollback plan: Vercel instant rollback. | 2 | 0 | DEV-4,5,6 |
| **DEV-8** | Unit test harness (Vitest) | Add Vitest + tsconfig paths and an `npm test` script in CI. First tests: `plans`, `ct-geo` haversine and resolve, `discovery.rankProfiles`, `validations`, `spotifyEmbedUrl`, `EventArt` family mapping. | 3 | 0–1 | — |
| **DEV-9** | Route-handler integration tests | Postgres test DB per CI job, `vi.mock("@/lib/session")` fixture. Cover events (limits, ownership), rsvp, follow/friend, verify (domain auto-verify), boost, **Stripe webhook with signed fixtures**, reminders/digest idempotency. Assert the fail-fast ordering. | 5 | 1 | DEV-8, DEV-12 |
| **DEV-10** | Playwright e2e smoke in CI | Seeded DB. Flows: signup, each demo login, create event, RSVP, radius search, dark/light toggle, and an axe-core a11y check on 5 key pages (keeps the WCAG AA pass from regressing). | 5 | 1 | DEV-8 |
| **DEV-11** | CI hardening | `prisma validate`, `npm audit --audit-level=high`, migration drift check, test jobs, concurrency cancel, required checks updated. | 2 | 1 | DEV-12 |
| **DEV-12** | Postgres everywhere + `prisma migrate` baseline | Local/CI/devcontainer Postgres. `0_init` baseline marked applied on prod and dev. Build uses `migrate deploy`. Remove `db-sync`/`DB_PUSH_*`. Simplify `set-db-provider`. Update DEPLOYMENT/ENVIRONMENTS docs. | 8 | 1 | DEV-7 |
| **DEV-13** | Isolated preview databases | Per-PR DB branch (Neon/Supabase branching via Vercel integration) so parallel PRs with schema changes can't clobber a shared dev DB. `dev` keeps a stable seeded DB. | 3 | 1 | DEV-12 |
| **DEV-14** | Multi-role schema + backfill | `ProfileMember`, `ProfileInvite`. `Profile.userId → ownerUserId` (nullable, non-unique, SQL rename). `User.lastActiveProfileId`. Backfill OWNER memberships. Seed a multi-role user and ownerless pages. | 5 | 1 | DEV-12 |
| **DEV-15** | Active profile in JWT + session API | `token.activeProfileId` with a DB-validated `update` trigger. `getCurrentUser/getCurrentProfile` shim returns the active profile + role (React `cache()`). `requireProfileRole`. `getEntitlements(profile)` from the billing owner. Types in `next-auth.d.ts`. Tests. | 8 | 2 | DEV-14, DEV-9 |
| **DEV-16** | Refactor session call sites | About 60 files: 41 session-helper files, 10 `where:{userId}`, about 39 `user.profile` refs. Role checks on mutations (MEMBER can't do billing, boost, delete or profile settings). Entitlements replace `user.plan` in events limits, analytics, insights, boost, discovery. No UI change. Can ship on its own. | 8 | 2 | DEV-15 |
| **DEV-17** | "Acting as" switcher + create another profile | Navbar client island (string keys), mobile menu variant, `/dashboard/profiles/new`. Dashboard follows the active profile. a11y: menu button pattern. | 5 | 2 | DEV-15 |
| **DEV-18** | Members tab + invites | Invite by email (hashed token, 7-day expiry, Resend/log mode). Accept for a new or existing account. Change role, remove, leave. Guard against removing the last OWNER. Transfer ownership. Band page members section. | 8 | 2–3 | DEV-16 |
| **DEV-19** | Profile-scoped inbox and notifications | `Message.sender/recipientProfileId`, `Notification.profileId` + backfill. Inbox and badges scoped to the active profile. Fan-out to ADMIN+ members. | 8 | 3 | DEV-16 |
| **DEV-20** | Claim ownerless page via membership | Trust-spec claim flow: request → admin queue → OWNER membership (reuse `/dashboard/admin`). Block claims on known names without verification. | 3 | 3 | DEV-18 |
| **DEV-21** | BookingRequest model + API | Schema, create/list/detail/respond/withdraw, viewed tracking, Free quota (`maxSubmissionsPerMonth`), verified sender, conflict 409, notifications + email, expiry cron. Tests. | 8 | 3 | DEV-16, DEV-9 |
| **DEV-22** | Booking UI: request form, artist pipeline, venue inbox | "Request to book" on venue pages. Artist pipeline (sent → viewed → replied → offered). Venue inbox filters (genre, draw towns, availability). Accept → draft event with lineup. EPK v1 section. | 8 | 4 | DEV-21, DEV-23 |
| **DEV-23** | EventLineup | Schema + host backfill. Lineup editor with profile typeahead + free text. PENDING/CONFIRMED consent. Render on event page, cards and performer profiles. Calendar search matches lineup. | 8 | 3 | DEV-12 (DEV-16 for "member auto-confirm") |
| **DEV-24** | PageView hardening + rollup | Bot/prefetch filter, salted daily visitor hash, `PageViewDaily` rollup cron + 90-day raw retention, tests. | 3 | 2 | DEV-3, DEV-12 |
| **DEV-25** | "Trending in CT" strip | RSVPs in the last 7 days, ranked, cached (`unstable_cache`, 15-min revalidate). Home page strip. | 3 | 4 | DEV-23 (lineup-aware) |
| **DEV-26** | `loading.tsx` / `error.tsx` boundaries | Skeletons for home, artists, venues, event, profile and dashboard. Friendly error boundaries plus `not-found`. | 2 | 4 | DEV-24 (prefetch check) |
| **DEV-27** | Observability + fail-closed crons | Sentry (or equivalent) for server, route and webhook errors. Structured logs in webhook and crons. In `NODE_ENV=production`, cron endpoints **fail closed** if `CRON_SECRET` is missing (dev fallback kept). | 3 | 1 | — |
| **DEV-28** | Rate limiting | Login, signup, forgot-password, messages, share, booking requests. Postgres-backed token bucket, or Upstash if we add it. | 3 | 3 | DEV-12 |
| **DEV-29** | Stripe hardening | Webhook idempotency (`StripeEvent` processed-id table). Entitlement cutover for multi-profile. Test-mode e2e for subscribe, cancel and boost. | 3 | 2 | DEV-15 |
| **DEV-30** | Docs + workflow | Update CLAUDE.md workflow (feature → dev → main, no fixed dev branch name), rewrite ENVIRONMENTS.md for the dev-branch model, PR template with a checklist (build/tsc/lint/tests, schema change, a11y), CODEOWNERS for `prisma/` and `src/lib/auth*`. | 1 | 0 | DEV-1 |

**Per-sprint load:** S0 ≈ 21 (DEV-1–8, 30) · S1 ≈ 31 (9–14, 27) · S2 ≈ 31 (15–17, 24, 29, about half of 18) · S3 ≈ 34 (rest of 18, 19–21, 23, 28) · S4 ≈ 13 (22, 25, 26), leaving slack for carryover.

**Critical path:** DEV-3 → 7 → 12 → 14 → 15 → 16 → {17, 18, 21} → 22.

---

## 4. Risks

| # | Risk | Likelihood / impact | Mitigation |
| --- | --- | --- | --- |
| R1 | **Merging the council branch wholesale** (60 hunks) silently reverts PR #1 UX or keeps both icon systems | High / Med | Cherry-pick plan without `5a82512` (DEV-3). Archive-tag and delete the branch. Reviewer diffs icon usage afterwards. |
| R2 | **The demo-seed build step wipes a real DB.** It runs `db push --accept-data-loss` + reseed whenever `DEMO_SEED=1`, and it reaches `main` with the first release. The demo project deploys with `--prod`, so `VERCEL_ENV` can't tell the two apart. | Low / **Critical** | DEV-6 guard (marker row + host allowlist) **before** DEV-7. Separate Vercel project and DB for the demo. |
| R3 | Next 15 / React 19 regressions in untested paths (no automated tests today) | Med / Med | DEV-5 checklist. DEV-8/10 before the big auth refactor. Hotfix path (`343b7df` alone onto main). |
| R4 | **Multi-role refactor breaks authorization** (a MEMBER can reach billing, or a stale JWT keeps access) | Med / High | Validate membership on every request, never trust the JWT alone. `requireProfileRole` in the fail-fast chain. Integration tests (DEV-9) are a hard prerequisite for DEV-15. Ship the refactor with a single membership per user first (no behavior change). |
| R5 | `db push` can't do the `userId → ownerUserId` rename and backfill, so data loss or a failed deploy | High if skipped / High | DEV-12 before DEV-14. Expand/contract migrations. `migrate diff` against a prod snapshot first. |
| R6 | Shared dev DB with `DB_PUSH_ON_BUILD` on every preview: parallel schema PRs overwrite each other | Med / Med | DEV-13 per-PR DB branches. Drop `DB_PUSH_ACCEPT_DATA_LOSS`. |
| R7 | Entitlement semantics are ambiguous (per-user vs per-profile Pro), so disputes or revenue leakage | Med / Med | PO decision before DEV-15. Centralize the rule in `getEntitlements()` so it can change in one place. |
| R8 | Booking requests become a spam channel | Med / Med | Verified-sender gate, Free quota, rate limiting (DEV-28), venue "block" action. |
| R9 | Lineup tagging used to impersonate acts | Med / Med | PENDING until the act confirms. Only CONFIRMED rows show on the act's page. |
| R10 | Page-view counts inflated by bots or prefetch, which makes Pro analytics look wrong | Med / Low-Med | DEV-24 filters, test with prefetch, show "unique visitors" as the headline number. |
| R11 | next-auth v4 in maintenance mode, and the new JWT shape makes an Auth.js v5 move harder later | Low / Med | Keep all session access behind `src/lib/session.ts`. Schedule the v5 evaluation after multi-role is stable (not in this plan). |
| R12 | Branch-protection gaps (direct pushes to `main`, agents pushing to the wrong base) | Med / Med | DEV-1 + DEV-30 (CLAUDE.md branch rules, CODEOWNERS). |
