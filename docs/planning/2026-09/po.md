# BandConnect: Product backlog, Sprints 0–4 (Product Owner)

Written 2026-09-24. Sources: `docs/UX_REVIEW_2026-09.md` (main input), `ROADMAP.md`,
`MONETIZATION.md`, `GTM.md`, `launch/trust-and-verification.md`, PR #1
(`claude/band-connect-ux-review-0x6wu0`), the unmerged `claude/stack-review-council-d88sez`
branch, and `origin/dev`.

**Sprint length:** 2 weeks. **North Star (GTM §7):** weekly RSVPs. **Beachhead:** New Haven.

---

## 0. Sequencing rationale (why this order)

1. **Reconcile before building (Sprint 0).** Three lines of work have diverged from `main`:
   - PR #1: the UX review, with Lucide icons, radius search and a plan-derived Featured flag.
   - `stack-review-council`, which overlaps it:
     - Lucide icons again
     - `PageView` Pro analytics
     - the booking-search verification gate
     - Spotify embeds
     - the weekly digest
     - Next 15 / React 19 plus the audit fixes
     - the env-promotion flow
   - `dev`: the seeded demo deploy.

   Multi-role touches `auth`, `session` and every `getCurrentProfile` caller. Building it on top of three unmerged branches guarantees painful conflicts. So Sprint 0 merges first and makes one call on each overlap. Several backlog items (page views, digest, booking gate) then come **for free**, because they are already built.
