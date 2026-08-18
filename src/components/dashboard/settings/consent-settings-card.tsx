"use client";

import { useTranslations } from "next-intl";

import { DashboardFormField } from "@/components/dashboard/form-field";
import { DashboardSelectField } from "@/components/dashboard/select-field";
import { DashboardSwitchRow } from "@/components/dashboard/switch-row";
import { LocaleTabs } from "@/components/shared/locale-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Locale } from "@/i18n/config";
import { consentCategories } from "@/lib/consent/cookie";
import {
  consentPositionOptions,
  type ConsentPosition,
  type ConsentSettings,
  type ConsentTextField,
} from "@/lib/site-settings/consent";

import { ConsentPreview } from "./consent-preview";
import { ConsentTextFieldInput } from "./consent-text-fields";
import type { SettingsSectionProps } from "./section";

const bannerFields: ConsentTextField[] = [
  "title",
  "description",
  "policyLabel",
];

const buttonFields: ConsentTextField[] = [
  "necessaryLabel",
  "acceptLabel",
  "customizeLabel",
  "saveLabel",
];

const categoryFields: ConsentTextField[] = [
  "necessaryTitle",
  "necessaryDescription",
  "statisticsTitle",
  "statisticsDescription",
  "marketingTitle",
  "marketingDescription",
];

export function ConsentSettingsCard({
  value,
  onChange,
}: SettingsSectionProps<"consent">) {
  const t = useTranslations("dashboard.settings");
  const tConsent = useTranslations("common.consent");

  function fallback(field: ConsentTextField) {
    return tConsent.raw(`defaults.${field}`) as string;
  }

  function resolve(field: ConsentTextField, locale: Locale) {
    return value[field][locale]?.trim() || fallback(field);
  }

  function setText(field: ConsentTextField, locale: Locale, text: string) {
    onChange({
      [field]: { ...value[field], [locale]: text },
    } as Partial<ConsentSettings>);
  }

  function renderFields(fields: ConsentTextField[], locale: Locale) {
    return fields.map((field) => (
      <ConsentTextFieldInput
        key={field}
        field={field}
        locale={locale}
        value={value}
        fallback={fallback}
        onChange={setText}
      />
    ));
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <DashboardSwitchRow
          id="consent-enabled"
          label={t("consent.enabled")}
          description={t("consent.enabledDescription")}
          checked={value.enabled}
          onCheckedChange={(enabled) => onChange({ enabled })}
        />

        <DashboardSwitchRow
          id="consent-reopen"
          label={t("consent.reopenButton")}
          description={t("consent.reopenButtonDescription")}
          checked={value.showReopenButton}
          onCheckedChange={(showReopenButton) => onChange({ showReopenButton })}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <DashboardSelectField
            id="consent-position"
            label={t("consent.position")}
            description={t("consent.positionHint")}
            value={value.position}
            options={consentPositionOptions}
            onChange={(position: ConsentPosition) => onChange({ position })}
            getLabel={(position) => t(`loading.positions.${position}`)}
            triggerClassName="w-full"
          />

          <DashboardFormField
            id="consent-policy-url"
            label={t("consent.policyUrl")}
            description={t("consent.policyUrlHint")}
          >
            <Input
              id="consent-policy-url"
              dir="ltr"
              value={value.policyUrl}
              placeholder="/privacy"
              onChange={(event) => onChange({ policyUrl: event.target.value })}
            />
          </DashboardFormField>

          <DashboardFormField
            id="consent-version"
            label={t("consent.version")}
            description={t("consent.versionHint")}
          >
            <Input
              id="consent-version"
              type="number"
              min={1}
              max={9999}
              value={value.version}
              onChange={(event) =>
                onChange({ version: Number(event.target.value) })
              }
            />
          </DashboardFormField>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t("consent.categories")}</Label>
            <p className="text-muted-foreground text-xs">
              {t("consent.categoriesDescription")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {consentCategories.map((category) => (
              <DashboardSwitchRow
                key={category}
                id={`consent-category-${category}`}
                label={
                  category === "statistics"
                    ? t("consent.categoryStatistics")
                    : t("consent.categoryMarketing")
                }
                checked={value.categories[category]}
                onCheckedChange={(checked) =>
                  onChange({
                    categories: { ...value.categories, [category]: checked },
                  })
                }
                className="rounded-lg border px-3 py-2"
              />
            ))}
          </div>
        </div>

        <LocaleTabs listClassName="w-full" contentClassName="space-y-6 pt-4">
          {(locale) => (
            <>
              <div className="space-y-4">
                {renderFields(bannerFields, locale)}
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  {t("consent.buttons")}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {renderFields(buttonFields, locale)}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  {t("consent.categoryTexts")}
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {renderFields(categoryFields, locale)}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  {t("consent.preview")}
                </p>
                <ConsentPreview
                  value={value}
                  locale={locale}
                  resolve={resolve}
                />
              </div>
            </>
          )}
        </LocaleTabs>
      </CardContent>
    </Card>
  );
}
