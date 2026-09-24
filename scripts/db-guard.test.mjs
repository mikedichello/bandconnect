// Run: npm run test:scripts  (node:test — no deps; Vitest lands in S0-07)
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveDbTarget, decide } from "./db-guard.mjs";

const PROD = "postgresql://app:s3cret@db.prod-abc.supabase.co:5432/postgres";
const DEMO = "postgresql://app:s3cret@db.demo-xyz.supabase.co:5432/postgres";

test("resolves SQLite, local and remote Postgres; redacts password", () => {
  assert.equal(resolveDbTarget({ DATABASE_URL: "file:./dev.db" }).kind, "sqlite");
  const t = resolveDbTarget({ DATABASE_URL: PROD });
  assert.equal(t.kind, "postgres");
  assert.equal(t.host, "db.prod-abc.supabase.co");
  assert.ok(!t.display.includes("s3cret"), "password must be redacted");
  assert.equal(resolveDbTarget({}).kind, "none");
});

test("follows Supabase integration precedence (direct > pooled > DATABASE_URL)", () => {
  const t = resolveDbTarget({
    POSTGRES_URL_NON_POOLING: DEMO,
    POSTGRES_PRISMA_URL: PROD,
    DATABASE_URL: "file:./dev.db",
  });
  assert.equal(t.host, "db.demo-xyz.supabase.co");
});

test("local targets are always allowed", () => {
  assert.equal(decide(resolveDbTarget({ DATABASE_URL: "file:./dev.db" }), {}).ok, true);
  assert.equal(decide(resolveDbTarget({ DATABASE_URL: "postgresql://u:p@localhost:5432/bc" }), {}).ok, true);
  assert.equal(decide(resolveDbTarget({ DATABASE_URL: "postgres://u:p@127.0.0.1/bc" }), {}).ok, true);
});

test("remote DB is BLOCKED without DEMO_DB_HOST (the production case)", () => {
  const d = decide(resolveDbTarget({ DATABASE_URL: PROD }), {}, { empty: false, hasMarker: true });
  assert.equal(d.ok, false);
  assert.match(d.reason, /DEMO_DB_HOST is not set/);
});

test("remote DB is BLOCKED when host does not match DEMO_DB_HOST", () => {
  const env = { DEMO_DB_HOST: "db.demo-xyz.supabase.co" };
  const d = decide(resolveDbTarget({ DATABASE_URL: PROD }), env, { empty: true, hasMarker: false });
  assert.equal(d.ok, false);
  assert.match(d.reason, /≠ DEMO_DB_HOST/);
});

test("matching host but real data and no demo marker is BLOCKED", () => {
  const env = { DEMO_DB_HOST: "DB.demo-xyz.supabase.co " }; // case/space-insensitive
  const d = decide(resolveDbTarget({ DATABASE_URL: DEMO }), env, { empty: false, hasMarker: false });
  assert.equal(d.ok, false);
  assert.match(d.reason, /no demo marker/);
});

test("matching host + empty or demo-marked DB is allowed", () => {
  const env = { DEMO_DB_HOST: "db.demo-xyz.supabase.co" };
  const t = resolveDbTarget({ DATABASE_URL: DEMO });
  assert.equal(decide(t, env, { empty: true, hasMarker: false }).ok, true);
  assert.equal(decide(t, env, { empty: false, hasMarker: true }).ok, true);
});

test("fails closed on inspection errors, missing state, or unknown URLs", () => {
  const env = { DEMO_DB_HOST: "db.demo-xyz.supabase.co" };
  const t = resolveDbTarget({ DATABASE_URL: DEMO });
  assert.equal(decide(t, env, { error: "P1001" }).ok, false);
  assert.equal(decide(t, env, null).ok, false);
  assert.equal(decide(resolveDbTarget({ DATABASE_URL: "mysql://x@y/z" }), env).ok, false);
  assert.equal(decide(resolveDbTarget({}), env).ok, false);
});
