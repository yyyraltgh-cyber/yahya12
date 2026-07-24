"use client";

import { levelProgress } from "@/lib/gamification";

/**
 * Compact level badge + animated XP progress bar. Designed for the topbar.
 */
export function XpBar({ xp }: { xp: number }) {
  const { level, xpIntoLevel, xpForNextLevel, progressPct } = levelProgress(xp);

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-[11px] font-bold text-white">
        {level}
      </div>
      <div className="hidden w-24 flex-col gap-0.5 sm:flex">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="animate-xp-fill h-full rounded-full bg-[var(--color-primary)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-[10px] text-[var(--color-text-muted)]">
          {xpIntoLevel}/{xpForNextLevel} XP
        </span>
      </div>
    </div>
  );
}
