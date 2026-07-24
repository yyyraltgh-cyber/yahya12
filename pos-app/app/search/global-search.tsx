"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useTranslation } from "@/lib/i18n/locale-context";

export type SearchEntryType = "task" | "note" | "knowledge" | "event" | "area";
type Entry = { type: SearchEntryType; href: string; title: string; snippet: string };

const toneFor: Record<SearchEntryType, "primary" | "success" | "warning" | "default"> = {
  task: "primary",
  note: "success",
  knowledge: "warning",
  event: "default",
  area: "default",
};

const TYPE_KEY = {
  task: "search.types.task",
  note: "search.types.note",
  knowledge: "search.types.knowledge",
  event: "search.types.event",
  area: "search.types.area",
} as const;

export function GlobalSearch({ index }: { index: Entry[] }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter((e) => `${e.title} ${e.snippet}`.toLowerCase().includes(q))
      .slice(0, 50);
  }, [index, query]);

  return (
    <div className="mx-auto max-w-2xl">
      <Input
        autoFocus
        placeholder={t("search.placeholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-4"
      />

      {query.trim() === "" ? (
        <p className="text-center text-sm text-[var(--color-text-muted)]">{t("search.prompt")}</p>
      ) : results.length === 0 ? (
        <EmptyState message={t("search.noResults")} />
      ) : (
        <div className="flex flex-col gap-2">
          {results.map((r, i) => (
            <Link key={`${r.type}-${i}`} href={r.href}>
              <Card className="p-3 transition-colors hover:bg-[var(--color-surface-hover)]">
                <div className="flex items-center gap-2">
                  <Badge tone={toneFor[r.type]}>{t(TYPE_KEY[r.type])}</Badge>
                  <span className="font-medium">{r.title}</span>
                </div>
                {r.snippet && (
                  <p className="mt-1 line-clamp-1 text-sm text-[var(--color-text-muted)]">{r.snippet}</p>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
