import { radiusPresets } from "@/lib/theme/presets";
import {
  customThemeColorKey,
  defaultThemeCustomColor,
  presetThemeColorKeys,
  sanitizeThemeCustomColor,
} from "@/lib/theme/custom-color";

export type PresetThemeColor = (typeof presetThemeColorKeys)[number];
type ThemeColor = PresetThemeColor | typeof customThemeColorKey;

export const themeModes = ["light", "dark", "system"] as const;
export type ThemeMode = (typeof themeModes)[number];

export type ThemeSettings = {
  color: ThemeColor;
  customColor: string;
  radius: number;
  defaultMode: ThemeMode;
};

export const defaultThemeSettings: ThemeSettings = {
  color: "neutral",
  customColor: defaultThemeCustomColor,
  radius: 0.625,
  defaultMode: "system",
};

function sanitizeThemeRadius(value: unknown): number | undefined {
  if (typeof value !== "number") {
    return undefined;
  }

  return radiusPresets.some((preset) => preset.value === value)
    ? value
    : undefined;
}

function sanitizeThemeColor(value: unknown): ThemeColor | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  return value === customThemeColorKey ||
    (presetThemeColorKeys as readonly string[]).includes(value)
    ? (value as ThemeColor)
    : undefined;
}

function sanitizeThemeDefaultMode(value: unknown): ThemeMode | undefined {
  return typeof value === "string" &&
    (themeModes as readonly string[]).includes(value)
    ? (value as ThemeMode)
    : undefined;
}

export function sanitizeThemeSettings(
  data: Partial<ThemeSettings>,
): Partial<ThemeSettings> {
  const color = sanitizeThemeColor(data.color);
  const customColor = sanitizeThemeCustomColor(data.customColor);
  const radius = sanitizeThemeRadius(data.radius);
  const defaultMode = sanitizeThemeDefaultMode(data.defaultMode);

  return {
    ...(color && { color }),
    ...(customColor && { customColor }),
    ...(radius !== undefined && { radius }),
    ...(defaultMode && { defaultMode }),
  };
}

export function parseThemeSettings(value: unknown): ThemeSettings {
  const record =
    value && typeof value === "object" ? (value as Partial<ThemeSettings>) : {};

  return { ...defaultThemeSettings, ...sanitizeThemeSettings(record) };
}
