"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { radiusPresets } from "@/lib/theme/presets";
import { cn } from "@/lib/utils";

import type { SettingsSectionProps } from "./section";

export function RadiusPicker({
  value,
  onChange,
}: SettingsSectionProps<"theme">) {
  const t = useTranslations("dashboard.settings");

  return (
    <div className="grid gap-3">
      <p className="font-medium">{t("appearanceCard.borderRadius")}</p>
      <div className="flex flex-wrap gap-2">
        {radiusPresets.map((preset) => {
          const isSelected = value.radius === preset.value;

          return (
            <Button
              key={preset.value}
              type="button"
              variant="ghost"
              onClick={() => onChange({ radius: preset.value })}
              className={cn(
                "h-auto justify-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 font-normal",
                isSelected
                  ? "border-primary bg-primary/10 hover:bg-primary/10"
                  : "hover:bg-muted/70",
              )}
            >
              <span
                className="size-5 border-2 border-primary bg-background"
                style={{ borderRadius: `${preset.value}rem` }}
              />
              <span className="text-sm font-medium">
                {t(`appearanceCard.radius.${preset.label}`)}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
