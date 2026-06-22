"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";

export interface ChecklistStep {
  label: string;
  done: boolean;
  href: string;
}

const KEY = "bc_onboarding_dismissed";

export function OnboardingChecklist({ steps }: { steps: ChecklistStep[] }) {
  const [dismissed, setDismissed] = useState(true); // start hidden to avoid flash
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  useEffect(() => {
    setDismissed(localStorage.getItem(KEY) === "1");
  }, []);

  if (allDone || dismissed) return null;

  function dismiss() {
    localStorage.setItem(KEY, "1");
    setDismissed(true);
  }

  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <section className="relative overflow-hidden rounded-2xl border border-brand-400/30 p-6">
      <div className="aurora absolute inset-0 -z-10 opacity-60" />
      <button
        onClick={dismiss}
        className="absolute right-3 top-3 text-zinc-400 hover:text-white"
        aria-label="Dismiss checklist"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>

      <h2 className="text-lg font-semibold">Get set up on BandConnect</h2>
      <p className="mt-1 text-sm text-zinc-300">
        {doneCount} of {steps.length} done — finish these to get the most out of your profile.
      </p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ul className="mt-4 space-y-2">
        {steps.map((s) => (
          <li key={s.label}>
            {s.done ? (
              <span className="flex items-center gap-3 text-sm text-zinc-400">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500/20 text-emerald-300">
                  <Check className="h-3 w-3" aria-hidden="true" />
                </span>
                <span className="line-through">{s.label}</span>
              </span>
            ) : (
              <Link href={s.href} className="flex items-center gap-3 text-sm text-zinc-100 hover:text-brand-200">
                <span className="grid h-5 w-5 place-items-center rounded-full border border-white/20" aria-hidden="true" />
                {s.label}
                <span className="ml-auto text-xs text-brand-300">Do it →</span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
