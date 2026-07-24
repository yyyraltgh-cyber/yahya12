"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { Task, Habit, Routine } from "@/lib/types/database";

/**
 * Display + navigation only — deliberately not interactive. Checking off a
 * task/habit or advancing a routine step already has a canonical, tested
 * implementation (with XP awarding + achievement checks) in TaskList /
 * HabitList / RoutineList. Duplicating that side-effect logic here would
 * risk it drifting out of sync, so this panel just surfaces what needs
 * attention and links to where the real action already lives.
 */
export function TodayPriorities({
  overdueTasks,
  pendingHabits,
  unfinishedRoutines,
}: {
  overdueTasks: Task[];
  pendingHabits: Habit[];
  unfinishedRoutines: Routine[];
}) {
  const { t } = useTranslation();
  const hasAnything =
    overdueTasks.length > 0 || pendingHabits.length > 0 || unfinishedRoutines.length > 0;

  return (
    <div>
      <h3 className="mb-2 font-medium">{t("today.priorities")}</h3>

      {!hasAnything && <EmptyState message={t("today.allCaughtUp")} />}

      <div className="flex flex-col gap-3">
        {overdueTasks.length > 0 && (
          <Card>
            <p className="mb-2 text-sm font-medium text-[var(--color-danger)]">
              {t("today.overdueTasksHeading")}
            </p>
            <ul className="flex flex-col gap-1">
              {overdueTasks.map((task) => (
                <li key={task.id}>
                  <Link href="/tasks" className="text-sm hover:text-[var(--color-primary)]">
                    {task.title}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {pendingHabits.length > 0 && (
          <Card>
            <p className="mb-2 text-sm font-medium">{t("today.habitsTodayHeading")}</p>
            <ul className="flex flex-wrap gap-2">
              {pendingHabits.map((habit) => (
                <li key={habit.id}>
                  <Link
                    href="/habits"
                    className="rounded-full bg-[var(--color-surface-hover)] px-3 py-1 text-sm hover:text-[var(--color-primary)]"
                  >
                    {habit.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {unfinishedRoutines.length > 0 && (
          <Card>
            <p className="mb-2 text-sm font-medium">{t("today.unfinishedRoutinesHeading")}</p>
            <ul className="flex flex-col gap-1">
              {unfinishedRoutines.map((routine) => (
                <li key={routine.id}>
                  <Link href="/routines" className="text-sm hover:text-[var(--color-primary)]">
                    {routine.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
