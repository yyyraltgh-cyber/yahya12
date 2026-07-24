"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/locale-context";

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-14 w-14 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center text-2xl font-bold">
          P
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{t("nav.appName")}</h1>
        <p className="max-w-md text-[var(--color-text-muted)]">{t("misc.tagline")}</p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-[var(--color-primary)] px-5 py-2.5 font-medium hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          {t("auth.signIn")}
        </Link>
        <Link
          href="/signup"
          className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 font-medium hover:bg-[var(--color-surface-hover)] transition-colors"
        >
          {t("auth.createAccount")}
        </Link>
      </div>
    </main>
  );
}
