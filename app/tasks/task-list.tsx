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

type Task = Database["public"]["Tables"]["tasks"]["Row"];

export function TaskList({
  initialTasks,
  userId,
}: {
  initialTasks: Task[];
  userId: string;
}) {
  const supabase = createClient();
  const { celebrate, refreshStats } = useGamification();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [title, setTitle] = useState("");

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert({ user_id: userId, title: title.trim() })
      .select()
      .single();

    if (!error && data) {
      setTasks([data, ...tasks]);
      setTitle("");
    }
  }

  async function toggleTask(task: Task) {
    const nextStatus = task.status === "done" ? "todo" : "done";
    const { error } = await supabase
      .from("tasks")
      .update({ status: nextStatus })
      .eq("id", task.id);

    if (!error) {
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));

      // Award XP only when marking a task as done (not when un-checking it).
      if (nextStatus === "done") {
        const reason = t("tasks.completedReason");
        const result = await awardXp(supabase, userId, XP_REWARDS.task_complete, reason, "task", task.id);
        if (result) celebrate(result, XP_REWARDS.task_complete, reason);

        const doneCount = tasks.filter((t) => t.status === "done").length + 1;
        const firstAch = await checkCountAchievement(supabase, userId, "first_task", doneCount, 1);
        const tenAch = await checkCountAchievement(supabase, userId, "tasks_10", doneCount, 10);
        const fiftyAch = await checkCountAchievement(supabase, userId, "tasks_50", doneCount, 50);
        for (const ach of [firstAch, tenAch, fiftyAch]) {
          if (ach) celebrate({ newXp: 0, oldLevel: 0, newLevel: 0, leveledUp: false, newStreak: 0, streakExtended: false, unlockedAchievements: [ach] }, 0, "");
        }
        refreshStats();
      }
    }
  }

  async function deleteTask(id: string) {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (!error) setTasks(tasks.filter((t) => t.id !== id));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={addTask} className="mb-4 flex gap-2">
        <Input
          placeholder={t("tasks.addPlaceholder")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Button type="submit">{t("common.add")}</Button>
      </form>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 && (
          <Card className="text-center text-sm text-[var(--color-text-muted)]">
            {t("tasks.empty")}
          </Card>
        )}
        {tasks.map((task) => (
          <Card key={task.id} className="flex items-center justify-between p-3">
            <label className="flex flex-1 items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={task.status === "done"}
                onChange={() => toggleTask(task)}
                className="h-4 w-4"
              />
              <span
                className={cn(
                  task.status === "done" && "line-through text-[var(--color-text-muted)]"
                )}
              >
                {task.title}
              </span>
            </label>
            <Button variant="ghost" onClick={() => deleteTask(task.id)}>
              {t("common.delete")}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
