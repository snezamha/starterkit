"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { LoadingSettings } from "@/lib/site-settings/loading";
import type { ThemeSettings } from "@/lib/site-settings/theme";
import { resolveThemeSwatchColor } from "@/lib/theme/presets";

import { ColorSchemePicker } from "./color-scheme-picker";
import { DefaultThemePicker } from "./default-theme-picker";
import { LoadingSettingsCard } from "./loading-settings-card";
import { RadiusPicker } from "./radius-picker";

type Props = {
  theme: ThemeSettings;
  loading: LoadingSettings;
  onThemeChange: (patch: Partial<ThemeSettings>) => void;
  onLoadingChange: (patch: Partial<LoadingSettings>) => void;
};

export function AppearanceSettingsCard({
  theme,
  loading,
  onThemeChange,
  onLoadingChange,
}: Props) {
  return (
    <Card>
      <CardContent className="space-y-8">
        <DefaultThemePicker value={theme} onChange={onThemeChange} />
        <Separator />
        <ColorSchemePicker value={theme} onChange={onThemeChange} />
        <Separator />
        <RadiusPicker value={theme} onChange={onThemeChange} />
        <Separator />
        <LoadingSettingsCard
          value={loading}
          onChange={onLoadingChange}
          themeColor={resolveThemeSwatchColor(theme.color, theme.customColor)}
        />
      </CardContent>
    </Card>
  );
}
