"use client";

import { useTranslation } from "@/lib/i18n/locale-context";

/**
 * Greeting + current date + a one-line "habits done today" indicator.
 * Date formatting is locale-aware (Intl), so it reads naturally in both
 * Arabic and English without any hardcoded day/month names.
 */
export function TodayHeader({
  name,
  habitsDoneToday,
  habitsTotalToday,
}: {
  name: string | null;
  habitsDoneToday: number;
  habitsTotalToday: number;
}) {
  const { t, locale } = useTranslation();

  const dateLabel = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold">
        {name ? t("today.greetingWithName", { name }) : t("today.greetingGeneric")}
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{dateLabel}</p>
      {habitsTotalToday > 0 && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {t("today.habitsDoneToday", { done: habitsDoneToday, total: habitsTotalToday })}
        </p>
      )}
    </div>
  );
}
