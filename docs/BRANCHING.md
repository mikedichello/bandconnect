# Branching & promotion: feature → `dev` → `main`

```
feat/*, fix/*, chore/*  ──PR──▶  dev  ──release PR──▶  main
        (short-lived)           (staging)              (production, default branch)

hotfix/*  ──PR──▶ main   then back-merge main → dev
```

| Branch | Role | Deploys to | Who merges |
| --- | --- | --- | --- |
| `main` | Production. **Default branch.** Always releasable. | Vercel **Production** (prod DB, live Stripe, Resend, crons) | Release PR from `dev` only (or `hotfix/*`) |
| `dev` | Staging / integration. Everything for the next release lands here first. | Vercel **Preview** for `dev` (dev DB, Stripe test keys, email log mode; seeded demo via `DEMO_SEED`) | Squash-merge feature PRs after CI + review |
| `feat/<ticket>-<slug>` · `fix/…` · `chore/…` | One ticket each, branched from `dev` | Per-branch Preview URL | — |
| `hotfix/<slug>` | Urgent prod fix, branched from `main` | Preview | PR → `main`, then merge `main` back into `dev` |

## Day to day

```bash
git checkout dev && git pull origin dev
git checkout -b feat/BC-12-multi-role-accounts   # ticket id in the name
# …commit…
git push -u origin feat/BC-12-multi-role-accounts
# open PR → base: dev   (title: "BC-12: Multi-role accounts")
```

- **PR → `dev`**: CI green (build · tsc · lint, + tests once they land), 1 review,
  QA checks the branch Preview against the ticket's acceptance criteria.
  **Squash merge**; delete the branch.
- **Release `dev` → `main`**: at sprint end (or on demand). Open a PR
  `dev → main` titled `Release YYYY-MM-DD`, run the release checklist in
  `docs/SPRINTS.md` on the `dev` Preview, then **merge commit** (not squash, so
  `dev` and `main` stay in sync). Apply any schema changes to prod per
  `docs/DEPLOYMENT.md`. Tag `vYYYY.MM.DD`.
- **`promotion-guard`** CI check rejects PRs into `main` whose head isn't `dev`
  or `hotfix/*`.

## One-time GitHub setup (repo admin, ~3 min)

1. **Settings → General → Default branch → `main`** (currently
   `claude/tender-wright-04kyoq`, which is identical to `main` and can be
   deleted after the switch).
2. **Settings → Branches → Add rule `main`:** require PR, require status checks
   **CI / build** and **Promotion guard / guard**, block force pushes.
3. **Add rule `dev`:** require PR, require **CI / build**, block force pushes.
4. **Vercel → Settings → Git → Production Branch = `main`.** `dev` and feature
   branches deploy as Previews; scope env vars per `docs/DEPLOYMENT.md`.
