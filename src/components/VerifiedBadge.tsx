import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Verified" trust badge. Icon-only by default (with an sr-only label); pass
 * `showLabel` for visible text. Colors meet WCAG AA in both themes. Safe to use
 * in Server Components (no client JS).
 */
export function VerifiedBadge({ showLabel = false, className }: { showLabel?: boolean; className?: string }) {
  return (
    <span title="Verified" className={cn("inline-flex items-center gap-1 text-sky-700 dark:text-sky-300", className)}>
      <BadgeCheck className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      {showLabel ? <span className="text-xs font-semibold">Verified</span> : null}
      <span className="sr-only">Verified account</span>
    </span>
  );
}
