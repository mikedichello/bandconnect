// Optional demo seeding for preview/dev deploys. It WIPES and reseeds the
// database with CT sample data, so it is double-guarded:
//   1. No-op unless DEMO_SEED=1 (safe to leave in the build script).
//   2. scripts/db-guard.mjs must confirm the target is a throwaway DB (local, or
//      remote host === DEMO_DB_HOST and empty/demo-marked). If not, the BUILD
//      FAILS — loudly — so a mis-set DEMO_SEED on production can never wipe it;
//      the previous deployment stays live.
import { execSync } from "node:child_process";
import { checkDestructiveTarget } from "./db-guard.mjs";

if (process.env.DEMO_SEED !== "1") {
  console.log("[demo-seed] skipped (set DEMO_SEED=1 only on a throwaway demo DB)");
  process.exit(0);
}

const decision = await checkDestructiveTarget("demo-seed");
if (!decision.ok) {
  console.error(
    "[demo-seed] ABORTING BUILD: DEMO_SEED=1 but the database is not a verified demo DB.\n" +
      "  Fix: unset DEMO_SEED on this project, or set DEMO_DB_HOST to the demo database host.",
  );
  process.exit(1);
}

console.log("[demo-seed] pushing schema + seeding demo data (wipes existing rows)");
execSync("prisma db push --skip-generate --accept-data-loss", { stdio: "inherit" });
execSync("tsx prisma/seed.ts", { stdio: "inherit" });
