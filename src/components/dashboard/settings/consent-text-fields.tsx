"use client";

import { useTranslations } from "next-intl";

import { DashboardFormField } from "@/components/dashboard/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDirection, type Locale } from "@/i18n/config";
import type {
  ConsentSettings,
  ConsentTextField,
} from "@/lib/site-settings/consent";

const fieldLabels = {
  title: "bannerTitle",
  description: "bannerDescription",
  policyLabel: "policyLabel",
  necessaryLabel: "necessaryLabel",
  acceptLabel: "acceptLabel",
  customizeLabel: "customizeLabel",
  saveLabel: "saveLabel",
  necessaryTitle: "necessaryTitle",
  necessaryDescription: "necessaryDescriptionText",
  statisticsTitle: "statisticsTitle",
  statisticsDescription: "statisticsDescriptionText",
  marketingTitle: "marketingTitle",
  marketingDescription: "marketingDescriptionText",
} as const satisfies Record<ConsentTextField, string>;

type Props = {
  field: ConsentTextField;
  locale: Locale;
  value: ConsentSettings;
  fallback: (field: ConsentTextField) => string;
  onChange: (field: ConsentTextField, locale: Locale, text: string) => void;
};

export function ConsentTextFieldInput({
  field,
  locale,
  value,
  fallback,
  onChange,
}: Props) {
  const t = useTranslations("dashboard.settings");
  const id = `consent-${field}-${locale}`;
  const dir = getDirection(locale);
  const multiline = field.endsWith("Description");

  const shared = {
    id,
    dir,
    value: value[field][locale] ?? "",
    placeholder: fallback(field),
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(field, locale, event.target.value),
  };

  return (
    <DashboardFormField
      id={id}
      label={t(`consent.${fieldLabels[field]}`)}
      description={
        field === "description" ? t("consent.descriptionHint") : undefined
      }
    >
      {multiline ? (
        <Textarea {...shared} rows={field === "description" ? 4 : 2} />
      ) : (
        <Input {...shared} />
      )}
    </DashboardFormField>
  );
}
