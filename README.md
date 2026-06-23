<div align="center">

# 🎶 BandConnect

### The calendar for Connecticut's live-music scene.

Every live show in CT in one place. Fans discover and RSVP to gigs; venues,
musicians, and bands build profiles, post events, and find each other.

[Features](#-features) · [Quick start](#-quick-start) · [Deploy](#-deployment) · [Docs](#-docs)

</div>

---

## ✨ Features

### Calendar-first home page
- Every Connecticut event in one feed, with **list ⇄ month-calendar** views.
- **Date quick-filters** (Tonight / This weekend / This week) and **"use my
  location."**
- Filter by **town or ZIP + radius (miles)** — a built-in CT geocode table and
  the haversine formula, no external API.
- Secondary filters: **family-friendly**, **no cover**, and genre.
- **Following feed** — a personal tab of upcoming shows from who you follow.

### Four profile types
| Type | What they do |
| --- | --- |
| 🎟️ **Fan** | Follow venues/artists, friend other fans, RSVP (going/maybe), personal show calendar, share events, save alerts. |
| 🏛️ **Venue / Host** | Promote the room, post events, media gallery, find acts available for gigs. |
| 🎸 **Musician** | Bio, genres, instruments, media, rate range (hideable), gig status (solo / start a band / join a band / fill-ins), open-date availability. |
| 🥁 **Band** | Bio, genres, media, rate range, post shows, mark "needs musicians," find venues & players. |

### Events
Title · cover **photo or video** (plays on the event page, thumbnail in lists) ·
description · start + optional end · **family-friendly** & **cover-charge**
toggles · genre tags · CT geo · **add-to-calendar** (Google + `.ics`) ·
schema.org `MusicEvent` JSON-LD for search.

### Social & messaging
Follow any profile · fan↔fan **friendships** · **RSVP** going/maybe ·
**real-time-ish messaging** (polling, optimistic send) · **share an event to a
friend** · in-app **notifications** (new follower, friend request, RSVP, message,
share, new event from who you follow).

### Alerts & email
- **Saved searches** — "tell me when a show is booked in my town / genre"; new
  matching events notify you.
- **Email** (Resend): welcome, **password reset**, and **pre-show reminders**
  for RSVP'd events (hourly cron). Runs in **log mode** without a key.

### Discovery & search
Browse **/venues** and **/artists**. Artists are searchable by genre,
**availability date**, and **seeking status** (joining/forming a band, open for
fill-ins, bands needing musicians).

### Polish
**Light / dark theme** toggle (semantic tokens, no-flash) · fully **responsive**
(mobile-tuned calendar) · **WCAG 2.1 AA accessibility** (associated labels, ARIA
live regions, theme-aware contrast, visible focus, reduced-motion) · onboarding
checklist · `sitemap.xml` + `robots.txt`.

### Free vs Pro (Stripe)
- **Starter (free):** profile, discovery, up to 3 events, all social features.
- **Pro ($12/mo):** unlimited events, featured placement, custom theme color,
  analytics, branding removal.

Billing runs on Stripe (Checkout + Portal + signature-verified webhooks). With
no Stripe keys, the app runs in **demo billing mode** — fully usable.

## 🧱 Tech stack

Next.js 14 (App Router) · TypeScript · Prisma (SQLite dev / Postgres prod) ·
NextAuth (credentials + bcrypt) · Stripe · Resend · Tailwind CSS · lucide-react ·
Zod.

## 🚀 Quick start

```bash
npm install
cp .env.example .env       # defaults work for local dev (SQLite; billing & email in demo mode)
npm run db:push            # create the database
npm run db:seed            # load CT demo data
npm run dev                # http://localhost:3000
```

### Demo logins
Password for all accounts is **`password123`**:

| Account | Type |
| --- | --- |
| `fan@demo.com` | Fan |
| `venue@demo.com` | Venue (Pro) |
| `musician@demo.com` | Musician (Pro) |
| `band@demo.com` | Band (Pro) |

Plus more venues, bands, musicians, fans, ~a dozen events across CT, follows,
RSVPs, availability, a message thread, and saved alerts.

### Scripts
```bash
npm run dev | build | start
npm run db:push     # sync schema to the database
npm run db:seed     # load demo data
npm run db:reset    # wipe + reseed (dev only)
npm run db:studio   # browse data in Prisma Studio
```

## ☁️ Deployment

> **Not GitHub Pages.** This is a full-stack app (server-rendered calendar,
> auth, database, API routes, webhooks) — GitHub Pages serves static files only.
> Use a Node host. **Full step-by-step guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).**

