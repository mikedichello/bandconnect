# Deploying BandConnect

## Why not GitHub Pages?

GitHub Pages **only serves static files**. BandConnect is a full-stack app —
it needs a running Node server for:

- server-rendered pages (the calendar is queried from the database per request),
- API routes (`/api/*`) for auth, RSVPs, follows, messages, Stripe webhooks,
- **NextAuth** sessions and **Prisma** database access.

A static export (`next export`) would strip all of that out, leaving a shell
with no login, no data, and an empty calendar. So GitHub Pages is not an
option for the real app.

**Use a host that runs Node.** Recommended below.

---

## First-deploy checklist

1. **Database** — create a Postgres database. The Prisma provider **auto-switches**
   to Postgres from your `DATABASE_URL` at build time — no schema edit needed.
2. **Env vars** — set the required ones (full table at the end); generate a
   secret with `openssl rand -base64 32`.
3. **Schema** — `npx prisma db push` against the database (optionally
   `npm run db:seed` for demo data).
4. **Deploy** — Vercel (import repo) or Docker (`docker build` / `docker run`).
5. **Webhooks/cron (optional)** — add the Stripe webhook and confirm
   `/api/cron/reminders` is scheduled.

> **CI & auto-deploy:** `.github/workflows/ci.yml` runs build + `tsc` + lint on
> every push/PR, so only green commits ship. Connect the repo to Vercel once and
> it redeploys on every push — no deploy secrets needed in GitHub. The Prisma
> provider auto-switches to Postgres from `DATABASE_URL`
> (`scripts/set-db-provider.mjs`), so there's no manual schema edit.

---

## Option A — Vercel (recommended, easiest)

Vercel is built by the Next.js team and runs this app with zero config.

1. Push this repo to GitHub (already done on your branch).
2. Go to <https://vercel.com/new>, import the repo.
3. Add Postgres via **Storage → Create/Connect → Supabase** (or Vercel Postgres /
   Neon). The Supabase integration injects the DB env vars automatically
   (`POSTGRES_PRISMA_URL` pooled + `POSTGRES_URL_NON_POOLING` direct) and Prisma
   auto-targets them — no schema edit, no manual `DATABASE_URL`. (For a
   non-integration Postgres, set `DATABASE_URL` to its URL instead.)
4. Set environment variables (Project → Settings → Environment Variables):

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | auto-set by the Supabase/Postgres integration (or your Postgres URL) |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `NEXTAUTH_URL` | `https://your-app.vercel.app` |
   | `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
   | `STRIPE_*` | (optional) live billing keys + price IDs |

5. Deploy. Then create the tables once, locally (migrations use the **direct**
   connection, which Prisma picks up automatically):
   ```bash
   vercel env pull .env     # pulls POSTGRES_* from the project (or paste them)
   npm run db:push          # creates the tables
   npm run db:seed          # optional demo data
   ```

That's it — every push to the branch redeploys automatically.

---

## Option B — Docker (Railway, Render, Fly.io, or your own VPS)

A production `Dockerfile` is included (Next.js standalone + Prisma).

```bash
# Provider auto-switches to Postgres from DATABASE_URL at build — no schema edit.
docker build -t bandconnect .
docker run -p 3000:3000 --env-file .env bandconnect
```

Provide the same env vars as above via `--env-file` or the platform's config.
On first deploy, run `npx prisma db push` against your database to create the
schema (e.g. as a release command on Railway/Render).

- **Railway / Render:** point the service at this repo; both auto-detect the
  Dockerfile. Add a managed Postgres plugin and set `DATABASE_URL`.
- **Fly.io:** `fly launch` (detects the Dockerfile), `fly postgres create`,
  `fly secrets set NEXTAUTH_SECRET=… DATABASE_URL=…`.

---

## Database: SQLite (dev) → Postgres (prod)

The repo ships with SQLite for zero-config local dev. For any real deployment:

1. Set `DATABASE_URL` to your Postgres string — the Prisma provider
   **auto-switches** to `postgresql` at build (`scripts/set-db-provider.mjs`),
   so no schema edit is needed.
2. `npm run db:push` to create the tables.

No other code changes are needed — enum-like fields are modeled as `String`
specifically so the schema is portable.

## Stripe (optional, for live billing)

1. Create a Product with monthly + yearly Prices; put the IDs in
   `STRIPE_PRICE_ID_PRO_MONTHLY` / `_YEARLY`.
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. Add a webhook to `https://YOUR_DOMAIN/api/stripe/webhook` for
   `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`; put the signing secret in
   `STRIPE_WEBHOOK_SECRET`.

Without these the app runs fine in **demo billing mode**.

## Email & reminders (optional, for live email)

Transactional email (welcome, password reset, event reminders) uses **Resend**.

1. Get a key at <https://resend.com>, verify a sending domain (or use
   `onboarding@resend.dev` for testing).
2. Set `RESEND_API_KEY` and `EMAIL_FROM`.

Without `RESEND_API_KEY` the app runs in **log mode** — emails are written to
the server console instead of sent, so every flow still works.

**Event reminders** are sent by `/api/cron/reminders`, which reminds each
RSVP'd show starting within 24h exactly once. On Vercel this is wired up by
`vercel.json` (hourly). Protect it by setting `CRON_SECRET` — Vercel Cron sends
it automatically as a Bearer token. On other hosts, call the endpoint on a
schedule with `Authorization: Bearer $CRON_SECRET` (or `?key=$CRON_SECRET`).

> **Heads-up:** Vercel's **Hobby** plan runs cron jobs at most **once per day**.
> For truly hourly reminders, use Vercel **Pro**, or point a free external
> scheduler (e.g. cron-job.org or a GitHub Actions schedule) at
> `https://YOUR_DOMAIN/api/cron/reminders` with the `Authorization` header.

## All environment variables

| Variable | Required | What it's for |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres connection string |
| `NEXTAUTH_SECRET` | ✅ | session signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | ✅ | deployed base URL |
| `NEXT_PUBLIC_APP_URL` | ✅ | base URL for emails / sitemap / OG |
| `STRIPE_SECRET_KEY` | billing | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | billing | webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | billing | Stripe publishable key |
| `STRIPE_PRICE_ID_PRO_MONTHLY` / `_YEARLY` | billing | Pro plan price IDs |
| `RESEND_API_KEY` | email | enables real email (else log mode) |
| `EMAIL_FROM` | email | verified sender address |
| `CRON_SECRET` | reminders | protects the reminders cron endpoint |

Only the four ✅ rows are required; the rest enable billing, email, and
reminders respectively, and degrade gracefully when unset.

## What about a static page on GitHub Pages?

If you specifically want *something* on GitHub Pages, the only sensible use is a
static marketing/"coming soon" page that links to the real app hosted on Vercel
(or Docker). The application itself must run on a Node host.
