"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/locale-context";
import type { TranslationKey } from "@/lib/i18n/translate";
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  Repeat,
  Calendar,
  ListChecks,
  Layers,
  BookOpen,
  BarChart3,
  Search,
  Settings,
  Trophy,
} from "lucide-react";

const primary = [
  { href: "/dashboard", labelKey: "nav.dashboard" as TranslationKey, icon: LayoutDashboard },
  { href: "/tasks", labelKey: "nav.tasks" as TranslationKey, icon: CheckSquare },
  { href: "/notes", labelKey: "nav.notes" as TranslationKey, icon: FileText },
  { href: "/habits", labelKey: "nav.habits" as TranslationKey, icon: Repeat },
  { href: "/routines", labelKey: "nav.routines" as TranslationKey, icon: ListChecks },
  { href: "/calendar", labelKey: "nav.calendar" as TranslationKey, icon: Calendar },
];

const secondary = [
  { href: "/achievements", labelKey: "nav.achievements" as TranslationKey, icon: Trophy },
  { href: "/areas", labelKey: "nav.areas" as TranslationKey, icon: Layers },
  { href: "/reviews", labelKey: "nav.reviews" as TranslationKey, icon: BookOpen },
  { href: "/knowledge", labelKey: "nav.knowledge" as TranslationKey, icon: BookOpen },
  { href: "/statistics", labelKey: "nav.statistics" as TranslationKey, icon: BarChart3 },
  { href: "/search", labelKey: "nav.search" as TranslationKey, icon: Search },
  { href: "/settings", labelKey: "nav.settings" as TranslationKey, icon: Settings },
];

// Items shown in the mobile bottom bar (space-constrained).
const mobileItems = [
  { href: "/dashboard", labelKey: "nav.home" as TranslationKey, icon: LayoutDashboard },
  { href: "/tasks", labelKey: "nav.tasks" as TranslationKey, icon: CheckSquare },
  { href: "/calendar", labelKey: "nav.calendar" as TranslationKey, icon: Calendar },
  { href: "/search", labelKey: "nav.search" as TranslationKey, icon: Search },
  { href: "/settings", labelKey: "nav.more" as TranslationKey, icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const item = (
    { href, labelKey, icon: Icon }: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard },
    active: boolean
  ) => (
    <Link
      key={href}
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--color-surface-hover)] text-[var(--color-text)]"
          : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
      )}
    >
      <Icon size={18} />
      {t(labelKey)}
    </Link>
  );

  return (
    <>
      {/* Desktop / tablet vertical rail */}
      <nav className="hidden h-full w-56 shrink-0 flex-col gap-1 overflow-y-auto border-r border-[var(--color-border)] p-4 sm:flex">
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] flex items-center justify-center font-bold text-white">
            P
          </div>
          <span className="font-semibold">{t("nav.appName")}</span>
        </div>

        {primary.map((l) => item(l, pathname.startsWith(l.href)))}
        <div className="my-2 border-t border-[var(--color-border)]" />
        {secondary.map((l) => item(l, pathname.startsWith(l.href)))}
      </nav>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-[var(--color-border)] bg-[var(--color-surface)] sm:hidden">
        {mobileItems.map(({ href, labelKey, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
                active ? "text-[var(--color-primary)]" : "text-[var(--color-text-muted)]"
              )}
            >
              <Icon size={20} />
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
