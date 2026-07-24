"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { CalendarEvent } from "@/lib/types/database";

function monthMatrix(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // Monday-first
  const start = new Date(year, month, 1 - startOffset);
  const weeks: Date[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

export function CalendarView({
  initialEvents,
  userId,
}: {
  initialEvents: CalendarEvent[];
  userId: string;
}) {
  const supabase = createClient();
  const { t, locale } = useTranslation();
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [ref, setRef] = useState(new Date());
  const [selected, setSelected] = useState<string>(new Date().toISOString().slice(0, 10));

  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");

  const year = ref.getFullYear();
  const month = ref.getMonth();
  const weeks = useMemo(() => monthMatrix(year, month), [year, month]);
  const weekdayLabels = [
    t("calendar.mon"), t("calendar.tue"), t("calendar.wed"),
    t("calendar.thu"), t("calendar.fri"), t("calendar.sat"), t("calendar.sun"),
  ];
  const intlLocale = locale === "ar" ? "ar" : "en";

  const eventsByDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      const key = ev.starts_at.slice(0, 10);
      (map[key] ||= []).push(ev);
    }
    return map;
  }, [events]);

  const selectedEvents = eventsByDay[selected] ?? [];

  async function addEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startsAt) return;
    const { data, error } = await supabase
      .from("events")
      .insert({ user_id: userId, title: title.trim(), starts_at: new Date(startsAt).toISOString() })
      .select()
      .single();
    if (!error && data) {
      setEvents([...events, data]);
      setTitle("");
      setStartsAt("");
    }
  }

  async function deleteEvent(id: string) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) setEvents(events.filter((ev) => ev.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="secondary" onClick={() => setRef(new Date(year, month - 1, 1))}>‹</Button>
        <h2 className="font-medium">
          {ref.toLocaleDateString(intlLocale, { month: "long", year: "numeric" })}
        </h2>
        <Button variant="secondary" onClick={() => setRef(new Date(year, month + 1, 1))}>›</Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-[var(--color-text-muted)]">
        {weekdayLabels.map((d, i) => (
          <div key={i} className="py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((day) => {
          const key = day.toISOString().slice(0, 10);
          const inMonth = day.getMonth() === month;
          const isSelected = key === selected;
          const count = (eventsByDay[key] ?? []).length;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={[
                "aspect-square rounded-lg border p-1 text-sm transition-colors",
                inMonth ? "border-[var(--color-border)]" : "border-transparent text-[var(--color-text-muted)] opacity-50",
                isSelected ? "bg-[var(--color-primary)] text-white" : "hover:bg-[var(--color-surface-hover)]",
              ].join(" ")}
            >
              <div>{day.getDate()}</div>
              {count > 0 && (
                <div className={isSelected ? "text-white" : "text-[var(--color-primary)]"}>
                  •{count > 1 ? count : ""}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        <h3 className="mb-2 font-medium">{new Date(selected).toLocaleDateString(intlLocale, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h3>
        <form onSubmit={addEvent} className="mb-3 flex flex-col gap-2 sm:flex-row">
          <Input placeholder={t("calendar.eventTitlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
          <Button type="submit">{t("common.add")}</Button>
        </form>
        <div className="flex flex-col gap-2">
          {selectedEvents.length === 0 && <EmptyState message={t("calendar.empty")} />}
          {selectedEvents.map((ev) => (
            <Card key={ev.id} className="flex items-center justify-between p-3">
              <div>
                <div className="font-medium">{ev.title}</div>
                <div className="text-xs text-[var(--color-text-muted)]">{formatDateTime(ev.starts_at)}</div>
              </div>
              <Button variant="ghost" onClick={() => deleteEvent(ev.id)}>{t("common.delete")}</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
