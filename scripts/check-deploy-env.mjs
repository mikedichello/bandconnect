// Fails a Vercel build that is missing the config the app cannot run without.
// ---------------------------------------------------------------------------
// Without a Postgres URL, set-db-provider.mjs falls back to SQLite, the build
// still succeeds, and every page then 500s at runtime ("Application error").
// A failed build is the better outcome: Vercel keeps serving the last good
// deployment and the build log says exactly what to set.
//
// Runs only on Vercel (VERCEL=1). Local dev, CI and Docker builds are untouched.
const onVercel = process.env.VERCEL === "1";

if (!onVercel) process.exit(0);

const dbUrl = process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL || "";
const missing = [];
if (!/^postgres(ql)?:\/\//i.test(dbUrl)) {
  missing.push(
    "a Postgres URL — connect the Supabase/Postgres integration (sets POSTGRES_PRISMA_URL) or set DATABASE_URL",
  );
}
if (!process.env.NEXTAUTH_SECRET) {
  missing.push("NEXTAUTH_SECRET — generate with `openssl rand -base64 32`");
}

if (missing.length) {
  console.error(`\n[deploy-env] ${process.env.VERCEL_ENV ?? "vercel"} build is missing required config:`);
  for (const m of missing) console.error(`  • ${m}`);
  console.error("[deploy-env] Set these in Vercel → Project → Settings → Environment Variables, then redeploy.");
  console.error("[deploy-env] See docs/DEPLOYMENT.md → First-deploy checklist.\n");
  process.exit(1);
}
console.log("[deploy-env] required config present");
