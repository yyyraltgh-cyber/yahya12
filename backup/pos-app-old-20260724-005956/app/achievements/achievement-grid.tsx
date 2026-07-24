"use client";

import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { TranslationKey } from "@/lib/i18n/translate";
import type { Achievement } from "@/lib/types/database";

const ICON_MAP: Record<string, string> = {
  "check-circle": "✅",
  repeat: "🔁",
  "list-checks": "📋",
  "book-open": "📖",
  flame: "🔥",
  star: "⭐",
  layers: "🗂️",
};

/**
 * Achievement titles/descriptions are seeded rows in the `achievements`
 * table (migration 0003) — data, not code, and the database schema is out
 * of scope for this step. This maps each known achievement id to its
 * translation keys so the catalog can display localized text without any
 * DB change. Unmapped ids (e.g. a future achievement added to the table
 * without a matching translation) fall back to the raw DB value.
 */
const CATALOG_KEY: Record<string, { title: TranslationKey; description: TranslationKey }> = {
  first_task: { title: "achievementsCatalog.firstTask.title", description: "achievementsCatalog.firstTask.description" },
  first_habit: { title: "achievementsCatalog.firstHabit.title", description: "achievementsCatalog.firstHabit.description" },
  first_routine: { title: "achievementsCatalog.firstRoutine.title", description: "achievementsCatalog.firstRoutine.description" },
  first_review: { title: "achievementsCatalog.firstReview.title", description: "achievementsCatalog.firstReview.description" },
  streak_3: { title: "achievementsCatalog.streak3.title", description: "achievementsCatalog.streak3.description" },
  streak_7: { title: "achievementsCatalog.streak7.title", description: "achievementsCatalog.streak7.description" },
  streak_30: { title: "achievementsCatalog.streak30.title", description: "achievementsCatalog.streak30.description" },
  tasks_10: { title: "achievementsCatalog.tasks10.title", description: "achievementsCatalog.tasks10.description" },
  tasks_50: { title: "achievementsCatalog.tasks50.title", description: "achievementsCatalog.tasks50.description" },
  level_5: { title: "achievementsCatalog.level5.title", description: "achievementsCatalog.level5.description" },
  level_10: { title: "achievementsCatalog.level10.title", description: "achievementsCatalog.level10.description" },
  area_creator: { title: "achievementsCatalog.areaCreator.title", description: "achievementsCatalog.areaCreator.description" },
  knowledge_5: { title: "achievementsCatalog.knowledge5.title", description: "achievementsCatalog.knowledge5.description" },
};

export function AchievementGrid({
  achievements,
  unlockedIds,
}: {
  achievements: Achievement[];
  unlockedIds: Set<string>;
}) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {achievements.map((a) => {
        const unlocked = unlockedIds.has(a.id);
        const keys = CATALOG_KEY[a.id];
        const title = keys ? t(keys.title) : a.title;
        const description = keys ? t(keys.description) : a.description;
        return (
          <Card
            key={a.id}
            className={`flex flex-col items-center gap-1 text-center transition-opacity ${
              unlocked ? "" : "opacity-40 grayscale"
            }`}
          >
            <span className="text-3xl">{ICON_MAP[a.icon] ?? "🏆"}</span>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
            {a.xp_reward > 0 && (
              <span className="mt-1 rounded-full bg-[var(--color-primary)]/15 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
                +{a.xp_reward} {t("gamification.xp")}
              </span>
            )}
          </Card>
        );
      })}
    </div>
  );
}