2. **Multi-role + team members comes first (Sprint 1, P0).** It is the structural gap: `Profile.userId @unique` means one login = one role. Several later items depend on it:
   - claiming seeded pages (an invite becomes a claim)
   - band co-management (so pages don't go stale)
   - request-to-book (a musician in a band books *as the band*)
   - the venue inbox (a talent buyer and an owner share it)
   - lineups (tag a band, and its members see it)

   Building those first would mean rewriting them later.
3. **Supply conversion + fan discovery next (Sprint 2).** GTM Phase 2 ("claim your free page", the venue conversion sprint) depends on **claiming ownerless seeded pages**. That item is GTM backlog #1 and the linchpin of concierge seeding. The same sprint ships the fan-side "calendar feels alive" work: hero search, the Trending strip, followed-artist alerts and multi-act lineups. These are the cheapest levers on the North Star.
4. **Pro revenue package (Sprint 3).** For artists this means the EPK, request-to-book with a tracked pipeline, and a monthly boost credit. It relies on multi-role (acting as the band) and on verification (only verified pages are bookable). These are Pro's biggest missing reasons to pay. They land together so the pricing page gets one coherent update.
5. **The venue side of the marketplace + insights depth (Sprint 4).** This covers the booking inbox with filters, "offer a date", RSVP→attendance insights and CSV export. It needs Sprint 3's request data to be useful. It also closes the loop for venues, which are the side with budget.

---

## 1. Product goals, sprint goals and success metrics

| Sprint | Goal (one line) | Success metrics (exit) |
| --- | --- | --- |
| **S0: Stabilize & reconcile** | Get to one green `main` that contains PR #1 + the keepers from the parallel branch, with the seeded demo deployed and funnel analytics live. | Zero open divergent feature branches. CI (build/tsc/lint) green on `main`. Demo URL live with all 4 roles. Page-view + signup-by-role + RSVP events are recorded (baseline dashboard exists). Multi-role spec signed off. |
| **S1: One login, many hats** | Any user can own or join several profiles and switch between them. Bands and venues can invite members. | ≥90% of existing accounts migrated with no login regressions (0 P0 auth bugs). In the demo/beta cohort, ≥30% of band profiles have ≥2 members within 2 weeks. Time to switch profile < 2 clicks. |
| **S2: Claim & discover** | Convert seeded placeholder pages into claimed, verified accounts, and make the home page answer "what's on near me" instantly. | ≥40% of contacted seeded venues claimed (GTM venue-sprint target). Hero-search usage ≥35% of home sessions. Trending strip CTR ≥8%. Followed-artist alert emails reach ≥25% open. Weekly RSVPs +20% vs the S0 baseline. |
| **S3: Get booked (Pro for artists)** | Artists can send a pro EPK and a tracked booking request to a venue, and Pro includes a monthly boost. | ≥50 booking requests sent in the beachhead. ≥20% of requests reach "replied". Free→Pro conversion among artists ≥3% (vs baseline). ≥60% of Pro users redeem their boost credit. |
| **S4: Venue booking inbox + insights** | Venues triage requests by genre, draw and date, and offer dates in one click. Pro insights prove the ROI. | Median venue response time to a request < 72h. ≥15 "offer a date" actions → confirmed events. Pro churn at month 1 < 10%. ≥30% of Pro hosts open Analytics weekly. |

---

## 2. Epics

| ID | Epic | Sprints |
| --- | --- | --- |
| **E0** | Platform stabilization & branch reconciliation | S0 |
| **E1** | Multi-role accounts & team access | S1 (S2 tail) |
| **E2** | Trust: claim ownerless pages + verification gating | S0 (gate), S2 |
| **E3** | Fan discovery & re-engagement (hero search, trending, lineups, alerts) | S2 |
| **E4** | Artist booking tools: EPK + request-to-book (Pro) | S3 |
| **E5** | Venue booking inbox | S4 |
| **E6** | Pro value & monetization (boost credit, analytics, pricing copy) | S0, S3, S4 |

---

## 3. User stories

### Sprint 0: Stabilize & reconcile (E0, E2, E6)

**PO-1 · Merge PR #1 (UX review) to main** · E0 · P0 · S0 · Deps: none
*As the product owner I want the UX-review fixes on `main` so that every later sprint builds on the corrected Pro promise, radius search and icon set.*
- Given PR #1 is rebased on `main`, when CI runs, then build, tsc and lint pass.
- Given a Pro upgrade via the Stripe webhook, when I view `/artists`, then the profile shows ★ Featured without anyone editing the seed.
- Given the pricing page, when I read the Pro features, then every listed feature exists in the product.
- Given 390px mobile in light and dark, when I tour the four roles, then there is no contrast or overflow regression (WCAG 2.1 AA).

**PO-2 · Reconcile the parallel `stack-review-council` branch** · E0 · P0 · S0 · Deps: PO-1
*As the product owner I want one decision on each overlapping change so that we don't ship two icon systems or two analytics models.*
- Given the overlap list below, when reconciliation is done, then each item is marked **adopt / drop / defer** in the sprint notes:
  - Lucide icons: PR #1 wins, because it is newer and covers ~90 emoji.
  - `PageView` + `/dashboard/analytics`: adopt.
  - Booking-search verified gate: adopt.
  - Spotify embeds: adopt.
  - Weekly digest: adopt.
  - Next 15 / React 19: adopt only if Dev confirms the risk is low, otherwise the first story of S1.
  - Env-promotion docs: adopt.
- Given the adopted items are merged, when CI runs on `main`, then everything is green and `npm audit` shows no high or critical findings.
- Given the Insights card (PR #1) and the Analytics page (parallel branch), when a Pro host opens the dashboard, then they see one coherent analytics entry point, not two conflicting ones.
- Given the reconciliation is complete, then the stale branch is closed and CLAUDE.md "Status" matches reality.

**PO-3 · Seeded demo deploy on the reconciled main** · E0 · P1 · S0 · Deps: PO-2
*As a founder doing outreach I want a live seeded demo so that I can show venues and bands the product during the GTM pre-launch.*
- Given `origin/dev` holds the demo-deploy setup, when it is rebased onto the new `main`, then the demo deploys with seed data for all 4 roles.
- Given no Stripe or Resend keys, when a demo user upgrades or triggers email, then the demo-billing and email-log fallbacks work (no crash).
- Given the demo URL, when shared, then the demo logins in CLAUDE.md work.

**PO-4 · Funnel instrumentation baseline** · E6 · P1 · S0 · Deps: PO-2 (PageView)
*As the product owner I want visit → signup (by role) → activated → W2 retained and weekly RSVPs measured so that every sprint's metrics have a baseline.*
- Given the PageView model is adopted, when a non-owner views a profile or event page, then a view is recorded without blocking render.
- Given an admin, when they open `/dashboard/admin`, then they see weekly signups by role, the activation %, weekly RSVPs and the liquidity ratio (% of town searches returning ≥5 upcoming events).
- Given bots or the owner viewing their own page, then those views are excluded.

**PO-5 · Multi-role spec & migration plan (design only)** · E1 · P0 · S0 · Deps: none
*As the team I want an approved spec for `ProfileMember` + the active-profile session before coding so that S1 is not redesigned mid-sprint.*
- Given the UX review §3 model, when the spec is written, then it defines:
  - `ProfileMember { userId, profileId, role: OWNER|ADMIN|MEMBER }`
  - the fate of `Profile.userId` (becomes creator-only / optional)
  - the implicit fan identity
  - an `activeProfileId` in the JWT
- Given the current `Message` and `Notification` models are keyed on User, when the spec is written, then it states who a message to a band goes to (profile-addressed vs user) and who gets notifications.
- Given every `getCurrentProfile` caller, then the spec lists them and states the permission check each one needs (owner/admin/member).
- Given existing data, then the spec includes a backfill: one OWNER membership per existing profile.

### Sprint 1: One login, many hats (E1)

**PO-6 · Data model: one user, many profiles** · E1 · P0 · S1 · Deps: PO-5
*As a guitarist who plays in a band and books a bar I want one login for all my profiles so that I don't need three emails.*
- Given an existing account, when the migration runs, then it gets an OWNER membership on its profile and still logs in and sees the same dashboard.
- Given a user with 2+ memberships, when they log in, then their last active profile is restored.
- Given SQLite dev and Postgres prod, when the schema is pushed, then both work (String roles, no enums).
- Given a user removed from a profile, when they try to edit it, then the API returns 403.

**PO-7 · "Acting as" profile switcher** · E1 · P0 · S1 · Deps: PO-6
*As a multi-role user I want to switch the active profile from the navbar so that I post, follow and message as the right identity.*
- Given 2+ profiles, when I open the navbar menu, then I see "Acting as ▾" with each profile (name, type icon, role).
- When I pick a profile, then the dashboard, Post-event, and follow/RSVP/message actions use that profile, and a toast confirms the switch.
- Given a single profile, then the switcher shows only "Create another profile".
- Given keyboard/screen-reader users, then the switcher is a labelled, focus-managed menu (WCAG AA).

**PO-8 · Create another profile** · E1 · P0 · S1 · Deps: PO-6
*As a fan who starts a band I want to add a Band/Venue/Musician profile to my account so that I don't have to sign up again.*
- Given I'm logged in, when I choose "Create another profile" and pick a type, then I get the type-specific onboarding checklist for the new profile.
- Given every user, then they keep an implicit fan identity for RSVPs and follows even without a FAN profile.
- Given I try to create a second profile with a slug that's already taken, then I see a labelled inline error (`role="alert"`).

**PO-9 · Band/venue Members tab: invite by email** · E1 · P0 · S1 · Deps: PO-6
*As a band leader I want to invite bandmates by email with a role so that anyone in the band can post the gig and the page doesn't go stale.*
- Given I'm OWNER/ADMIN, when I invite an email with a role, then an invite email is sent (or logged in email-log mode) with a single-use expiring link.
- Given the invitee has no account, when they accept, then they sign up and join in one flow.
- Given MEMBER role, when they try to change billing or remove members, then it's blocked; they can post and edit events.
- Given the last OWNER, when they try to leave or demote themselves, then it's blocked until another OWNER exists.

**PO-10 · Band page shows its members** · E1 · P1 · S1 · Deps: PO-9
*As a fan I want to see who's in the band, with links to their musician pages, so that I can discover side projects.*
- Given a band whose members have musician profiles, when I view `/p/[band]`, then a Members section lists them with links.
- Given a member without a musician profile, then they're listed by display name only, or hidden if they opted out.
- Given a musician page, then it shows "Plays in: <band>" back-links.

### Sprint 2: Claim & discover (E2, E3)

**PO-11 · Claim an ownerless seeded page** · E2 · P0 · S2 · Deps: PO-6, PO-9, shipped verification
*As a venue owner I want to claim the page BandConnect pre-filled with my shows so that I control it without re-entering everything.*
- Given a concierge-seeded page with no OWNER, when I view it, then I see "Is this your venue? Claim this page".
- When I claim with an email whose domain matches the page's website, then I become OWNER and the page is marked verified (rung 1).
- Given no domain match, then the claim goes to the admin queue as pending, and the page stays public but unmanaged.
- Given a claimed page, then the seeded events move with it, and the claimer gets a "You already have N shows listed" welcome.

**PO-12 · Admin: create ownerless pages + send claim invites** · E2 · P1 · S2 · Deps: PO-11
*As the GTM operator I want to create placeholder pages and send "claim your page" links so that I can run the venue conversion sprint from the outreach tracker.*
- Given an admin, when they create a venue/band page without an owner, then it's public and flagged "unclaimed".
- When the admin sends a claim invite, then the link routes to the PO-11 flow, and accepting it counts as rung-3 verification.
- Given the outreach tracker, then the admin view shows each unclaimed page's status (invited / claimed / verified).

**PO-13 · Hero search above the fold** · E3 · P1 · S2 · Deps: none
*As a fan landing on the home page I want "Find shows near [town]" as the first thing I see so that I get relevant results in one step.*
- Given the home page on desktop and 390px mobile, then a town/ZIP field (with autocomplete and "use my location") plus a date chip sit in the hero, above the fold.
- When I submit, then the calendar below filters to that radius and the URL is shareable (`?near=…`).
- Given a returning visitor, then my last town is prefilled (browser storage, with graceful failure).
- Given the old filter card, then it collapses into "More filters", so there's no duplicate state.

**PO-14 · "Trending in CT" strip** · E3 · P1 · S2 · Deps: PO-4 (optional)
*As a fan I want to see what's popular this week so that I can find the shows my scene is going to.*
- Given upcoming events, when the home page loads, then a horizontal strip shows the top ~8 by RSVPs in the last 7 days, scoped to my radius if one is set.
- Given fewer than 3 qualifying events, then the strip is hidden (no empty state on launch).
- Given boosted events, then they're labelled ★ Featured, never mixed in unlabelled.
- Given mobile, then the strip scrolls horizontally with keyboard access.

**PO-15 · Followed artist playing near you (alert)** · E3 · P1 · S2 · Deps: none; shares the digest from PO-2
*As a fan who follows a band I want an alert when they post a show within my radius so that I never miss them.*
- Given I follow a profile and have a home town and radius, when that profile (or a lineup it's on, PO-16) posts an event inside my radius, then I get an in-app notification and an email (respecting prefs).
- Given an event outside my radius, then no alert is sent.
- Given many follows, then there's at most one email per day (batched), and a one-click unsubscribe per type.
- Given no `RESEND_API_KEY`, then emails are logged, not sent.

**PO-16 · Multi-act lineups on events** · E3 · P1 · S2 · Deps: PO-6 (so all members see tags)
*As a venue posting a 3-band bill I want to tag each act's profile so that the event shows up on every act's page and their followers find it.*
- Given I create or edit an event, when I add acts (profile search or free-text for off-platform acts), then I can order them and mark a headliner.
- Given a tagged act, then the event appears in its profile's Events list, and its members get a "You were added to a lineup" notification with a "Remove me" option.
- Given the event page, then the lineup is the hero (DICE pattern), each act links to its profile, and JSON-LD `performer` lists all acts.
- Given calendar search by artist name, then it matches any act in the lineup.

**PO-17 · Unverified name-claim protection** · E2 · P2 · S2 · Deps: PO-11
*As a verified band I want squatters blocked from creating a page with my exact name so that fans aren't misled.*
- Given a verified or seeded "known" page, when someone creates a profile with the same normalized name + type, then they're told it exists and pointed to claim or report.
- Given a Report on a profile, then it lands in the admin queue, and resolution favors the party that can verify.

### Sprint 3: Get booked (E4, E6)

**PO-18 · Electronic press kit (EPK)** · E4 · P1 · S3 · Deps: PO-6
*As a band I want a shareable EPK (bio, press photos, stage plot, tech rider, links, draw stats) so that venues can evaluate me without an email chain.*
- Given a Band/Musician profile, when I edit the EPK tab, then I can add a short bio, 3+ press photos, stage plot and rider (URL/PDF), and streaming links (the Spotify embed is reused).
- Given Pro, then the EPK includes live draw stats from Insights (followers by town, average RSVPs). Free shows a locked teaser.
- Given the public URL `/p/[slug]/epk`, then it's print-friendly and has an OG image.
- Given any member with ADMIN+ role, then they can edit it.

**PO-19 · Request to book (artist → venue)** · E4 · P1 · S3 · Deps: PO-18, PO-7, verification gate (PO-2)
*As an artist I want to send a booking request from a venue's page, with dates and my EPK attached, so that booking happens in the product, not in lost DMs.*
- Given I'm acting as a verified band/musician, when I click "Request to book" on a venue page, then I choose 1–3 dates (my open availability dates are suggested), write a note, and the EPK attaches automatically.
- Given Free plan, when I've sent 5 requests this month (`maxSubmissionsPerMonth`), then I'm blocked with a Pro upsell; Pro is unlimited.
- Given an unverified artist, then the button explains that verification is required and links to self-serve verification.
- Given the venue, then all its OWNER/ADMIN members are notified (in-app + email).

**PO-20 · Tracked booking pipeline for artists** · E4 · P1 · S3 · Deps: PO-19
*As an artist I want to see each request's status (sent → viewed → replied → offered/declined) so that I know where to follow up.*
- Given a sent request, when a venue member opens it, then its status flips to "viewed" with a timestamp.
- Given replies, then the request thread is visible to both sides, and status updates automatically.
- Given my dashboard, then a "Bookings" view lists requests by status with filters.
- Given no activity for 7 days, then I get a nudge to follow up (optional reminder).

**PO-21 · Pro monthly boost credit** · E6 · P1 · S3 · Deps: shipped boosts
*As a Pro subscriber I want one free event boost each month so that Pro visibly pays for itself.*
- Given an active Pro plan, when a new billing month starts, then 1 boost credit is granted; unused credits don't roll over.
- Given a credit is available, when I click ★ Boost, then it activates immediately with no Checkout; otherwise the paid $10 flow runs.
- Given `plans.ts`, then the credit count is configured there (single source of truth), and the pricing page lists it.
- Given demo billing mode, then the credit flow works without Stripe.

**PO-22 · Pricing page & Pro pitch refresh** · E6 · P1 · S3 · Deps: PO-18–21
*As a prospective Pro artist I want the pricing page to show booking tools, EPK draw stats, analytics and the boost credit so that the $12/mo is an easy yes.*
- Given `plans.ts`, then every listed Pro feature maps to a shipped, gated capability (no phantom features).
- Given Free users who hit a gate (the 5-request cap, a locked EPK stat, analytics), then the upsell copy names that specific benefit and links to billing with the annual rate shown.
- Given fans, then the page still says "free, always".

### Sprint 4: Venue booking inbox + insights (E5, E6)

**PO-23 · Venue booking inbox** · E5 · P1 · S4 · Deps: PO-19, PO-20
*As a talent buyer I want all booking requests in one inbox shared with my co-workers so that nothing falls through and we don't double-book.*
- Given a venue with 2+ members, when requests arrive, then every OWNER/ADMIN sees the same inbox with read state and an assignee.
- Given the inbox, when I filter by genre, requested date and draw (followers within N mi of the venue), then results update, sortable by draw.
- Given a request, when I archive or decline with a canned reply, then the artist's pipeline status updates.
- Given 390px mobile, then the inbox is usable (a list → detail pattern).

**PO-24 · One-click "Offer a date"** · E5 · P1 · S4 · Deps: PO-23
*As a venue I want to offer an artist a date that is open for both of us so that a booking becomes a calendar event in one step.*
- Given a request or an artist profile, when I click "Offer a date", then I see dates where the artist is available and the venue has no event.
- When the artist accepts, then a draft event is created with the venue + artist on the lineup (PO-16), and both sides' members are notified.
- Given the artist declines or 7 days pass, then the offer expires, and the availability date is released.

**PO-25 · Insights v2: attendance funnel + follower CSV export (Pro)** · E6 · P2 · S4 · Deps: PO-4
*As a Pro host I want views → RSVPs → attended per show and an export of opted-in followers so that I can prove draw when pitching.*
- Given a past event, when I open Analytics, then I see views, Going/Maybe and optional attendance (a door count I enter).
- Given followers who opted in to share contact, when I export CSV, then only opted-in fields are included (privacy default: off).
- Given a Free plan, then a locked teaser is shown.

**PO-26 · "Notify my followers nearby" announcement** · E3/E6 · P2 · S4 · Deps: PO-15
*As a band I want to announce a new show to followers within 25 mi so that I fill the room.*
- Given I post an event, when I choose "Announce", then followers within 25 mi get an in-app + email notice.
- Given plan caps (Free 1/month, Pro 4/month, configured in `plans.ts`), when I exceed them, then I see an upsell.
- Given a follower who muted announcements, then they're excluded.

---

## 4. Out of scope / parked

| Item | Why parked | Revisit when |
| --- | --- | --- |
| **Fan Plus ($3/mo)** presale/guest list | Needs venue supply first; the core fan experience stays free. | 20+ active venues opt in to presales |
| **Fan-club subscriptions** (artist → fan) | Needs fan density. | ~10k fans |
| **Native ticketing / payments / booking fee** | We take no booking cut (positioning), and it's heavy infra. | After the booking pipeline proves volume |
| **Paid opportunity submissions** (Sonicbids-style fee) | "Pay-to-play" optics; the Free-plan cap (PO-19) tests demand first. | After S3 metrics |
| **Selling the Verified badge** | Rejected in MONETIZATION §4. | Never |
| **Social link-back (rung 2) automation, SMS OTP, web-of-trust** | Manual review covers launch volume. | Abuse or volume shows up |
| **Venue ↔ artist reviews** | Needs completed bookings; risk of abuse. | After PO-24 produces real gigs |
| **Past-show recaps, profile tabs** (Phase 2 remainder) | Lower leverage than claim, discovery and booking. | S5+ |
| **Image/video uploads (S3/UploadThing), Google OAuth, email verification** | Phase 4 hardening. Schedule before the Hartford expansion, or earlier if spam appears. | Before opening a second metro |
| **PostGIS / geo at scale, ISR** | JS haversine is fine at beachhead scale. | More than ~5k events |
| **Mobile app, multi-region, embeddable widget, bulk import** | Cross-cutting bets. Bulk import is the strongest candidate for S5 (seeding speed). | S5 planning |
| **Framework upgrade (Next 15 / React 19)** | In scope *only* as the S0 reconciliation decision (PO-2). Otherwise no stack churn (see STACK_REVIEW). | Only if S0 defers it |
| **Profile-addressed messaging redesign** | Beyond what the PO-5 spec decides (the minimum needed for multi-role), a full inbox-per-profile rework is parked. | After S1 feedback |
