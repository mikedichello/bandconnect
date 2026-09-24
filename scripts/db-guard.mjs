// Safety guard for every command that WIPES the database: the demo-seed build
// step (scripts/demo-seed.mjs), `npm run db:seed` and `npm run db:reset`.
//
// A destructive run is allowed only when the target database is provably a
// throwaway one:
//   • local  — a SQLite file, or Postgres on localhost/127.0.0.1/::1; or
//   • remote — Postgres whose host EXACTLY equals $DEMO_DB_HOST **and** which is
//     either empty or already carries the demo marker (the seeded fan@demo.com
//     account).
// Anything else — including any unexpected error while inspecting the DB —
// refuses (fails closed). The target host is always logged, password redacted.
//
// CLI: `node scripts/db-guard.mjs [label]` exits 1 when refused.

import { pathToFileURL } from "node:url";

export const DEMO_MARKER_EMAIL = "fan@demo.com";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/** Which DB would Prisma hit? Mirrors scripts/set-db-provider.mjs precedence. */
export function resolveDbTarget(env = process.env) {
  const url = env.POSTGRES_URL_NON_POOLING || env.POSTGRES_PRISMA_URL || env.DATABASE_URL || "";
  if (!url) return { kind: "none", host: "", display: "(no database URL set)" };
  if (/^file:/i.test(url)) return { kind: "sqlite", host: "local-file", display: url };
  if (/^postgres(ql)?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      const host = u.hostname.toLowerCase();
      const display = `${u.protocol}//${u.username ? `${u.username}:***@` : ""}${u.host}${u.pathname}`;
      return { kind: "postgres", host, display };
    } catch {
      return { kind: "unknown", host: "", display: "(unparseable postgres URL)" };
    }
  }
  return { kind: "unknown", host: "", display: "(unrecognized database URL scheme)" };
}

/**
 * Pure decision. `state` describes the remote DB contents:
 * { empty: boolean, hasMarker: boolean } or { error: string } if inspection failed.
 */
export function decide(target, env = process.env, state = null) {
  if (target.kind === "sqlite") return { ok: true, reason: "local SQLite file" };
  if (target.kind === "postgres" && LOCAL_HOSTS.has(target.host)) {
    return { ok: true, reason: "local Postgres" };
  }
  if (target.kind !== "postgres") return { ok: false, reason: `refusing: ${target.display}` };

  const allowed = (env.DEMO_DB_HOST || "").trim().toLowerCase();
  if (!allowed) {
    return { ok: false, reason: `refusing: remote host "${target.host}" and DEMO_DB_HOST is not set` };
  }
  if (allowed !== target.host) {
    return { ok: false, reason: `refusing: host "${target.host}" ≠ DEMO_DB_HOST "${allowed}"` };
  }
  if (!state) return { ok: false, reason: "refusing: database contents were not inspected" };
  if (state.error) return { ok: false, reason: `refusing: could not inspect database (${state.error})` };
  if (state.empty) return { ok: true, reason: "DEMO_DB_HOST matches and database is empty" };
  if (state.hasMarker) return { ok: true, reason: "DEMO_DB_HOST matches and demo marker present" };
  return {
    ok: false,
    reason: `refusing: database has data but no demo marker (${DEMO_MARKER_EMAIL}) — this does not look like the demo DB`,
  };
}

/** Inspect the DB via Prisma. A missing User table (fresh DB) counts as empty. */
export async function inspectState() {
  let prisma;
  try {
    const { PrismaClient } = await import("@prisma/client");
    prisma = new PrismaClient();
    const users = await prisma.user.count();
    if (users === 0) return { empty: true, hasMarker: false };
    const marker = await prisma.user.findUnique({ where: { email: DEMO_MARKER_EMAIL }, select: { id: true } });
    return { empty: false, hasMarker: Boolean(marker) };
  } catch (e) {
    // P2021 = table does not exist → a brand-new database, safe to seed.
    if (e && e.code === "P2021") return { empty: true, hasMarker: false };
    const msg = (e && (e.code || e.message)) || String(e);
    return { error: String(msg).trim().split("\n").filter(Boolean).pop().slice(0, 200) };
  } finally {
    await prisma?.$disconnect().catch(() => {});
  }
}

/** Resolve + inspect (remote only) + decide + log. Returns the decision. */
export async function checkDestructiveTarget(label, env = process.env) {
  const target = resolveDbTarget(env);
  console.log(`[db-guard] ${label}: target ${target.display}`);
  const needsState = target.kind === "postgres" && !LOCAL_HOSTS.has(target.host) && Boolean(env.DEMO_DB_HOST);
  const state = needsState ? await inspectState() : null;
  const decision = decide(target, env, state);
  console.log(`[db-guard] ${label}: ${decision.ok ? "allowed" : "BLOCKED"} — ${decision.reason}`);
  return decision;
}

// CLI entry point (used by package.json db:seed / db:reset).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const decision = await checkDestructiveTarget(process.argv[2] || "destructive command");
  if (!decision.ok) process.exit(1);
}
