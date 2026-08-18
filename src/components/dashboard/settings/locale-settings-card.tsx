"use client";

import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";
import { locales, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

import type { SettingsSectionProps } from "./section";

export function LocaleSettingsCard({
  value,
  onChange,
}: SettingsSectionProps<"locale">) {
  const t = useTranslations("dashboard.settings");

  return (
    <Card>
      <CardContent>
        <div className="grid gap-3">
          <p className="font-medium">{t("localeCard.defaultLocale")}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {locales.map((locale) => {
              const isSelected = value.defaultLocale === locale;

              return (
                <button
                  key={locale}
                  type="button"
                  onClick={() => onChange({ defaultLocale: locale as Locale })}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-start transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted/70",
                  )}
                >
                  <span className="flex-1 text-sm font-medium">
                    {t(`locales.${locale}`)}
                  </span>
                  {isSelected ? (
                    <CheckIcon className="size-4 text-primary" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
