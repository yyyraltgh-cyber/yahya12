"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, todayISO, weekStartISO } from "@/lib/utils";
import { useGamification } from "@/components/gamification/gamification-context";
import { useTranslation } from "@/lib/i18n/locale-context";
import { awardXp, XP_REWARDS, checkCountAchievement } from "@/lib/gamification";
import type { Review } from "@/lib/types/database";

const KINDS = ["daily", "weekly", "monthly"] as const;

const KIND_KEY = {
  daily: "reviews.kinds.daily",
  weekly: "reviews.kinds.weekly",
  monthly: "reviews.kinds.monthly",
} as const;

export function ReviewList({
  initialReviews,
  userId,
}: {
  initialReviews: Review[];
  userId: string;
}) {
  const supabase = createClient();
  const { celebrate, refreshStats } = useGamification();
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [kind, setKind] = useState<(typeof KINDS)[number]>("weekly");
  const [wentWell, setWentWell] = useState("");
  const [toImprove, setToImprove] = useState("");
  const [rating, setRating] = useState(3);
  const [error, setError] = useState<string | null>(null);

  function periodStartFor(k: (typeof KINDS)[number]) {
    if (k === "daily") return todayISO();
    if (k === "weekly") return weekStartISO();
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }

  async function addReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const period_start = periodStartFor(kind);
    const { data, error } = await supabase
      .from("reviews")
      .insert({ user_id: userId, kind, period_start, went_well: wentWell, to_improve: toImprove, rating })
      .select()
      .single();
    if (error) {
      setError(
        error.code === "23505"
          ? t("reviews.duplicateError", { kind: t(KIND_KEY[kind]) })
          : error.message
      );
      return;
    }
    if (data) {
      setReviews([data, ...reviews]);
      setWentWell("");
      setToImprove("");
      setRating(3);

      const reason = t("reviews.submittedReason");
      const result = await awardXp(supabase, userId, XP_REWARDS.review_submit, reason, "review", data.id);
      if (result) celebrate(result, XP_REWARDS.review_submit, reason);

      const firstAch = await checkCountAchievement(supabase, userId, "first_review", reviews.length + 1, 1);
      if (firstAch) {
        celebrate(
          { newXp: 0, oldLevel: 0, newLevel: 0, leveledUp: false, newStreak: 0, streakExtended: false, unlockedAchievements: [firstAch] },
          0,
          ""
        );
      }
      refreshStats();
    }
  }

  async function deleteReview(id: string) {
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (!error) setReviews(reviews.filter((r) => r.id !== id));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={addReview} className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Select value={kind} onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}>
            {KINDS.map((k) => <option key={k} value={k}>{t(KIND_KEY[k])}</option>)}
          </Select>
          <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
            {t("reviews.ratingLabel")}
            <Select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
            </Select>
          </label>
        </div>
        <Textarea placeholder={t("reviews.wentWellPlaceholder")} rows={2} value={wentWell} onChange={(e) => setWentWell(e.target.value)} />
        <Textarea placeholder={t("reviews.toImprovePlaceholder")} rows={2} value={toImprove} onChange={(e) => setToImprove(e.target.value)} />
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        <Button type="submit" className="self-start">{t("reviews.saveButton")}</Button>
      </form>

      <div className="flex flex-col gap-3">
        {reviews.length === 0 && <EmptyState message={t("reviews.empty")} />}
        {reviews.map((r) => (
          <Card key={r.id}>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge tone="primary">{t(KIND_KEY[r.kind as (typeof KINDS)[number]])}</Badge>
                <span className="text-xs text-[var(--color-text-muted)]">{formatDate(r.period_start)}</span>
                {r.rating && <Badge tone="success">{r.rating}/5</Badge>}
              </div>
              <Button variant="ghost" onClick={() => deleteReview(r.id)}>{t("common.delete")}</Button>
            </div>
            {r.went_well && <p className="text-sm"><span className="text-[var(--color-success)]">+ </span>{r.went_well}</p>}
            {r.to_improve && <p className="text-sm"><span className="text-[var(--color-warning)]">→ </span>{r.to_improve}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
