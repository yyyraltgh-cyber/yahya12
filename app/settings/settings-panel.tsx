"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DailyGoalSelector } from "@/components/settings/daily-goal-selector";
import { useTranslation } from "@/lib/i18n/locale-context";

type Theme = "system" | "light" | "dark";

export function SettingsPanel({
  userId,
  initialName,
  initialTheme,
}: {
  userId: string;
  initialName: string;
  initialTheme: Theme;
}) {
  const supabase = createClient();
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialName);
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function applyTheme(next: Theme) {
    const root = document.documentElement;
    const dark = next === "dark" || (next === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("light", !dark);
    try {
      localStorage.setItem("pos-theme", next);
    } catch {
      // localStorage unavailable (private mode) - theme still applies for this session.
    }
  }

  async function saveProfile() {
    setBusy(true);
    setProfileMsg(null);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() || null, theme })
      .eq("id", userId);
    applyTheme(theme);
    setProfileMsg(error ? error.message : t("settings.saved"));
    setBusy(false);
  }

  function exportData() {
    // Route streams a downloadable JSON attachment.
    window.location.href = "/api/export";
  }

  async function importData(file: File) {
    setImportMsg(null);
    setBusy(true);
    try {
      const text = await file.text();
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      });
      const json = await res.json();
      if (!res.ok) {
        setImportMsg(json.error ?? t("settings.importFailed"));
      } else {
        const total = Object.values(json.imported ?? {}).reduce((a: number, b) => a + (b as number), 0);
        setImportMsg(t("settings.importedRecords", { count: total }));
      }
    } catch (e) {
      setImportMsg(e instanceof Error ? e.message : t("settings.importFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card>
        <h2 className="mb-4 font-medium">{t("settings.profile")}</h2>
        <div className="flex flex-col gap-3">
          <label className="text-sm text-[var(--color-text-muted)]">
            {t("settings.displayName")}
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("settings.namePlaceholder")} />
          </label>
          <label className="text-sm text-[var(--color-text-muted)]">
            {t("settings.theme")}
            <div className="mt-1">
              <Select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
                <option value="system">{t("settings.themeSystem")}</option>
                <option value="light">{t("settings.themeLight")}</option>
                <option value="dark">{t("settings.themeDark")}</option>
              </Select>
            </div>
          </label>
          <div className="flex items-center gap-3">
            <Button onClick={saveProfile} disabled={busy}>{t("settings.saveProfile")}</Button>
            {profileMsg && <span className="text-sm text-[var(--color-text-muted)]">{profileMsg}</span>}
          </div>
        </div>
      </Card>

      <DailyGoalSelector userId={userId} />

      <Card>
        <h2 className="mb-2 font-medium">{t("settings.backupAndData")}</h2>
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">{t("settings.backupDescription")}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={exportData}>{t("settings.exportBackup")}</Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
            {t("settings.importBackup")}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importData(f);
              e.target.value = "";
            }}
          />
          {importMsg && <span className="text-sm text-[var(--color-text-muted)]">{importMsg}</span>}
        </div>
      </Card>
    </>
  );
}
