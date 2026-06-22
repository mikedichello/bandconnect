<div align="center">

# 🎶 BandConnect

### The calendar for Connecticut's live-music scene.

Every live show in CT in one place. Fans discover and RSVP to gigs; venues,
musicians, and bands build profiles, post events, and find each other.

[Features](#-features) · [Quick start](#-quick-start) · [Deploy](#-deployment) · [Plan & wireframes](#-docs)

</div>

---

## ✨ Features

### Calendar-first home page
- Every Connecticut event in one feed, with **list ⇄ month-calendar** views.
- Filter by **town or ZIP + radius (miles)** — a built-in CT geocode table and
  the haversine formula, no external API.
- Secondary filters: **family-friendly** and **no cover**, plus genre.

### Four profile types
| Type | What they do |
| --- | --- |
| 🎟️ **Fan** | Follow venues/artists, friend other fans, RSVP (going/maybe), keep a personal show calendar, get notifications. |
| 🏛️ **Venue / Host** | Promote the room, post events, media gallery, find acts available for gigs. |
| 🎸 **Musician** | Bio, genres, instruments, media, rate range (hideable), gig status (solo / start a band / join a band / fill-ins), open-date availability calendar. |
| 🥁 **Band** | Bio, genres, media, rate range, post shows, mark "needs musicians," find venues & players. |

### Events
Title · cover **photo or video** (video plays on the event page, thumbnail in
lists) · description · start + optional end · **family-friendly** toggle ·
**cover-charge** toggle · genre tags · Connecticut geo.

### Social
Follow any profile · fan↔fan **friendships** · **RSVP** going/maybe · direct
**messaging** · **share** · in-app **notifications** (new follower, friend
request, RSVP, message, new event from someone you follow).

### Discovery & search
Browse **/venues** and **/artists**. Artists are searchable by genre,
**availability date**, and **seeking status** (joining/forming a band, open for
fill-ins, bands needing musicians).

### Free vs Pro (Stripe)
- **Starter (free):** profile, discovery, up to 3 events, full social features.
- **Pro ($12/mo):** unlimited events, featured placement, custom theme color,
  analytics, branding removal.

Billing runs on Stripe (Checkout + Portal + signature-verified webhooks). With
no Stripe keys set, the app runs in **demo billing mode** — fully usable,
upgrade buttons just explain billing is off.

## 🧱 Tech stack

Next.js 14 (App Router) · TypeScript · Prisma (SQLite dev / Postgres prod) ·
NextAuth (credentials + bcrypt) · Stripe · Tailwind CSS · Zod.

## 🚀 Quick start

```bash
npm install
cp .env.example .env       # defaults work for local dev (SQLite, billing off)
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

Plus more venues, bands, musicians, fans, a dozen events across CT, follows,
RSVPs, availability, and a message thread.

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
> auth, database, API routes), and GitHub Pages serves static files only — it
> can't run the server. Use a Node host. Full guide: **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**.

**Fastest path — Vercel + hosted Postgres:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. In `prisma/schema.prisma`, set `provider = "postgresql"`.
2. Set env vars (see `.env.example`): `DATABASE_URL`, `NEXTAUTH_SECRET`
   (`openssl rand -base64 32`), `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, and—for
   live billing—the `STRIPE_*` keys + price IDs.
3. `npx prisma db push` against your Postgres, then deploy.

**Self-hosted — Docker (Railway / Render / Fly / VPS):** a production
`Dockerfile` is included.

```bash
docker build -t bandconnect .
docker run -p 3000:3000 --env-file .env bandconnect
```

## 🗂️ Project structure

```
src/
├── app/
│   ├── page.tsx                # home: CT event calendar (list + calendar)
│   ├── event/[id]/             # event detail (video plays here)
│   ├── venues/ · artists/      # discovery
│   ├── p/[slug]/               # unified public profile (4 types)
│   ├── login/ · signup/        # auth (4 roles)
│   ├── pricing/
│   ├── dashboard/              # overview, profile+media, events, calendar,
│   │                           # availability, network, notifications,
│   │                           # messages, billing
│   └── api/                    # auth, profile, events, follow, friend, rsvp,
│                               # media, availability, notifications, messages,
│                               # stripe
├── components/                 # UI + feature components
└── lib/                        # prisma, auth, stripe, plans, ct-geo,
                                # constants, validations, utils
prisma/  schema.prisma · seed.ts
docs/    PLAN.md · WIREFRAMES.md
```

## 🔐 Security

bcrypt password hashing · Zod validation on every mutating route · server-side
authorization & ownership checks · JWT sessions · signature-verified Stripe
webhooks · plan limits enforced server-side.

## 📚 Docs
- **[docs/PLAN.md](docs/PLAN.md)** — product vision, data model, architecture, roadmap.
- **[docs/WIREFRAMES.md](docs/WIREFRAMES.md)** — wireframes for every key screen.

---

<div align="center">Built for the Connecticut scene with Next.js, Prisma & Stripe.</div>
