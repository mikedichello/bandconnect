import { notFound } from "next/navigation";
import Link from "next/link";
import { Globe } from "lucide-react";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { AdminVerifyButtons } from "@/components/dashboard/AdminVerifyButton";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const user = await requireUser();
  if (!isAdmin(user.email)) notFound();

  const pending = await prisma.profile.findMany({
    where: { verificationStatus: "pending" },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Verification queue</h1>
        <p className="text-sm text-subtle">{pending.length} request{pending.length === 1 ? "" : "s"} awaiting review.</p>
      </div>

      {pending.length === 0 ? (
        <p className="card p-6 text-sm text-subtle">Nothing pending.</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((p) => (
            <li key={p.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link href={`/p/${p.slug}`} target="_blank" className="font-semibold text-fg hover:text-brand-700 dark:hover:text-brand-200">{p.displayName}</Link>
                  <span className="badge text-[10px] capitalize">{p.type.toLowerCase()}</span>
                </div>
                {p.websiteUrl && (
                  <p className="flex items-center gap-1.5 text-xs text-subtle">
                    <Globe className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{p.websiteUrl}</span>
                  </p>
                )}
                {p.verificationInfo && <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{p.verificationInfo}</p>}
              </div>
              <AdminVerifyButtons profileId={p.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
