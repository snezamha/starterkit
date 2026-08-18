"use client";

import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import type { ThemeMode } from "@/lib/site-settings/theme";
import { cn } from "@/lib/utils";

import type { SettingsSectionProps } from "./section";

const modeOptions = [
  { value: "light", icon: SunIcon },
  { value: "dark", icon: MoonIcon },
  { value: "system", icon: MonitorIcon },
] as const;

export function DefaultThemePicker({
  value,
  onChange,
}: SettingsSectionProps<"theme">) {
  const t = useTranslations("dashboard.settings");

  return (
    <div className="grid gap-3">
      <p className="font-medium">{t("appearanceCard.defaultMode")}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {modeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value.defaultMode === option.value;

          return (
            <Button
              key={option.value}
              type="button"
              variant="ghost"
              onClick={() =>
                onChange({ defaultMode: option.value as ThemeMode })
              }
              className={cn(
                "h-auto justify-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-start font-normal",
                isSelected
                  ? "border-primary bg-primary/10 hover:bg-primary/10"
                  : "hover:bg-muted/70",
              )}
            >
              <Icon className="size-4 text-primary" />
              <span className="flex-1 text-sm font-medium">
                {t(`theme.${option.value}.title`)}
              </span>
              {isSelected ? (
                <CheckIcon className="size-4 text-primary" />
              ) : null}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
