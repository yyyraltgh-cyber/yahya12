"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGamification } from "@/components/gamification/gamification-context";
import { useTranslation } from "@/lib/i18n/locale-context";
import { awardXp, XP_REWARDS, checkCountAchievement } from "@/lib/gamification";
import type { Database } from "@/lib/types/database";

type Habit = Database["public"]["Tables"]["habits"]["Row"];

export function HabitList({
  initialHabits,
  loggedHabitIds,
  userId,
}: {
  initialHabits: Habit[];
  loggedHabitIds: string[];
  userId: string;
}) {
  const supabase = createClient();
  const { celebrate, refreshStats } = useGamification();
  const { t } = useTranslation();
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [logged, setLogged] = useState<Set<string>>(new Set(loggedHabitIds));
  const [name, setName] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  async function addHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: userId, name: name.trim() })
      .select()
      .single();

    if (!error && data) {
      setHabits([...habits, data]);
      setName("");
    }
  }

  async function toggleToday(habit: Habit) {
    const isLogged = logged.has(habit.id);
    const next = new Set(logged);

    if (isLogged) {
      await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habit.id)
        .eq("logged_on", today);
      next.delete(habit.id);
    } else {
      await supabase.from("habit_logs").insert({
        habit_id: habit.id,
        user_id: userId,
        logged_on: today,
      });
      next.add(habit.id);

      const reason = t("habits.loggedReason");
      const result = await awardXp(supabase, userId, XP_REWARDS.habit_log, reason, "habit", habit.id);
      if (result) celebrate(result, XP_REWARDS.habit_log, reason);

      const firstAch = await checkCountAchievement(supabase, userId, "first_habit", next.size, 1);
      if (firstAch) {
        celebrate(
          { newXp: 0, oldLevel: 0, newLevel: 0, leveledUp: false, newStreak: 0, streakExtended: false, unlockedAchievements: [firstAch] },
          0,
          ""
        );
      }
      refreshStats();
    }
    setLogged(next);
  }

  async function deleteHabit(id: string) {
    const { error } = await supabase.from("habits").delete().eq("id", id);
    if (!error) setHabits(habits.filter((h) => h.id !== id));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={addHabit} className="mb-4 flex gap-2">
        <Input
          placeholder={t("habits.placeholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">{t("common.add")}</Button>
      </form>

      <div className="flex flex-col gap-2">
        {habits.length === 0 && (
          <Card className="text-center text-sm text-[var(--color-text-muted)]">
            {t("habits.empty")}
          </Card>
        )}
        {habits.map((habit) => {
          const done = logged.has(habit.id);
          return (
            <Card key={habit.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleToday(habit)}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-colors",
                    done
                      ? "border-[var(--color-success)] bg-[var(--color-success)]"
                      : "border-[var(--color-border)]"
                  )}
                  aria-label={done ? t("habits.markIncomplete") : t("habits.markComplete")}
                />
                <span className={cn(done && "text-[var(--color-text-muted)]")}>
                  {habit.name}
                </span>
              </div>
              <Button variant="ghost" onClick={() => deleteHabit(habit.id)}>
                {t("common.delete")}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
