"use client";

import { useTranslations } from "next-intl";

import { DashboardFormField } from "@/components/dashboard/form-field";
import { LocaleTabs } from "@/components/shared/locale-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDirection, type Locale } from "@/i18n/config";

import type { SettingsSectionProps } from "./section";

export function MetadataSettingsCard({
  value,
  onChange,
}: SettingsSectionProps<"metadata">) {
  const t = useTranslations("dashboard.settings");

  function setTitle(locale: Locale, text: string) {
    onChange({ title: { ...value.title, [locale]: text } });
  }

  function setDescription(locale: Locale, text: string) {
    onChange({ description: { ...value.description, [locale]: text } });
  }

  return (
    <Card>
      <CardContent>
        <LocaleTabs listClassName="w-full" contentClassName="space-y-4 pt-4">
          {(locale) => {
            const dir = getDirection(locale);
            const localeLabel = t(`locales.${locale}`);

            return (
              <>
                <DashboardFormField
                  id={`meta-title-${locale}`}
                  label={`${t("metadata.siteTitle")} (${localeLabel})`}
                >
                  <Input
                    id={`meta-title-${locale}`}
                    dir={dir}
                    value={value.title[locale] ?? ""}
                    placeholder={t("metadata.siteTitlePlaceholder")}
                    onChange={(event) => setTitle(locale, event.target.value)}
                  />
                </DashboardFormField>

                <DashboardFormField
                  id={`meta-description-${locale}`}
                  label={`${t("metadata.metaDescription")} (${localeLabel})`}
                  description={t("metadata.fallbackHint")}
                >
                  <Textarea
                    id={`meta-description-${locale}`}
                    dir={dir}
                    rows={3}
                    value={value.description[locale] ?? ""}
                    placeholder={t("metadata.metaDescriptionPlaceholder")}
                    onChange={(event) =>
                      setDescription(locale, event.target.value)
                    }
                  />
                </DashboardFormField>
              </>
            );
          }}
        </LocaleTabs>
      </CardContent>
    </Card>
  );
}
