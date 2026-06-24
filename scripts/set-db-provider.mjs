// Selects the Prisma datasource from the environment so the same repo runs:
//   • SQLite locally          (DATABASE_URL=file:…)
//   • Postgres in production   — either the Vercel/Supabase integration vars
//     (POSTGRES_PRISMA_URL pooled + POSTGRES_URL_NON_POOLING direct), or a plain
//     DATABASE_URL (Neon/Railway/etc.).
// Prisma doesn't allow env() for `provider`/`url`, so we rewrite the datasource
// block in a prebuild step. Idempotent — only writes when the block changes.
import { readFileSync, writeFileSync } from "node:fs";

const SCHEMA = "prisma/schema.prisma";
const dbUrl = process.env.DATABASE_URL || "";
const hasSupabase = Boolean(process.env.POSTGRES_PRISMA_URL);
const isPostgres = hasSupabase || /^postgres(ql)?:\/\//i.test(dbUrl);

let block, label;
if (!isPostgres) {
  label = "sqlite";
  block = `datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}`;
} else if (hasSupabase) {
  // Vercel + Supabase/Postgres integration: pooled for the app, direct for migrations.
  label = "postgresql (supabase: pooled + direct)";
  block = `datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}`;
} else {
  label = "postgresql";
  block = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}`;
}

const current = readFileSync(SCHEMA, "utf8");
const next = current.replace(/datasource db \{[\s\S]*?\n\}/, block);
if (next !== current) {
  writeFileSync(SCHEMA, next);
  console.log(`[db] datasource → ${label}`);
} else {
  console.log(`[db] datasource already ${label}`);
}