**Fastest path — Vercel + hosted Postgres:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. In `prisma/schema.prisma`, set `provider = "postgresql"`.
2. Create a Postgres DB (Vercel Postgres / **Neon** / **Supabase** free tiers).
3. Set environment variables (see table below), then deploy.
4. Run `npx prisma db push` against the DB (and optionally `npm run db:seed`).

**Self-hosted — Docker (Railway / Render / Fly / VPS):** a production
`Dockerfile` + `vercel.json` (cron) are included.

```bash
docker build -t bandconnect .
docker run -p 3000:3000 --env-file .env bandconnect
```

### Environment variables

| Variable | Required | What it's for |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres connection string (prod) |
| `NEXTAUTH_SECRET` | ✅ | session signing — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | deployed URL, e.g. `https://bandconnect.app` |
| `NEXT_PUBLIC_APP_URL` | ✅ | same as above (used in emails, OG, sitemap) |
| `STRIPE_SECRET_KEY` | billing | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | billing | webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | billing | Stripe publishable key |
| `STRIPE_PRICE_ID_PRO_MONTHLY` / `_YEARLY` | billing | Pro price IDs |
| `RESEND_API_KEY` | email | enables real email (else log mode) |
| `EMAIL_FROM` | email | verified sender, e.g. `BandConnect <hi@yourdomain>` |
| `CRON_SECRET` | reminders | protects `/api/cron/reminders` |

Everything except `DATABASE_URL`/`NEXTAUTH_*` is optional — the app degrades
gracefully (demo billing, log-mode email) without it.

## 🗂️ Project structure

```
src/
├── app/
│   ├── page.tsx                  # home: CT event calendar (filters, following feed)
│   ├── event/[id]/               # event detail (video, add-to-calendar, share)
│   ├── venues/ · artists/        # discovery
│   ├── p/[slug]/                 # unified public profile (4 types)
│   ├── login · signup · forgot-password · reset-password
│   ├── pricing/
│   ├── dashboard/                # overview, profile+media, events, calendar,
│   │                             # availability, network, messages,
│   │                             # notifications, alerts, billing
│   ├── sitemap.ts · robots.ts
│   └── api/                      # auth(+reset), profile, events(+ics), follow,
│                                 # friend, rsvp, share, media, availability,
│                                 # saved-searches, notifications, messages,
│                                 # me/badges, stripe/*, cron/reminders
├── components/                   # UI + feature components
└── lib/                          # prisma, auth, stripe, email, plans, ct-geo,
                                  # constants, validations, utils
prisma/   schema.prisma · seed.ts
docs/     PLAN.md · DEPLOYMENT.md · ROADMAP.md · UX_AUDIT.md · WIREFRAMES.md · ADA_AUDIT.md
```

## 🔐 Security

bcrypt password hashing · Zod validation on every mutating route · server-side
authorization & ownership checks · JWT sessions · signature-verified Stripe
webhooks · hashed single-use password-reset tokens · cron secret · plan limits
enforced server-side.

## 📚 Docs
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — full deploy guide (Vercel, Docker, Postgres, Stripe, email, cron).
- **[docs/GTM.md](docs/GTM.md)** — go-to-market & launch plan (+ [launch kit](docs/launch/): target lists, outreach templates, tracker).
- **[docs/MONETIZATION.md](docs/MONETIZATION.md)** — monetization strategy (benchmarked) + paid event boosts.
- **[docs/PLAN.md](docs/PLAN.md)** — product vision, data model, architecture.
- **[docs/ROADMAP.md](docs/ROADMAP.md)** — feature roadmap (Phase 1 & 2 shipped).
- **[docs/UX_AUDIT.md](docs/UX_AUDIT.md)** — UI/UX audit.
- **[docs/ADA_AUDIT.md](docs/ADA_AUDIT.md)** — WCAG 2.1 AA accessibility conformance audit.
- **[docs/WIREFRAMES.md](docs/WIREFRAMES.md)** — screen wireframes.

---

<div align="center">Built for the Connecticut scene with Next.js, Prisma, Stripe & Resend.</div>
