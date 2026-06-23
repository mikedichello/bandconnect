# BandConnect — Product & Technical Plan

## 1. The problem

Finding live music in Connecticut means scraping a dozen venue Instagram feeds.
Booking it means cold-DMing strangers. There's no shared, structured calendar of
the local scene — and no single place where fans, venues, musicians, and bands
all meet.

## 2. The product

**A calendar-first social platform for Connecticut's live-music scene.**

- The **home page is the calendar**: every CT show, filterable by town/ZIP +
  radius, genre, family-friendly, and no-cover, in list or month view.
- **Four profile types** share one graph: Fan, Venue/Host, Musician, Band.
- The **social layer** (follow, friend, RSVP, message, notify) drives
  retention; the **discovery layer** (browse + search by availability) drives
  bookings.

### Who does what
- **Fans** follow venues/artists, friend other fans, RSVP (going/maybe), keep a
  personal calendar, and get reminders/notifications.
- **Venues** promote the room, post events, show media, and find acts available
  for gigs.
- **Musicians** showcase bio/genres/instruments/media, set a (hideable) rate,
  mark gig status (solo / start a band / join a band / fill-ins), and publish an
  open-date availability calendar.
- **Bands** do the same, mark "needs musicians," find venues, and recruit
  players. Both artists search venues; venues and bands search players by date.

## 3. Monetization

Flat **subscription**, no cut of bookings. Plans live in `src/lib/plans.ts` as
the single source of truth for pricing *and* server-side gating.

| | Starter (free) | Pro ($12/mo) |
| --- | --- | --- |
| Profile, discovery, social | ✅ | ✅ |
| Upcoming events | 3 | Unlimited |
| Featured placement | — | ✅ |
| Custom theme & branding | — | ✅ |
| Analytics | — | ✅ |

Stripe Checkout + Billing Portal + signature-verified webhooks keep `plan` in
sync. No keys → "demo billing" mode (everything works, upgrades disabled).

**Beyond subscriptions:** pay-per-use **event boosts** (promoted calendar
placement, $10 / 30 days) add transactional revenue without taking a booking
cut — modeled on Bandsintown Promote / Eventbrite Ads and benchmarked in
**[MONETIZATION.md](MONETIZATION.md)**.

## 4. Architecture

A single **Next.js (App Router)** app — server components read via Prisma and
render the calendar, profiles, and lists; client islands handle interactive bits
(filters, RSVP/follow/friend buttons, editors, inbox). JSON route handlers under
`/api/*` own all mutations.

- **Auth:** NextAuth credentials + JWT; `role`/`plan` ride in the token for
  gating without extra reads.
- **Geo:** no external geocoder. `src/lib/ct-geo.ts` ships a CT town/ZIP →
  coordinate table; radius filtering is haversine in app code (fine at
  state scale). Switch to PostGIS/`earthdistance` if the dataset grows.
- **Media & video:** stored as URLs; YouTube/Vimeo/direct links are normalized
  to embeds (`toEmbedUrl`). Video plays on the event/profile page; a thumbnail
  shows in lists.
- **Notifications:** social events are written to a `Notification` table;
  event reminders are derived from RSVPs. Email/push is a documented next step.
- **DB portability:** enum-like fields are `String` so the same schema runs on
  SQLite (dev) and Postgres (prod) with a one-line provider change.

## 5. Data model

See `prisma/schema.prisma`.

- **User** — auth + Stripe billing; 1:1 with **Profile**.
- **Profile** — unified, `type`-discriminated (FAN/VENUE/MUSICIAN/BAND): name,
  slug, avatar/banner, bio, geo (city/zip/lat/lng), genres, instruments, rate
  (min/max/hidden), gig flags (solo / start-band / join-band / fill-ins /
  needs-musicians), theme, featured.
- **Event** — host (+ optional venue) profile, cover (image|video) + thumbnail,
  start/optional-end, family-friendly, cover-charge, genres, CT geo.
- **MediaItem** — image/video gallery entries.
- **Follow** — directed profile→profile. **Friendship** — fan↔fan with status.
- **Rsvp** — profile→event (going/maybe). **AvailabilityDate** — artist open
  dates. **Message** — user↔user DMs. **Notification** — in-app feed.

```
User 1─1 Profile ─*< Follow >*─ Profile
                 ├─* Event *─< Rsvp >─ Profile (fan)
                 ├─* MediaItem
                 ├─* AvailabilityDate
                 └─* Friendship (fan↔fan)
User ─* Message ─ User   ·   User ─* Notification
```

## 6. Security

bcrypt hashing · Zod on every mutating route · auth + ownership checks server
side (you only edit your own profile/events/media/dates; only the addressee
accepts a friend request) · JWT sessions · Stripe webhook signature
verification · secrets via env only.

## 7. Build status

Implemented and verified end-to-end: 4-role signup + **password reset**,
calendar home (list + month, geo radius, **date quick-filters**, **near-me**,
family/no-cover, **Following feed**), event CRUD with cover photo/video +
**add-to-calendar** + **JSON-LD/sitemap**, unified profiles with
media/availability, follow/friend/RSVP, **real-time-ish messaging**,
**share-to-friend**, **saved-search alerts**, in-app notifications + **email
(Resend) reminders via cron**, browse + availability search, **light/dark
theme**, a **WCAG 2.1 AA accessibility** pass (see
**[ADA_AUDIT.md](ADA_AUDIT.md)**), and Stripe billing with a demo fallback.

A full QA pass confirms: production build + lint + types green; every public and
dashboard route returns correctly (200 / 404 / 307-redirect) across all four
roles; and auth, validation, ownership, role-gating, and the core write flows
behave as expected against a running server. See **[ROADMAP.md](ROADMAP.md)** for
what's shipped vs. ahead.

## 8. Roadmap

- **Notifications:** email/push reminders for upcoming RSVP'd shows (Resend +
  cron), digest emails.
- **Media:** direct image/video uploads (S3/UploadThing) instead of URLs.
- **Booking:** structured offers/holds on availability dates; calendar sync
  (`.ics`, Google Calendar).
- **Discovery:** map view, regional "scene" pages, saved searches + alerts.
- **Trust:** reviews after a played show, verified venues.
- **Scale:** move geo to PostGIS; real-time messaging via WebSockets.
- **Reach:** expand beyond CT to a multi-region model; mobile apps on the API.
