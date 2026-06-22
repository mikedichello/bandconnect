# BandConnect — Product & Technical Plan

## 1. The problem

Booking local shows is a mess of Instagram DMs, dead email threads, and
word-of-mouth. Bands don't know which venues are taking submissions; venues
don't know which local acts are active and any good. There's no shared,
structured place for the local live-music market to meet.

## 2. The product

**BandConnect is a two-sided marketplace + lightweight site builder for the
local music scene.**

- **Bands** get a polished one-page site, a show calendar, and tools to find
  and pitch venues.
- **Venues** get a one-page site, a show calendar, and tools to find bands and
  manage incoming booking requests.
- **Both sides** talk through a built-in messaging inbox and a simple
  submission → accept/decline booking workflow.

The single-page profile is the hook (it replaces the "we need a website"
problem), and the marketplace is the retention loop (discovery + messaging +
bookings).

### Primary user journeys

1. **Band onboarding:** sign up → profile auto-created → fill in bio, genres,
   links → publish → appears in discovery.
2. **Venue onboarding:** sign up → set capacity, genres booked, "accepting
   submissions" → appears in discovery.
3. **Booking (band-initiated):** band browses venues → opens a venue page →
   "Submit to play" with a pitch + proposed date → venue sees it in their
   booking inbox → accepts/declines → both message to finalize.
4. **Promotion:** either side adds shows to their calendar → shows appear on
   their public page and in the global `/shows` feed.

## 3. Monetization

A simple, honest **subscription** model — no cut of bookings, no ticket fees.

| | Starter (Free) | Pro ($12/mo or $120/yr) |
| --- | --- | --- |
| Public profile & discovery | ✅ | ✅ |
| Messaging | ✅ | ✅ |
| Upcoming shows | 3 | Unlimited |
| Booking submissions | 5 / month | Unlimited |
| Custom theme color & branding | — | ✅ |
| Featured placement in discovery | — | ✅ |
| Analytics | — | ✅ |
| Remove BandConnect branding | — | ✅ |

Plans live in `src/lib/plans.ts` as the single source of truth for both pricing
display and **server-side feature-gating**. Limits are enforced in the API
(e.g. `POST /api/events` returns `402 PLAN_LIMIT` past the free cap), never just
hidden in the UI.

Billing runs on **Stripe Checkout** for subscribe and the **Billing Portal** for
self-service management/cancellation. A **signature-verified webhook** keeps each
user's `plan` in sync with Stripe. With no Stripe keys set, the app runs in
"demo billing" mode so it's fully usable without a payment account.

## 4. Architecture

A single **Next.js (App Router)** application — frontend and backend in one
deployable unit, which is what makes "easy to deploy" real.

```
            ┌─────────────────────────── Next.js app ───────────────────────────┐
 Browser ──▶│  Server Components (pages)      Route Handlers (/api/*)             │
            │  - render profiles, lists       - auth/signup, profile, events,     │
            │  - read via Prisma              submissions, messages, stripe/*     │
            │  Client Components               │                                  │
            │  - forms, inbox, dialogs ──fetch─┘                                  │
            └───────────────┬───────────────────────────────┬────────────────────┘
                            │ Prisma                         │ Stripe SDK
                     ┌──────▼──────┐                  ┌──────▼──────┐
                     │  Database   │                  │   Stripe    │
                     │ SQLite/PG   │◀── webhook ──────│  (billing)  │
                     └─────────────┘                  └─────────────┘
```

- **Rendering:** public pages are server-rendered for SEO (profiles ship
  `generateMetadata`); interactive surfaces (inbox, profile editor, dialogs) are
  client components that call JSON route handlers.
- **Auth:** NextAuth credentials provider with JWT sessions. `role` and `plan`
  are embedded in the token so gating needs no extra DB reads; the token
  refreshes plan from the DB on `update` (after an upgrade).
- **Validation:** every mutating route parses its body with a Zod schema from
  `src/lib/validations.ts` before touching the database.
- **DB portability:** enum-like fields are modeled as `String` so the same
  schema runs on SQLite (dev) and Postgres (prod) with only a one-line provider
  change.

## 5. Data model

See `prisma/schema.prisma`. Core entities:

- **User** — auth + billing (`role`, `plan`, `stripeCustomerId`,
  `stripeSubscriptionId`, `planStatus`, `planRenewsAt`). Has one `BandProfile`
  *or* one `VenueProfile`.
- **BandProfile / VenueProfile** — the public single-page site (name, slug, bio,
  genres, city, links, images, availability flag, `themeColor`, `featured`).
- **Event** — a show on a calendar, owned by a user and optionally linked to a
  band/venue profile; `isPublic` controls feed visibility.
- **Submission** — a band→venue booking pitch with `status`
  (PENDING/ACCEPTED/DECLINED) and an optional proposed date.
- **Message** — a direct message between two users; conversations are derived by
  grouping on the other participant; `readAt` drives unread badges.

```
User 1───1 BandProfile 1───* Submission *───1 VenueProfile 1───1 User
  │                                                                 │
  └──* Event                                              Event *───┘
  └──* Message (sender / recipient) ─────────────────────────┘
```

## 6. Security

- bcrypt password hashing (cost 12); credentials checked in `authorize()`.
- Server-side authorization on every route (auth + record ownership) — e.g. you
  can only delete your own events, only the addressed venue can change a
  submission's status.
- Zod input validation; emails normalized/lower-cased; unique constraints on
  email and profile slugs.
- Stripe webhook signature verification before any write.
- Secrets via environment variables only; `.env` is gitignored.

## 7. Build status

Implemented and verified end-to-end (auth, profiles, discovery, calendars,
submissions, messaging, plan limits, Stripe checkout/portal/webhook, demo
billing fallback). The production build compiles all routes; the public pages,
auth flow, authenticated APIs, and free-tier limits were exercised against a
running server.

## 8. Roadmap

**Near-term**
- Image uploads (S3/UploadThing) instead of URL fields.
- Email notifications (new submission, accepted, new message) via Resend.
- OAuth providers (Google) alongside credentials.
- Calendar export (`.ics`) and embeddable show widget.

**Mid-term**
- Availability calendar for venues (open dates) and date-aware matching.
- Reviews/ratings after a played show; "played here before" history.
- Saved searches + email alerts for new matching bands/venues.
- Real-time messaging (WebSockets) and typing/read receipts.

**Later**
- Ticketing integration and optional payments/deposits.
- Multi-member band accounts and venue teams (roles/permissions).
- Maps-based discovery and regional "scene" pages.
- Mobile apps (React Native) sharing the same API.
