<div align="center">

# 🎸 BandConnect

### Where local bands and venues actually connect.

Bands find rooms to play. Venues find acts to book. Everyone gets a beautiful
single-page profile, a show calendar, direct messaging, and a simple booking
workflow — with a free tier and a Pro subscription.

[Features](#-features) · [Quick start](#-quick-start) · [Deploy](#-deployment) · [Plan & wireframes](#-docs)

</div>

---

## ✨ Features

| For everyone | For bands | For venues |
| --- | --- | --- |
| Secure email/password auth (bcrypt) | One-page band site at `/bands/your-name` | One-page venue site at `/venues/your-room` |
| Direct messaging inbox | Browse & filter venues | Browse & filter bands |
| Public show calendar | Send booking submissions | Receive & accept/decline submissions |
| Free tier + Pro subscription | Promote shows with tickets | Publish what & who you book |
| Discovery with search & genre filters | Spotify / Bandcamp / YouTube links | Capacity, address, genres booked |

**Free vs Pro**

- **Starter (Free):** public profile, discovery listing, up to 3 upcoming shows,
  5 booking submissions / month, full messaging.
- **Pro ($12/mo):** unlimited shows & submissions, custom profile theme color,
  featured placement in discovery, analytics, and branding removal.

Billing is powered by **Stripe** (Checkout + Billing Portal + webhooks). When
Stripe keys aren't configured the app runs in **demo billing mode** — every
feature still works, upgrade buttons just explain that billing is disabled.

## 🧱 Tech stack

- **[Next.js 14](https://nextjs.org/)** (App Router) — full-stack React, one codebase
- **TypeScript** end to end
- **[Prisma](https://www.prisma.io/)** ORM — SQLite for dev, Postgres for prod
- **[NextAuth](https://next-auth.js.org/)** (credentials + JWT sessions, bcrypt hashing)
- **[Stripe](https://stripe.com/)** — subscriptions
- **[Tailwind CSS](https://tailwindcss.com/)** — styling
- **[Zod](https://zod.dev/)** — runtime validation on every API route

## 🚀 Quick start

```bash
# 1. Install dependencies (also generates the Prisma client)
npm install

# 2. Create your env file
cp .env.example .env
#   The defaults work out of the box for local dev (SQLite, billing disabled).

# 3. Create the database and load demo data
npm run db:push
npm run db:seed

# 4. Run it
npm run dev
```

Open **http://localhost:3000**.

### Demo logins

The seed creates a full demo scene. Password for all accounts is **`password123`**.

| Account | Role | Plan |
| --- | --- | --- |
| `band@demo.com` | Band (The Night Owls) | Pro |
| `venue@demo.com` | Venue (The Underground) | Pro |

Plus 5 more bands and 4 more venues, with shows, submissions, and a message thread.

### Useful scripts

```bash
npm run dev        # start dev server
npm run build      # production build (runs prisma generate)
npm start          # run the production build
npm run db:push    # sync schema to the database
npm run db:seed    # load demo data
npm run db:reset   # wipe + re-seed (dev only)
npm run db:studio  # open Prisma Studio to browse data
```

## ☁️ Deployment

BandConnect deploys to any Node host. The fastest path is **Vercel + a hosted Postgres**.

### 1. Switch the database to Postgres

In `prisma/schema.prisma`, change the datasource provider:

```prisma
datasource db {
  provider = "postgresql"   // was "sqlite"
  url      = env("DATABASE_URL")
}
```

Create a Postgres database (Vercel Postgres, Neon, Supabase, Railway…) and set
`DATABASE_URL` to its connection string.

### 2. Set environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres connection string |
| `NEXTAUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | Your deployed URL, e.g. `https://bandconnect.app` |
| `NEXT_PUBLIC_APP_URL` | ✅ | Same as above |
| `STRIPE_SECRET_KEY` | for billing | From the Stripe dashboard |
| `STRIPE_WEBHOOK_SECRET` | for billing | From your webhook endpoint |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | for billing | Publishable key |
| `STRIPE_PRICE_ID_PRO_MONTHLY` | for billing | Price ID for the monthly Pro plan |
| `STRIPE_PRICE_ID_PRO_YEARLY` | for billing | Price ID for the yearly Pro plan |

### 3. Push the schema and deploy

```bash
npx prisma db push      # create tables on your Postgres database
# (optional) npm run db:seed
```

Deploy on Vercel (`vercel --prod`) or any Node host running `npm run build && npm start`.

### 4. Enable Stripe billing (optional)

1. Create a **Product** with monthly and yearly **Prices** in the Stripe dashboard.
2. Put the price IDs in `STRIPE_PRICE_ID_PRO_MONTHLY` / `_YEARLY`.
3. Add a webhook endpoint pointing at `https://YOUR_DOMAIN/api/stripe/webhook`,
   subscribed to `checkout.session.completed`,
   `customer.subscription.updated`, and `customer.subscription.deleted`.
4. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

For local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`.

## 🗂️ Project structure

```
src/
├── app/
│   ├── page.tsx                 # marketing landing page
│   ├── login, signup/           # auth screens
│   ├── discover/bands|venues/   # directory + filters
│   ├── bands|venues/[slug]/     # public single-page profiles
│   ├── shows/                   # public show calendar
│   ├── pricing/                 # plans + FAQ
│   ├── dashboard/               # authed app (profile, shows, submissions, messages, billing)
│   └── api/                     # auth, profile, events, submissions, messages, stripe
├── components/                  # UI + feature components
├── lib/                         # prisma, auth, stripe, plans, validations, utils
└── types/                       # NextAuth type augmentation
prisma/
├── schema.prisma                # data model
└── seed.ts                      # demo data
docs/
├── PLAN.md                      # product & technical plan + roadmap
└── WIREFRAMES.md                # screen wireframes
```

## 🔐 Security notes

- Passwords are hashed with **bcrypt** (cost 12); plaintext is never stored.
- Every API route validates input with **Zod** and checks authentication and
  ownership before writing.
- Sessions are stateless **JWTs** signed with `NEXTAUTH_SECRET`.
- Stripe webhooks are **signature-verified** before any database change.
- Plan limits are enforced **server-side**, not just hidden in the UI.

## 📚 Docs

- **[docs/PLAN.md](docs/PLAN.md)** — the product vision, data model, architecture, and roadmap.
- **[docs/WIREFRAMES.md](docs/WIREFRAMES.md)** — wireframes for every key screen.

---

<div align="center">
Built for the local scene with Next.js, Prisma & Stripe.
</div>
