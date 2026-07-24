"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { XpBar } from "@/components/gamification/xp-bar";
import { StreakBadge } from "@/components/gamification/streak-badge";
import { useGamification } from "@/components/gamification/gamification-context";
import { useDailyGoal } from "@/lib/use-daily-goal";
import { useTranslation } from "@/lib/i18n/locale-context";

/**
 * Reuses the existing XpBar/StreakBadge components (already used in the
 * topbar) instead of building new gamification widgets — avoids a
 * near-duplicate of components that already render level/XP/streak.
 *
 * Reads xp/currentStreak from useGamification() directly rather than via
 * props: this component is rendered as a descendant of GamificationProvider
 * (through AppShell's `children` slot), so it has correct access to the
 * context. The parent page (app/dashboard/page.tsx) is NOT a descendant of
 * that provider — it's the ancestor that renders <AppShell> — so it cannot
 * call useGamification() itself and pass the values down as props.
 */
export function TodayProgress({
  userId,
  achievementsUnlocked,
  achievementsTotal,
}: {
  userId: string;
  achievementsUnlocked: number;
  achievementsTotal: number;
}) {
  const { t } = useTranslation();
  const { xp, currentStreak } = useGamification();
  const { targets } = useDailyGoal(userId);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{t("today.progressSummary")}</h3>
        <Link href="/achievements" className="text-xs text-[var(--color-primary)]">
          {t("today.viewAll")}
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <XpBar xp={xp} />
        <StreakBadge streak={currentStreak} />
        <Link
          href="/achievements"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
        >
          {t("today.achievementsUnlocked", { unlocked: achievementsUnlocked, total: achievementsTotal })}
        </Link>
      </div>
      <div className="mt-3 border-t border-[var(--color-border)] pt-3">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">{t("today.todaysGoal")}</p>
        <p className="text-sm">
          {t("today.goalSummary", {
            tasks: targets.tasksTarget,
            habits: targets.habitsTarget,
            routines: targets.routinesTarget,
          })}
        </p>
      </div>
    </Card>
  );
}
