"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { TranslationKey } from "@/lib/i18n/translate";
import { Library, Trophy, Layers, BookOpen, BarChart3 } from "lucide-react";

const LINKS: { href: string; labelKey: TranslationKey; icon: typeof Library }[] = [
  { href: "/library", labelKey: "nav.library", icon: Library },
  { href: "/achievements", labelKey: "nav.achievements", icon: Trophy },
  { href: "/areas", labelKey: "nav.areas", icon: Layers },
  { href: "/reviews", labelKey: "nav.reviews", icon: BookOpen },
  { href: "/knowledge", labelKey: "nav.knowledge", icon: BookOpen },
  { href: "/statistics", labelKey: "nav.statistics", icon: BarChart3 },
];

export function QuickLinksCard() {
  const { t } = useTranslation();
  return (
    <Card>
      <div className="grid grid-cols-3 gap-3">
        {LINKS.map(({ href, labelKey, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 rounded-lg p-2 text-center hover:bg-[var(--color-surface-hover)]"
          >
            <Icon size={22} className="text-[var(--color-primary)]" />
            <span className="text-xs text-[var(--color-text-muted)]">{t(labelKey)}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
