import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Deployment health check — open /api/health in a browser after a deploy.
 * Reports only booleans and short status codes (never secrets or URLs) so the
 * common "Application error" causes are diagnosable without server logs:
 *   • database.status "missing_tables" → run `npm run db:push` against prod, or
 *     set DB_PUSH_ON_BUILD=1 and redeploy (see docs/DEPLOYMENT.md)
 *   • config.NEXTAUTH_SECRET false     → every page with a session check fails
 */
export async function GET() {
  const config = {
    database_url: Boolean(process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL),
    NEXTAUTH_SECRET: Boolean(process.env.NEXTAUTH_SECRET),
    NEXTAUTH_URL: Boolean(process.env.NEXTAUTH_URL),
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    resend: Boolean(process.env.RESEND_API_KEY),
    CRON_SECRET: Boolean(process.env.CRON_SECRET),
  };

  let database: { status: string; code?: string; users?: number };
  try {
    const users = await prisma.user.count();
    database = { status: "ok", users };
  } catch (e) {
    const code = (e as { code?: string })?.code;
    const message = e instanceof Error ? e.message : "";
    database =
      code === "P2021"
        ? { status: "missing_tables", code }
        : /Environment variable not found|datasource/i.test(message)
          ? { status: "not_configured", code }
          : code === "P1001" || code === "P1000"
            ? { status: "unreachable", code }
            : { status: "error", code: code ?? "unknown" };
  }

  const ok = database.status === "ok" && config.database_url && config.NEXTAUTH_SECRET;
  return NextResponse.json({ ok, database, config }, { status: ok ? 200 : 503 });
}
