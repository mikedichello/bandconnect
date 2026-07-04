// Optional schema sync during deploy builds.
// ---------------------------------------------------------------------------
// When DB_PUSH_ON_BUILD=1 is set in an environment (recommended for the dev/
// Preview environment), the build runs `prisma db push` so every deploy's
// database matches its code — no manual migration step when a feature branch
// changes prisma/schema.prisma.
//
// Safety:
//   • Runs only against Postgres (never the local SQLite file).
//   • Without DB_PUSH_ACCEPT_DATA_LOSS=1, a destructive change (dropped/
//     renamed column) FAILS the build instead of losing data. Enable that
//     flag only in the dev environment, never in production.
import { execSync } from "node:child_process";

const enabled = process.env.DB_PUSH_ON_BUILD === "1";
const directUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || "";
const isPostgres = Boolean(process.env.POSTGRES_PRISMA_URL) || /^postgres(ql)?:\/\//i.test(directUrl);

if (!enabled) {
  console.log("[db-sync] skipped — set DB_PUSH_ON_BUILD=1 to sync the schema on deploy");
  process.exit(0);
}
if (!isPostgres) {
  console.log("[db-sync] skipped — no Postgres URL in this environment (local SQLite uses `npm run db:push`)");
  process.exit(0);
}

const acceptDataLoss = process.env.DB_PUSH_ACCEPT_DATA_LOSS === "1" ? " --accept-data-loss" : "";
console.log(`[db-sync] prisma db push${acceptDataLoss ? " (data loss accepted — dev only!)" : ""}`);
execSync(`npx prisma db push --skip-generate${acceptDataLoss}`, { stdio: "inherit" });
