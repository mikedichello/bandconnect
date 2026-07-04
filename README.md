# BandConnect

The calendar for Connecticut's live-music scene. Every show in the state in one
place: fans discover and RSVP to gigs; venues, musicians, and bands build
profiles, post events, message each other, and get booked. Free tier plus a Pro
subscription (Stripe), with paid event boosts for promoted calendar placement.

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [External services](#external-services)
- [Getting started (dev)](#getting-started-dev)
- [Scripts](#scripts)
- [Environment variables](#environment-variables)
- [API endpoints](#api-endpoints)
- [Scheduled jobs](#scheduled-jobs)
- [Deployment](#deployment)
- [Docs](#docs)
- [TODO](#todo)

## Features

- **Calendar-first home page** — every CT event in list or month view, with
  date quick-filters (Tonight / Weekend / Week), town/ZIP + radius search
  (built-in geocode table, no external API), genre / family-friendly /
  no-cover filters, and a personalized Following feed.
- **Four profile types** on one social graph — Fan, Venue, Musician, Band —
  with follows, fan-to-fan friendships, RSVPs, messaging, notifications, and
  saved-search alerts ("tell me when a punk show is booked near Hartford").
- **Events** with photo/video covers, add-to-calendar (Google + `.ics`),
  schema.org `MusicEvent` JSON-LD, sitemap, and pre-show email reminders.
- **Artist booking surface** — availability calendars, rate ranges, seeking
  status (join/start a band, fill-ins, needs musicians); booking-intent
  searches only surface **verified** profiles.
- **Trust & verification** — self-serve page claims with email-domain
  auto-verify, an admin review queue, and a Verified badge across the app.
- **Monetization** — Pro subscription ($12/mo or $120/yr) with feature gating
  in `src/lib/plans.ts` (unlimited events, featured placement, custom theme,
  analytics), plus one-time **event boosts** for pinned calendar placement.
- **Pro analytics** — profile/event page views, follower growth, and a
  per-event views → RSVP conversion funnel.
- **Light/dark theme** (dark default), WCAG 2.1 AA accessibility pass, weekly
  digest email, responsive throughout.

## Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) + React 19 | Server components read data; client islands handle interactivity |
| Language | TypeScript 5 | `npx tsc --noEmit` is part of the quality gate |
| ORM / DB | Prisma 5 · SQLite (dev) / Postgres (prod) | Provider auto-switches at build time (`scripts/set-db-provider.mjs`) |
| Auth | NextAuth v4 (credentials + JWT, bcrypt) | Session helpers in `src/lib/session.ts` |
| Payments | Stripe | Pro subscriptions (monthly/yearly) + one-time event boosts |
| Email | Resend (HTTP API, no SDK) | Welcome, password reset, event reminders, weekly digest |
| Styling | Tailwind CSS 3 + semantic CSS-var tokens | Dark default, `.light` alt palette; WCAG 2.1 AA (see `docs/ADA_AUDIT.md`) |
| Icons | lucide-react | The only icon system — no emoji in UI |
| Validation | Zod | Fail-fast ordering in API routes: schema → existence → ownership → conflict |
| Geo | Built-in CT town/ZIP table + haversine (`src/lib/ct-geo.ts`) | No external geocoding API |

A stack review with the dependency upgrade lane (Prisma 6, Auth.js v5,
Tailwind 4, Zod 4) is recorded in `docs/STACK_REVIEW.md`.

## Architecture

- **Server components** (`src/app/**/page.tsx`) query Prisma directly and
  render on the server. **Client islands** (`"use client"` components in
  `src/components/`) handle forms, buttons, and live UI.
- **All mutations** go through JSON route handlers in `src/app/api/*`.
- **One `User` ↔ one `Profile`**, type-discriminated (`FAN | VENUE | MUSICIAN |
  BAND`) in a single unified model — see `prisma/schema.prisma`. Enum-like
  fields are `String` for SQLite/Postgres portability.
- **`src/lib/`** holds the seams: `prisma`, `auth`, `session`, `stripe`,
  `email`, `plans` (single source of truth for pricing + feature gating),
  `track` (page-view analytics), `ct-geo`, `validations`, `constants`, `utils`.
- **Server→client boundary rule:** component functions (e.g. Lucide icons)
  cannot be passed from a server component to a client component — pass a
  string key and map it inside the client (see `dashboard/Sidebar.tsx`).

## External services

Every integration degrades gracefully — the app is fully usable with zero keys
configured:

| Service | Used for | Without keys |
| --- | --- | --- |
| Postgres (Supabase/Neon/any) | Production database | Dev uses SQLite (`file:./dev.db`) |
| Stripe | Pro subscriptions, event boosts, billing portal | "Billing disabled" notice; everything else works |
| Resend | Transactional + digest email | Log mode: emails print to the server console |
| Vercel Cron | Reminders (hourly) + weekly digest | Endpoints stay callable manually; open when `CRON_SECRET` unset |
| `ADMIN_EMAILS` allowlist | Verification review queue at `/dashboard/admin` | Admin queue disabled |

## Getting started (dev)

```bash
git clone <repo> && cd bandconnect
npm install
cp .env.example .env        # defaults work out of the box (SQLite, no keys)
npm run db:push             # create the schema
npm run db:seed             # load CT demo data
npm run dev                 # http://localhost:3000
```

Demo logins (password `password123`): `fan@demo.com`, `venue@demo.com`,
`musician@demo.com`, `band@demo.com`.

Before committing: `npm run build && npx tsc --noEmit && npm run lint` — the
same three checks CI runs (`.github/workflows/ci.yml`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | DB-provider switch → `prisma generate` → `next build` |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (next config) |
| `npx tsc --noEmit` | Typecheck |
| `npm run db:push` | Sync `schema.prisma` to the database |
| `npm run db:seed` | Seed CT demo data (`prisma/seed.ts`) |
| `npm run db:reset` | Wipe + reseed (dev only) |
| `npm run db:studio` | Prisma Studio data browser |

## Environment variables

See `.env.example` for the annotated full list. Summary:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | SQLite path in dev; Postgres URL in prod (or auto-injected `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` via the Vercel+Supabase integration) |
| `NEXTAUTH_SECRET` | yes | JWT signing secret (`openssl rand -base64 32`) |
| `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` | yes | Canonical app URL |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | no | Billing |
| `STRIPE_PRICE_ID_PRO_MONTHLY`, `STRIPE_PRICE_ID_PRO_YEARLY` | no | Pro plan prices ($12/mo, $120/yr) |
| `RESEND_API_KEY`, `EMAIL_FROM` | no | Email (log mode when unset) |
| `CRON_SECRET` | no | Protects `/api/cron/*` (open when unset, for dev) |
| `ADMIN_EMAILS` | no | Comma-separated admin allowlist for the verification queue |

## API endpoints

All handlers live in `src/app/api/`. Mutations validate with Zod, then check
existence → ownership → conflicts, in that order. "Session" = signed-in user
via NextAuth JWT cookie.

### Auth & account

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| * | `/api/auth/[...nextauth]` | — | NextAuth (credentials sign-in, session, CSRF) |
| POST | `/api/auth/signup` | public | Create user + typed profile |
| POST | `/api/auth/forgot-password` | public | Issue reset token (emailed) |
| POST | `/api/auth/reset-password` | token | Set new password |
| PUT | `/api/profile` | session | Update own profile |
| POST | `/api/profile/verify` | session | Claim/verify a page (email-domain auto-verify or manual review) |
| GET | `/api/me/badges` | session | Unread message/notification counts for the navbar |

### Events & calendar

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/events` | session (venue/artist) | Create event (Free tier: 3 upcoming max) |
| PATCH / DELETE | `/api/events/[id]` | session (owner) | Edit / remove event |
| GET | `/api/events/[id]/ics` | public | iCalendar download |
| POST | `/api/events/[id]/boost` | session (owner) | One-time Stripe Checkout for featured placement |
| POST | `/api/rsvp` | session | RSVP going/maybe (or clear) |
| POST | `/api/availability` | session (artist) | Add open dates |
| DELETE | `/api/availability/[id]` | session (owner) | Remove an open date |

### Social graph & messaging

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/follow` | session | Follow / unfollow a profile |
| POST | `/api/friend` | session (fan↔fan) | Request / accept / remove friendship |
| GET / POST / PATCH | `/api/messages` | session | List threads / send / mark read |
| PATCH | `/api/notifications` | session | Mark notifications read |
| POST | `/api/share` | session (fan) | Share an event to an accepted friend (DM + notification) |
| POST | `/api/saved-searches` | session | Save a town/genre alert |
| DELETE | `/api/saved-searches/[id]` | session (owner) | Remove an alert |
| POST | `/api/media` | session | Add a media item (URL) to own profile |
| DELETE | `/api/media/[id]` | session (owner) | Remove media |

### Billing (Stripe)

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/stripe/checkout` | session | Start Pro subscription checkout (`interval: month\|year`) |
| POST | `/api/stripe/portal` | session | Open the Stripe billing portal |
| POST | `/api/stripe/webhook` | Stripe signature | Subscription lifecycle + boost activation |

### Admin & cron

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/admin/verify` | `ADMIN_EMAILS` | Approve/reject verification requests |
| GET / POST | `/api/cron/reminders` | `CRON_SECRET`* | Email reminders for RSVPs starting within 24h (idempotent) |
| GET / POST | `/api/cron/digest` | `CRON_SECRET`* | Weekly personalized digest (idempotent via `User.digestSentAt`) |

\* Open when `CRON_SECRET` is unset so dev/demo works without config.

## Scheduled jobs

Configured in `vercel.json` (any external scheduler hitting the same URLs
works too):

| Schedule | Endpoint | Job |
| --- | --- | --- |
| Hourly (`0 * * * *`) | `/api/cron/reminders` | RSVP show reminders (next 24h, once per RSVP) |
| Thursdays 15:00 UTC (`0 15 * * 4`) | `/api/cron/digest` | Weekly "your week in CT live music" email from follows + saved searches |

## Deployment

Full walkthrough (including Docker and non-Vercel hosts): `docs/DEPLOYMENT.md`.
BandConnect needs a running Node server — static hosting (GitHub Pages) cannot
run the SSR pages, API routes, or webhooks.

### Local dev

SQLite + no keys: `cp .env.example .env && npm run db:push && npm run db:seed
&& npm run dev`. Billing shows a "not configured" notice, emails log to the
console, cron endpoints are open — every flow is still exercisable.

### Demo (shareable, still no paid services)

Deploy to the Vercel free tier with only the required env vars
(`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`) plus a free
Postgres via the Supabase integration. Then seed once from your machine:

```bash
vercel env pull .env    # pulls the POSTGRES_* vars locally
npm run db:push         # create tables
npm run db:seed         # demo accounts + CT events
```

Everything is clickable except real payments and real email — the
graceful-degradation modes cover both.

### Production

1. **Vercel** — import the repo. CI (`.github/workflows/ci.yml`) gates every
   push with build + typecheck + lint; Vercel redeploys green commits.
2. **Postgres** — add the Supabase integration (injects `POSTGRES_PRISMA_URL`
   pooled + `POSTGRES_URL_NON_POOLING` direct; Prisma auto-targets them), or
   set `DATABASE_URL` for any other Postgres. The Prisma provider switches to
   Postgres automatically at build.
3. **Create tables once**: `vercel env pull .env && npm run db:push` (do not
   seed demo data in production).
4. **Env vars** — the required trio plus live `STRIPE_*` keys and price IDs,
   `RESEND_API_KEY` + a verified `EMAIL_FROM` domain, `CRON_SECRET`, and
   `ADMIN_EMAILS`.
5. **Stripe webhook** — create an endpoint for
   `https://<domain>/api/stripe/webhook` subscribed to
   `checkout.session.completed` and `customer.subscription.*`, and set
   `STRIPE_WEBHOOK_SECRET`.
6. **Cron** — `vercel.json` schedules deploy with the project; confirm both
   jobs appear under Project → Settings → Cron Jobs.

## Docs

| File | Contents |
| --- | --- |
| `docs/PLAN.md` | Product thesis + architecture plan |
| `docs/ROADMAP.md` | Phased feature roadmap with status |
| `docs/STACK_REVIEW.md` | Stack decision record + dependency upgrade lane |
| `docs/DEPLOYMENT.md` | Full deployment guide (Vercel, Docker, env matrix) |
| `docs/MONETIZATION.md` | Pricing/levers, benchmarked against comparable platforms |
| `docs/UX_AUDIT.md` / `docs/ADA_AUDIT.md` | UX findings · WCAG 2.1 AA pass |
| `docs/GTM.md` + `docs/launch/` | Go-to-market plan, venue target lists, outreach kit, trust & verification spec |

## TODO

Near-term (next up):

- [ ] **Remove BandConnect branding for Pro** (`limits.removeBranding` exists,
      unimplemented) — including a custom profile URL/slug.
- [ ] Graceful fallbacks for blocked/failed embeds (YouTube/Spotify iframes
      currently show an empty frame; images already fall back).
- [ ] Rate limiting on login attempts and messaging; report/block moderation.
- [ ] Signup email verification + Google OAuth.
- [ ] Image/video uploads (S3/UploadThing) to replace URL-only media.

Growth & marketplace (see `docs/ROADMAP.md` phases 2–3):

- [ ] Event ingestion / bulk-import tooling (venue sites, Eventbrite/DICE
      feeds) — also the seeding engine for expansion into new regions.
- [ ] Structured booking offers on availability dates (request → hold → confirm).
- [ ] Reviews after played shows (venue ↔ artist).
- [ ] Past-show recaps and profile tabs.
- [ ] PWA + web push notifications; embeddable venue calendar widget.
- [ ] Ticketing affiliate links.

Platform:

- [ ] Test harness (Vitest + Playwright smoke) — prerequisite for the
      dependency upgrade lane in `docs/STACK_REVIEW.md` (Prisma 6, Auth.js v5,
      Tailwind 4, Zod 4).
- [ ] Geo at scale: bounding-box SQL pre-filter → PostGIS; ISR caching for
      public pages.
- [ ] Multi-region expansion: generalize `ct-geo.ts` into a regions table with
      region-scoped calendars/sitemaps (win New Haven liquidity first, then
      Providence — density over breadth).
- [ ] Email digest preferences / unsubscribe management.
