"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { AchievementGrid } from "./achievement-grid";
import { levelProgress } from "@/lib/gamification";
import { useTranslation } from "@/lib/i18n/locale-context";
import { Card } from "@/components/ui/card";
import type { Achievement } from "@/lib/types/database";

export default function AchievementsPage() {
  const { user, loading } = useAuthGuard();
  const { t } = useTranslation();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState({ current: 0, longest: 0 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    (async () => {
      const [{ data: catalog }, { data: unlocked }, { data: profile }] = await Promise.all([
        supabase.from("achievements").select("*").order("sort_order"),
        supabase.from("user_achievements").select("achievement_id").eq("user_id", user.id),
        supabase.from("profiles").select("xp,current_streak,longest_streak").eq("id", user.id).single(),
      ]);
      setAchievements(catalog ?? []);
      setUnlockedIds(new Set((unlocked ?? []).map((u) => u.achievement_id)));
      setXp(profile?.xp ?? 0);
      setStreak({ current: profile?.current_streak ?? 0, longest: profile?.longest_streak ?? 0 });
      setReady(true);
    })();
  }, [user]);

  if (loading || !user || !ready) return <LoadingScreen />;

  const { level, xpIntoLevel, xpForNextLevel, progressPct } = levelProgress(xp);

  return (
    <AppShell title={t("nav.achievements")} userId={user.id}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card className="text-center">
            <p className="text-sm text-[var(--color-text-muted)]">{t("achievements.level")}</p>
            <p className="mt-1 text-3xl font-bold text-[var(--color-primary)]">{level}</p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">{xpIntoLevel}/{xpForNextLevel} {t("gamification.xp")}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-[var(--color-text-muted)]">{t("achievements.currentStreak")}</p>
            <p className="mt-1 text-3xl font-bold text-[var(--color-warning)]">🔥 {streak.current}</p>
            <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">{t("achievements.best", { days: streak.longest })}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-[var(--color-text-muted)]">{t("achievements.totalXp")}</p>
            <p className="mt-1 text-3xl font-bold">{xp}</p>
            <p className="mt-1 text-[10px] text-[var(--color-text-muted)]">
              {t("achievements.badgesCount", { unlocked: unlockedIds.size, total: achievements.length })}
            </p>
          </Card>
        </div>

        <AchievementGrid achievements={achievements} unlockedIds={unlockedIds} />
      </div>
    </AppShell>
  );
}
