"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { XpAwardResult } from "@/lib/gamification";

interface Toast {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
}

interface GamificationContextValue {
  xp: number;
  currentStreak: number;
  longestStreak: number;
  streakFreezesAvailable: number;
  statsLoaded: boolean;
  refreshStats: () => Promise<void>;
  celebrate: (result: XpAwardResult, amount: number, xpReason: string) => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

/** Access XP/streak stats and the celebration trigger from any page under GamificationProvider. */
export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error("useGamification must be used within GamificationProvider");
  return ctx;
}

const ICONS = { xp: "✨", level: "🎉", achievement: "🏆", streak: "🔥", freeze: "🧊" };

/**
 * Combines XP/streak state (for the topbar badge) with a toast-based
 * celebration system (for XP/level/streak/achievement notifications).
 * Wrap any authenticated page tree with this once the user is known.
 */
export function GamificationProvider({
  userId,
  children,
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const [xp, setXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [streakFreezesAvailable, setStreakFreezesAvailable] = useState(0);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const { t } = useTranslation();

  const refreshStats = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("xp,current_streak,longest_streak,streak_freezes_available")
      .eq("id", userId)
      .single();
    if (data) {
      setXp(data.xp);
      setCurrentStreak(data.current_streak);
      setLongestStreak(data.longest_streak);
      setStreakFreezesAvailable(data.streak_freezes_available);
    }
    setStatsLoaded(true);
  }, [userId]);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    const id = `t${counter.current++}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3200);
  }, []);

  const celebrate = useCallback(
    (result: XpAwardResult, amount: number, xpReason: string) => {
      if (amount > 0) {
        push({ title: `+${amount} XP`, subtitle: xpReason, icon: ICONS.xp });
      }
      if (result.leveledUp) {
        push({ title: `Level ${result.newLevel}!`, subtitle: "You leveled up", icon: ICONS.level });
      }
      if (result.streakExtended && result.newStreak > 1) {
        push({ title: `${result.newStreak}-day streak!`, subtitle: "Keep it going", icon: ICONS.streak });
      }
      for (const ach of result.unlockedAchievements) {
        push({ title: ach.title, subtitle: ach.description, icon: ICONS.achievement });
      }
      if (result.freezeConsumed) {
        push({
          title: t("gamification.streakFreezeUsedTitle"),
          subtitle: t("gamification.streakFreezeUsedBody", { streak: result.newStreak }),
          icon: ICONS.freeze,
        });
      }
      setXp(result.newXp);
      setCurrentStreak(result.newStreak);
      if (result.newFreezesAvailable !== undefined) {
        setStreakFreezesAvailable(result.newFreezesAvailable);
      }
    },
    [push, t]
  );

  return (
    <GamificationContext.Provider
      value={{ xp, currentStreak, longestStreak, streakFreezesAvailable, statsLoaded, refreshStats, celebrate }}
    >
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-celebration-in pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 shadow-lg"
          >
            <span className="text-2xl">{t.icon}</span>
            <div>
              <p className="text-sm font-semibold">{t.title}</p>
              {t.subtitle && <p className="text-xs text-[var(--color-text-muted)]">{t.subtitle}</p>}
            </div>
          </div>
        ))}
      </div>
    </GamificationContext.Provider>
  );
}
