import { useEffect, useMemo, useRef, useState } from "react";
import { useGamification } from "@/components/gamification/gamification-context";
import { clampGrowthLevel, type AtmosphereState, type GrowthLevel } from "./types";

interface UseGardenInput {
  habitsDoneToday: number;
  habitsTotal: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  /** Already computed by the caller from existing overdue-task/unfinished-routine
   *  data (see app/dashboard/page.tsx) — no new query added here. */
  hasOverdue: boolean;
}

interface GardenState {
  growthLevel: GrowthLevel;
  atmosphere: AtmosphereState;
}

const CELEBRATION_DURATION_MS = 1600;
const NIGHT_START_HOUR = 20; // 8pm
const NIGHT_END_HOUR = 5; // 5am

/**
 * Converts existing application data into Garden state. No new queries, no
 * new data model — reads:
 *  - habitsDoneToday / habitsTotal, achievementsUnlocked / achievementsTotal,
 *    hasOverdue: passed in as props, already fetched by the Today/Dashboard
 *    screen (app/dashboard/page.tsx).
 *  - currentStreak: read directly from the existing GamificationProvider
 *    context (same pattern already used by components/today/today-progress.tsx).
 *
 * "tasks" and "goals" are NOT yet part of the growth formula: the Today
 * screen currently fetches overdue tasks only (a count, not a
 * completed-today count), and there is no "goals" data model in the
 * inspected repo (closest concept is user_journeys / long-term projects,
 * not fetched on this screen). Wiring either in would require a new query,
 * which the brief explicitly disallows — so they're left out rather than
 * faked. Documented here instead of silently ignored.
 */
export function useGarden(input: UseGardenInput): GardenState {
  const { currentStreak } = useGamification();

  const prevDoneRef = useRef(input.habitsDoneToday);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (input.habitsDoneToday > prevDoneRef.current) {
      setCelebrating(true);
      const timer = setTimeout(() => setCelebrating(false), CELEBRATION_DURATION_MS);
      prevDoneRef.current = input.habitsDoneToday;
      return () => clearTimeout(timer);
    }
    prevDoneRef.current = input.habitsDoneToday;
  }, [input.habitsDoneToday]);

  return useMemo(() => {
    const habitRatio = input.habitsTotal > 0 ? input.habitsDoneToday / input.habitsTotal : 0;
    const achievementRatio =
      input.achievementsTotal > 0 ? input.achievementsUnlocked / input.achievementsTotal : 0;
    // 30-day streak reaches full weight — a deliberate, documented choice,
    // not a value read from anywhere else in the app.
    const streakFactor = Math.min(currentStreak / 30, 1);

    const score = habitRatio * 0.4 + achievementRatio * 0.35 + streakFactor * 0.25;
    const growthLevel = clampGrowthLevel(score * 8);

    const hour = new Date().getHours();
    const isNight = hour >= NIGHT_START_HOUR || hour < NIGHT_END_HOUR;

    let atmosphere: AtmosphereState;
    if (celebrating) atmosphere = "celebration";
    else if (input.hasOverdue) atmosphere = "recovery"; // renders as the rain effect
    else if (isNight) atmosphere = "night";
    else atmosphere = "calm";

    return { growthLevel, atmosphere };
  }, [
    input.habitsDoneToday,
    input.habitsTotal,
    input.achievementsUnlocked,
    input.achievementsTotal,
    input.hasOverdue,
    currentStreak,
    celebrating,
  ]);
}
