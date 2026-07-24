"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthGuard } from "@/lib/use-auth-guard";
import { useSuggestions } from "@/lib/use-suggestions";
import { useTranslation } from "@/lib/i18n/locale-context";
import { AppShell } from "@/components/layout/app-shell";
import { LoadingScreen } from "@/components/layout/loading-screen";
import { Card } from "@/components/ui/card";
import { TodayHeader } from "@/components/today/today-header";
import { TodayPriorities } from "@/components/today/today-priorities";
import { TodayProgress } from "@/components/today/today-progress";
import { todayISO } from "@/lib/utils";
import type { Task, Habit, Routine, CalendarEvent } from "@/lib/types/database";

interface TodayData {
  name: string | null;
  overdueTasks: Task[];
  pendingHabits: Habit[];
  habitsDoneToday: number;
  habitsTotal: number;
  unfinishedRoutines: Routine[];
  upcomingEvents: CalendarEvent[];
  achievementsUnlocked: number;
  achievementsTotal: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuthGuard();
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const [data, setData] = useState<TodayData | null>(null);

  // Business logic already exists in lib/use-suggestions.ts and the engine
  // it wraps — this page only renders what the hook returns.
  const { suggestions, dismiss } = useSuggestions(user?.id);

  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    (async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarded,full_name")
        .eq("id", user.id)
        .single();

      if (profile && profile.onboarded === false) {
        router.replace("/onboarding");
        return;
      }

      const today = todayISO();

      const [tasksRes, habitsRes, habitLogsRes, routinesRes, eventsRes, achievementsRes, unlockedRes] =
        await Promise.all([
          supabase.from("tasks").select("*").eq("user_id", user.id).neq("status", "done"),
          supabase.from("habits").select("*").eq("user_id", user.id),
          supabase.from("habit_logs").select("habit_id").eq("user_id", user.id).eq("logged_on", today),
          supabase.from("routines").select("*").eq("user_id", user.id),
          supabase
            .from("events")
            .select("*")
            .eq("user_id", user.id)
            .gte("starts_at", new Date().toISOString())
            .order("starts_at")
            .limit(5),
          supabase.from("achievements").select("*", { count: "exact", head: true }),
          supabase.from("user_achievements").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        ]);

      const tasks = tasksRes.data ?? [];
      const habits = habitsRes.data ?? [];
      const loggedHabitIds = new Set((habitLogsRes.data ?? []).map((l) => l.habit_id));
      const routines = routinesRes.data ?? [];

      // Same "overdue" condition already codified in
      // lib/suggestions/task-rules.ts (status !== done, due_date set and in
      // the past) — reused here for the list view, not reinvented.
      const overdueTasks = tasks.filter((t) => t.due_date !== null && t.due_date < today);

      // Broader than the Suggestion Engine's routine rule on purpose: this
      // panel lists anything not fully done today (including untouched
      // routines), while the engine's nudge specifically targets routines
      // the user already started but didn't finish. Two different
      // consumers, two intentionally different (both simple) criteria.
      const unfinishedRoutines = routines.filter(
        (r) => r.steps.length > 0 && r.steps.some((s) => !s.done)
      );

      setData({
        name: profile?.full_name ?? null,
        overdueTasks,
        pendingHabits: habits.filter((h) => !loggedHabitIds.has(h.id)),
        habitsDoneToday: loggedHabitIds.size,
        habitsTotal: habits.length,
        unfinishedRoutines,
        upcomingEvents: eventsRes.data ?? [],
        achievementsUnlocked: unlockedRes.count ?? 0,
        achievementsTotal: achievementsRes.count ?? 0,
      });
      setReady(true);
    })();
  }, [user, router]);

  if (loading || !user || !ready || !data) return <LoadingScreen />;

  return (
    <AppShell title={t("nav.dashboard")} userId={user.id}>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <TodayHeader
          name={data.name}
          habitsDoneToday={data.habitsDoneToday}
          habitsTotalToday={data.habitsTotal}
        />

        <TodayPriorities
          overdueTasks={data.overdueTasks}
          pendingHabits={data.pendingHabits}
          unfinishedRoutines={data.unfinishedRoutines}
        />

        <div>
          <h3 className="mb-2 font-medium">{t("today.smartSuggestions")}</h3>
          {suggestions.length === 0 ? (
            <Card className="text-sm text-[var(--color-text-muted)]">{t("today.noSuggestions")}</Card>
          ) : (
            <div className="flex flex-col gap-2">
              {suggestions.map((s) => (
                <Card key={s.key} className="flex items-start justify-between gap-3 p-3">
                  <Link href={s.action.href} className="flex-1">
                    <p className="text-sm font-medium">{t(s.titleKey, s.titleVars)}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {t(s.descriptionKey, s.descriptionVars)}
                    </p>
                  </Link>
                  <button
                    onClick={() => dismiss(s.key)}
                    className="shrink-0 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    {t("today.dismiss")}
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2 font-medium">{t("today.upcomingEvents")}</h3>
          {data.upcomingEvents.length === 0 ? (
            <Card className="text-sm text-[var(--color-text-muted)]">
              {t("today.noUpcomingEvents")}{" "}
              <Link href="/calendar" className="text-[var(--color-primary)]">
                {t("today.addOne")}
              </Link>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {data.upcomingEvents.map((ev) => (
                <Card key={ev.id} className="flex items-center justify-between p-3">
                  <span>{ev.title}</span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {new Date(ev.starts_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>

        <TodayProgress
          userId={user.id}
          achievementsUnlocked={data.achievementsUnlocked}
          achievementsTotal={data.achievementsTotal}
        />
      </div>
    </AppShell>
  );
}
