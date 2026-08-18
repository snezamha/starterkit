"use client";

import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  customThemeColorKey,
  hexToCss,
  normalizeThemeHex,
  presetThemeColorKeys,
} from "@/lib/theme/custom-color";
import { colorPresets } from "@/lib/theme/presets";
import { cn } from "@/lib/utils";

import type { SettingsSectionProps } from "./section";

export function ColorSchemePicker({
  value,
  onChange,
}: SettingsSectionProps<"theme">) {
  const t = useTranslations("dashboard.settings");
  const customColor = hexToCss(value.customColor);
  const isCustom = value.color === customThemeColorKey;

  function selectCustomColor(hex: string) {
    onChange({ customColor: hex, color: customThemeColorKey });
  }

  return (
    <div className="grid gap-3">
      <p className="font-medium">{t("appearanceCard.colorScheme")}</p>
      <div className="flex flex-wrap gap-3">
        {presetThemeColorKeys.map((key) => {
          const preset = colorPresets[key];
          const isSelected = value.color === key;

          return (
            <Button
              key={key}
              type="button"
              variant="ghost"
              title={t(`appearanceCard.colors.${key}`)}
              aria-label={t(`appearanceCard.colors.${key}`)}
              aria-pressed={isSelected}
              onClick={() => onChange({ color: key })}
              className={cn(
                "relative size-9 rounded-full p-0 ring-2 ring-transparent ring-offset-2 ring-offset-background",
                isSelected && "ring-primary",
              )}
            >
              <span
                className="size-9 rounded-full"
                style={{ backgroundColor: preset.swatch }}
              />
              {isSelected ? (
                <CheckIcon className="absolute size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
              ) : null}
            </Button>
          );
        })}

        <Button
          type="button"
          variant="ghost"
          title={t("appearanceCard.colors.custom")}
          aria-label={t("appearanceCard.colors.custom")}
          aria-pressed={isCustom}
          onClick={() => onChange({ color: customThemeColorKey })}
          className={cn(
            "relative size-9 rounded-full p-0 ring-2 ring-transparent ring-offset-2 ring-offset-background",
            isCustom && "ring-primary",
          )}
        >
          <span
            className="size-9 rounded-full ring-1 ring-black/10"
            style={{
              backgroundColor: customColor,
              backgroundImage:
                "linear-gradient(135deg, transparent 45%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.12) 55%, transparent 55%)",
            }}
          />
          {isCustom ? (
            <CheckIcon className="absolute size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
          ) : null}
        </Button>
      </div>
      {isCustom ? (
        <div className="flex flex-wrap items-start gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="theme-custom-color">
              {t("appearanceCard.customColor")}
            </Label>
            <input
              id="theme-custom-color"
              type="color"
              value={customColor}
              onChange={(event) => selectCustomColor(event.target.value)}
              className="border-input bg-background h-9 w-9 cursor-pointer rounded-lg border p-1"
              aria-label={t("appearanceCard.customColor")}
            />
          </div>
          <div className="min-w-[10rem] flex-1 space-y-1.5">
            <Label htmlFor="theme-custom-hex">
              {t("appearanceCard.customColorHex")}
            </Label>
            <Input
              id="theme-custom-hex"
              value={value.customColor}
              onChange={(event) => selectCustomColor(event.target.value)}
              onBlur={(event) => {
                const normalized = normalizeThemeHex(event.target.value);

                if (normalized) {
                  selectCustomColor(normalized);
                }
              }}
              placeholder="#2563eb"
              dir="ltr"
              spellCheck={false}
              className="h-9 font-mono"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
