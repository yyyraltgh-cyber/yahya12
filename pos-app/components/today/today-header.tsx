"use client";

import { useTranslation } from "@/lib/i18n/locale-context";
import { useGarden } from "@/lib/garden/use-garden";
import { GardenScene } from "@/components/garden/garden-scene";

/**
 * Greeting + current date + a one-line "habits done today" indicator.
 * Date formatting is locale-aware (Intl), so it reads naturally in both
 * Arabic and English without any hardcoded day/month names.
 *
 * The decorative signature here used to be `.pattern-signature` (a
 * geometric star motif). Replaced with the Garden scene per the "no
 * religious symbols" directive — same "one deliberate decorative moment,
 * never repeated elsewhere" placement, different visual language.
 */
export function TodayHeader({
  name,
  habitsDoneToday,
  habitsTotalToday,
  achievementsUnlocked = 0,
  achievementsTotal = 0,
  hasOverdue = false,
}: {
  name: string | null;
  habitsDoneToday: number;
  habitsTotalToday: number;
  achievementsUnlocked?: number;
  achievementsTotal?: number;
  hasOverdue?: boolean;
}) {
  const { t, locale } = useTranslation();
  const garden = useGarden({
    habitsDoneToday,
    habitsTotal: habitsTotalToday,
    achievementsUnlocked,
    achievementsTotal,
    hasOverdue,
  });

  const dateLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div>
        <h2 className="font-display text-xl font-semibold">
          {name ? t("today.greetingWithName", { name }) : t("today.greetingGeneric")}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{dateLabel}</p>
        {habitsTotalToday > 0 && (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {t("today.habitsDoneToday", { done: habitsDoneToday, total: habitsTotalToday })}
          </p>
        )}
      </div>
      <GardenScene growthLevel={garden.growthLevel} atmosphere={garden.atmosphere} />
    </div>
  );
}
