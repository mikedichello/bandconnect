// Optional demo seeding for preview/dev deploys. GUARDED by DEMO_SEED=1 — it
// WIPES and reseeds the database with CT sample data, so it must NEVER be set on
// a real/production project. No-op (and safe) when DEMO_SEED is unset, so adding
// it to the build script doesn't affect normal/production builds.
import { execSync } from "node:child_process";

if (process.env.DEMO_SEED !== "1") {
  console.log("[demo-seed] skipped (set DEMO_SEED=1 only on a throwaway demo DB)");
  process.exit(0);
}

console.log("[demo-seed] DEMO_SEED=1 → pushing schema + seeding demo data (wipes existing rows)");
execSync("prisma db push --skip-generate --accept-data-loss", { stdio: "inherit" });
execSync("tsx prisma/seed.ts", { stdio: "inherit" });
