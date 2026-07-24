"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { useGamification } from "@/components/gamification/gamification-context";
import { useTranslation } from "@/lib/i18n/locale-context";
import { checkCountAchievement } from "@/lib/gamification";
import type { KbArticle } from "@/lib/types/database";

export function KnowledgeBase({
  initialArticles,
  userId,
}: {
  initialArticles: KbArticle[];
  userId: string;
}) {
  const supabase = createClient();
  const { celebrate } = useGamification();
  const { t } = useTranslation();
  const [articles, setArticles] = useState<KbArticle[]>(initialArticles);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [articles, query]);

  function parseTags(s: string) {
    return s.split(",").map((t) => t.trim()).filter(Boolean);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const tags = parseTags(tagsInput);

    if (editingId) {
      const { data, error } = await supabase
        .from("kb_articles")
        .update({ title: title.trim(), body, tags })
        .eq("id", editingId)
        .select()
        .single();
      if (!error && data) {
        setArticles(articles.map((a) => (a.id === editingId ? data : a)));
        reset();
      }
    } else {
      const { data, error } = await supabase
        .from("kb_articles")
        .insert({ user_id: userId, title: title.trim(), body, tags })
        .select()
        .single();
      if (!error && data) {
        setArticles([data, ...articles]);
        reset();

        const ach = await checkCountAchievement(supabase, userId, "knowledge_5", articles.length + 1, 5);
        if (ach) {
          celebrate(
            { newXp: 0, oldLevel: 0, newLevel: 0, leveledUp: false, newStreak: 0, streakExtended: false, unlockedAchievements: [ach] },
            0,
            ""
          );
        }
      }
    }
  }

  function reset() {
    setEditingId(null);
    setTitle("");
    setBody("");
    setTagsInput("");
  }

  function startEdit(a: KbArticle) {
    setEditingId(a.id);
    setTitle(a.title);
    setBody(a.body);
    setTagsInput(a.tags.join(", "));
  }

  async function remove(id: string) {
    const { error } = await supabase.from("kb_articles").delete().eq("id", id);
    if (!error) {
      setArticles(articles.filter((a) => a.id !== id));
      if (editingId === id) reset();
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Input
        placeholder={t("knowledge.searchPlaceholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4"
      />

      <form onSubmit={save} className="mb-6 flex flex-col gap-2">
        <Input placeholder={t("knowledge.titlePlaceholder")} value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder={t("knowledge.bodyPlaceholder")} rows={4} value={body} onChange={(e) => setBody(e.target.value)} />
        <Input placeholder={t("knowledge.tagsPlaceholder")} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        <div className="flex gap-2">
          <Button type="submit">{editingId ? t("common.save") : t("knowledge.addButton")}</Button>
          {editingId && <Button type="button" variant="secondary" onClick={reset}>{t("common.cancel")}</Button>}
        </div>
      </form>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && <EmptyState message={query ? t("knowledge.emptyWithQuery") : t("knowledge.emptyNoQuery")} />}
        {filtered.map((a) => (
          <Card key={a.id}>
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="font-medium">{a.title}</h3>
              <div className="flex gap-1">
                <Button variant="ghost" onClick={() => startEdit(a)}>{t("common.edit")}</Button>
                <Button variant="ghost" onClick={() => remove(a.id)}>{t("common.delete")}</Button>
              </div>
            </div>
            {a.body && <p className="whitespace-pre-wrap text-sm text-[var(--color-text-muted)]">{a.body}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {a.tags.map((t) => <Badge key={t}>{t}</Badge>)}
              <span className="ml-auto text-xs text-[var(--color-text-muted)]">{formatDate(a.updated_at)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
