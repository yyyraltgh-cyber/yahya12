"use client";

import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/locale-context";

/**
 * Lightweight dependency-free charts (inline SVG) so Statistics renders
 * without pulling a charting library into the mobile bundle.
 */
export function StatsCharts({
  habitSeries,
  completionRate,
  eventCount,
}: {
  habitSeries: { date: string; count: number }[];
  completionRate: number;
  eventCount: number;
}) {
  const { t } = useTranslation();
  const max = Math.max(1, ...habitSeries.map((d) => d.count));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <h3 className="mb-3 font-medium">{t("statistics.habitCheckins")}</h3>
        {habitSeries.length === 0 ? (
          <p className="text-sm text-[var(--color-text-muted)]">{t("statistics.noHabitActivity")}</p>
        ) : (
          <div className="flex h-40 items-end gap-1">
            {habitSeries.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-[var(--color-primary)]"
                  style={{ height: `${(d.count / max) * 100}%` }}
                  title={`${d.date}: ${d.count}`}
                />
                <span className="text-[8px] text-[var(--color-text-muted)]">{d.date}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h3 className="mb-3 font-medium">{t("statistics.taskCompletion")}</h3>
        <div className="flex items-center justify-center py-4">
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-border)" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.9"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3"
                strokeDasharray={`${completionRate} ${100 - completionRate}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
              {completionRate}%
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-[var(--color-text-muted)]">{t("statistics.calendarEventsTotal", { count: eventCount })}</p>
      </Card>
    </div>
  );
}
