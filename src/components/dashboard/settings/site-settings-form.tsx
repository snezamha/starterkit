"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { AppearanceSettingsCard } from "@/components/dashboard/settings/appearance-settings-card";
import { ConsentSettingsCard } from "@/components/dashboard/settings/consent-settings-card";
import { DateTimeSettingsCard } from "@/components/dashboard/settings/date-time-settings-card";
import { LocaleSettingsCard } from "@/components/dashboard/settings/locale-settings-card";
import { MetadataSettingsCard } from "@/components/dashboard/settings/metadata-settings-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  SiteSettings,
  SiteSettingsSection,
} from "@/lib/site-settings/schema";
import { generateThemeCss } from "@/lib/theme/presets";

import { saveSiteSettings } from "@/app/[locale]/dashboard/settings/actions";

type Props = {
  settings: SiteSettings;
};

const STATUS_RESET_DELAY_MS = 3000;
const THEME_PREVIEW_STYLE_ID = "theme-live-preview";

export function SiteSettingsForm({ settings }: Props) {
  const t = useTranslations("dashboard.settings");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(settings);
  const [form, setForm] = useState(settings);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const isDirty = JSON.stringify(form) !== JSON.stringify(saved);

  useEffect(() => {
    if (status !== "saved") return;

    const timeout = setTimeout(() => setStatus("idle"), STATUS_RESET_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [status]);

  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.id = THEME_PREVIEW_STYLE_ID;
    document.head.appendChild(styleEl);
    return () => styleEl.remove();
  }, []);

  useEffect(() => {
    const styleEl = document.getElementById(THEME_PREVIEW_STYLE_ID);
    if (!styleEl) return;

    styleEl.textContent = generateThemeCss(
      form.theme.color,
      form.theme.radius,
      form.theme.customColor,
    );
  }, [form.theme]);

  function update<K extends SiteSettingsSection>(
    section: K,
    patch: Partial<SiteSettings[K]>,
  ) {
    setStatus("idle");
    setForm((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
  }

  function handleCancel() {
    setForm(saved);
    setStatus("idle");
  }

  function handleSave() {
    startTransition(async () => {
      try {
        await saveSiteSettings(form);
        setSaved(form);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <div className="grid gap-4">
      <Tabs defaultValue="appearance">
        <TabsList className="w-full">
          <TabsTrigger value="appearance">
            {t("appearanceCard.cardTitle")}
          </TabsTrigger>
          <TabsTrigger value="dateTime">{t("dateTime.title")}</TabsTrigger>
          <TabsTrigger value="metadata">{t("metadata.title")}</TabsTrigger>
          <TabsTrigger value="locale">{t("localeCard.title")}</TabsTrigger>
          <TabsTrigger value="consent">{t("consent.title")}</TabsTrigger>
        </TabsList>
        <TabsContent value="appearance">
          <AppearanceSettingsCard
            theme={form.theme}
            loading={form.loading}
            onThemeChange={(patch) => update("theme", patch)}
            onLoadingChange={(patch) => update("loading", patch)}
          />
        </TabsContent>
        <TabsContent value="dateTime">
          <DateTimeSettingsCard
            value={form.dateTime}
            onChange={(patch) => update("dateTime", patch)}
          />
        </TabsContent>
        <TabsContent value="metadata">
          <MetadataSettingsCard
            value={form.metadata}
            onChange={(patch) => update("metadata", patch)}
          />
        </TabsContent>
        <TabsContent value="locale">
          <LocaleSettingsCard
            value={form.locale}
            onChange={(patch) => update("locale", patch)}
          />
        </TabsContent>
        <TabsContent value="consent">
          <ConsentSettingsCard
            value={form.consent}
            onChange={(patch) => update("consent", patch)}
          />
        </TabsContent>
      </Tabs>

      <div className="bg-background/95 sticky bottom-0 -mx-4 flex flex-col gap-3 border-t px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:rounded-lg sm:border">
        <div className="min-w-0 text-sm sm:flex-1">
          {isDirty && status === "idle" && (
            <span className="text-muted-foreground">{t("unsavedChanges")}</span>
          )}
          {status === "saved" && (
            <span className="text-muted-foreground">{t("saved")}</span>
          )}
          {status === "error" && (
            <span className="text-destructive">{t("error")}</span>
          )}
        </div>
        {isDirty && (
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={isPending || !isDirty}
          className="w-full sm:w-auto"
        >
          {t("save")}
        </Button>
      </div>
    </div>
  );
}
