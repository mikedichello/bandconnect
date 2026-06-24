// Auto-selects the Prisma datasource provider from DATABASE_URL so the same
// repo runs SQLite locally (file: URL) and Postgres in production (postgres URL)
// with no manual schema edits. Prisma doesn't allow env() for `provider`, so we
// rewrite the line in a prebuild step. Idempotent.
import { readFileSync, writeFileSync } from "node:fs";

const SCHEMA = "prisma/schema.prisma";
const url = process.env.DATABASE_URL || "";
const provider = /^postgres(ql)?:\/\//i.test(url) ? "postgresql" : "sqlite";

const current = readFileSync(SCHEMA, "utf8");
const next = current.replace(/provider = "(?:sqlite|postgresql)"/, `provider = "${provider}"`);

if (next !== current) {
  writeFileSync(SCHEMA, next);
  console.log(`[db] schema provider → ${provider}`);
} else {
  console.log(`[db] schema provider already ${provider}`);
}
