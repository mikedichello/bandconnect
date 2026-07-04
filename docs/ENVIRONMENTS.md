# Environments & promotion: feature branch → dev → main → production

How code moves from your editor to production, with an isolated dev
environment in between. Built on Vercel's two-environment model — **Preview**
deployments for every non-production branch, **Production** deployments for
`main` — so the pipeline is mostly convention plus environment-scoped
configuration, not custom infrastructure.

```
feature branch ──push──▶ CI (build+tsc+lint) ──▶ Vercel PREVIEW  = dev env
      │                                           dev DB · test Stripe · log email
      │  test on the preview URL
      ▼
 PR → main ──merge──▶ CI ──▶ Vercel PRODUCTION
                              prod DB · live Stripe · Resend · crons
```

## Day-to-day workflow

1. **Branch from `main`:**
   ```bash
   git checkout main && git pull origin main
   git checkout -b feat/my-feature
   ```
2. **Push early, push often.** Every push does two things automatically:
   - **CI** (`.github/workflows/ci.yml`) runs build + typecheck + lint.
   - **Vercel builds a Preview deployment** — a unique URL per commit plus a
     stable per-branch URL (`bandconnect-git-feat-my-feature-<team>.vercel.app`).
     Previews use **Preview-scoped env vars**: the dev database, Stripe test
     keys, email log mode. If the branch changed `prisma/schema.prisma`, the
     build syncs the dev database automatically (`DB_PUSH_ON_BUILD=1`).
3. **Test on the preview URL.** Demo logins work if the dev DB is seeded
   (below). Nothing here can touch production data or charge a real card.
4. **Open a PR to `main`.** CI is a required check (branch protection), so a
   red build can't merge. Review the diff; the PR page links the preview.
5. **Merge.** Vercel deploys `main` to **Production** with Production-scoped
   env vars. Cron jobs (reminders, digest) only run on Production deployments.
6. **Roll back if needed:** Vercel → Deployments → previous production
   deployment → *Instant Rollback* (or `git revert` the merge and push).

That's the whole loop: push = dev deploy, merge = production deploy.

## One-time setup

### GitHub (~2 minutes)

1. `main` exists (created from the pre-session baseline). **Set it as the
   default branch:** Settings → General → Default branch → `main`.
2. **Protect it:** Settings → Branches → Add rule for `main`:
   - Require a pull request before merging
   - Require status checks to pass → select the **CI / build** check

### Vercel (~10 minutes)

1. Import the repo at <https://vercel.com/new> (if not already connected).
2. **Settings → Git → Production Branch: `main`.** Every other branch now
   deploys as a Preview automatically.
3. **Two databases** so dev can never corrupt prod — e.g. two Supabase
   projects (`bandconnect-dev`, `bandconnect-prod`), or one integration
   scoped per environment. In **Settings → Environment Variables**, scope
   each var to *Production* or *Preview*:

   | Variable | Production | Preview (dev) |
   | --- | --- | --- |
   | `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` (or `DATABASE_URL`) | prod database | **dev database** |
   | `NEXTAUTH_SECRET` | strong secret | *different* strong secret |
   | `NEXTAUTH_URL` | `https://<prod-domain>` | leave unset — NextAuth falls back to the deployment's `VERCEL_URL` |
   | `NEXT_PUBLIC_APP_URL` | `https://<prod-domain>` | stable branch URL or unset (links/emails only) |
   | `STRIPE_SECRET_KEY` + publishable + price IDs | **live** keys | **test** keys (or unset → billing-disabled mode) |
   | `STRIPE_WEBHOOK_SECRET` | live webhook | test webhook (or unset) |
   | `RESEND_API_KEY` | real key | unset → log mode (emails print to build/function logs) |
   | `CRON_SECRET` | set | n/a (crons don't run on previews) |
   | `ADMIN_EMAILS` | real admins | your email |
   | `DB_PUSH_ON_BUILD` | unset (schema changes fail-safe; push manually) | `1` — schema auto-syncs on deploy |
   | `DB_PUSH_ACCEPT_DATA_LOSS` | **never** | `1` if you want destructive schema iteration to just work in dev |

4. **Seed the dev database** once (from your machine):
   ```bash
   vercel env pull .env --environment=preview   # dev DB vars into local .env
   npm run db:push
   npm run db:seed                              # demo accounts + CT events
   ```
   Re-run `db:seed` any time you want the dev data reset (`db:reset` wipes it).

5. **Production schema changes:** with `DB_PUSH_ON_BUILD` unset in
   Production, apply schema changes deliberately when a migration-bearing PR
   merges:
   ```bash
   vercel env pull .env --environment=production
   npm run db:push        # additive changes apply cleanly; destructive ones prompt
   ```
   (Or set `DB_PUSH_ON_BUILD=1` in Production too — it fails the build rather
   than lose data, which is a reasonable hands-off default for additive-only
   changes.)

### Stripe (only when testing billing in dev)

Use **test mode** keys in Preview scope. For webhook-dependent flows (boost
activation, subscription lifecycle) point a test-mode webhook at the stable
branch URL you're testing, or run `stripe listen --forward-to` against a
local dev server.

## Notes & edge cases

- **Cron jobs run only on Production.** To exercise reminders/digest in dev,
  hit `/api/cron/reminders` or `/api/cron/digest` on the preview URL manually
  (they're open when `CRON_SECRET` is unset in Preview).
- **A stable long-lived dev URL (optional).** Per-branch preview URLs remove
  the need for a fixed "dev server", but if you want one URL to hand to
  testers, keep the existing `dev` branch: merge feature branches into `dev`
  before `main`, and its preview URL stays constant. The `dev` branch also
  carries a Codespaces devcontainer for a no-Vercel seeded demo.
- **Preview auth:** NextAuth v4 uses `VERCEL_URL` when `NEXTAUTH_URL` is
  unset, so logins work on every preview URL without per-branch config.
- **Never share `NEXTAUTH_SECRET` or the database between environments** —
  that's the isolation boundary.
