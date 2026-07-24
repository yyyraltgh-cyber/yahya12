"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslation } from "@/lib/i18n/locale-context";

export default function SignupPage() {
  const supabase = createClient();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="mb-2 text-xl font-semibold">{t("auth.checkInbox")}</h1>
          <p className="text-[var(--color-text-muted)]">{t("auth.confirmationSent", { email })}</p>
          <Link href="/login" className="mt-4 inline-block text-[var(--color-primary)]">
            {t("auth.backToSignIn")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8"
      >
        <h1 className="mb-6 text-xl font-semibold">{t("auth.createAccount")}</h1>

        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">{t("auth.email")}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 outline-none focus:border-[var(--color-primary)]"
        />

        <label className="mb-1 block text-sm text-[var(--color-text-muted)]">{t("auth.password")}</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 outline-none focus:border-[var(--color-primary)]"
        />

        {error && <p className="mb-4 text-sm text-[var(--color-danger)]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[var(--color-primary)] px-4 py-2.5 font-medium hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-60"
        >
          {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
        </button>

        <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
          {t("auth.haveAccount")}{" "}
          <Link href="/login" className="text-[var(--color-primary)]">
            {t("auth.signIn")}
          </Link>
        </p>
      </form>
    </main>
  );
}
