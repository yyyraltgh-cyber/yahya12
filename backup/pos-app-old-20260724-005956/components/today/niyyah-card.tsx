"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/locale-context";
import { todayISO } from "@/lib/utils";

/**
 * A once-a-day intention prompt ("بم تنوي اليوم؟"), deliberately separate
 * from tasks/habits and from any XP/streak mechanic — this is the opposite
 * of achievement-tracking, not another thing to "complete." Self-contained:
 * fetches and saves its own state, independent of the dashboard's data load.
 */
export function NiyyahCard({ userId }: { userId: string }) {
  const supabase = createClient();
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const today = todayISO();
    supabase
      .from("daily_intentions")
      .select("text")
      .eq("user_id", userId)
      .eq("intention_date", today)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setText(data.text);
          setSaved(true);
        }
        setLoaded(true);
      });
  }, [userId]);

  async function save() {
    if (!text.trim()) return;
    const { error } = await supabase
      .from("daily_intentions")
      .upsert(
        { user_id: userId, intention_date: todayISO(), text: text.trim() },
        { onConflict: "user_id,intention_date" }
      );
    if (!error) setSaved(true);
  }

  if (!loaded) return null;

  return (
    <Card className="flex flex-col gap-2">
      <h3 className="font-medium">{t("today.niyyahPrompt")}</h3>
      {saved ? (
        <p className="text-sm text-[var(--color-text-muted)]">{text}</p>
      ) : (
        <div className="flex flex-col gap-2 sm:flex-row">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("today.niyyahPlaceholder")}
            rows={2}
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <Button onClick={save} className="self-start sm:self-end">
            {t("common.save")}
          </Button>
        </div>
      )}
    </Card>
  );
}
