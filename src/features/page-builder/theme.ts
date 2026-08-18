import { z } from "zod";

export type PageTheme = {
  primary: string;
  primaryForeground: string;
  secondary: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  fontSans: string;
  fontSizeBase: number;
  radius: number;
  spacing: number;
};

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/);
const safeCssValue = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[^;{}]+$/);

export const pageThemeSchema = z.object({
  primary: color,
  primaryForeground: color,
  secondary: color,
  background: color,
  foreground: color,
  muted: color,
  mutedForeground: color,
  border: color,
  fontSans: safeCssValue,
  fontSizeBase: z.number().min(10).max(20),
  radius: z.number().min(0).max(32),
  spacing: z.number().min(8).max(48),
});

export const DEFAULT_PAGE_THEME: PageTheme = {
  primary: "#18181b",
  primaryForeground: "#fafafa",
  secondary: "#f4f4f5",
  background: "#ffffff",
  foreground: "#09090b",
  muted: "#f4f4f5",
  mutedForeground: "#71717a",
  border: "#e4e4e7",
  fontSans: "'Inter', sans-serif",
  fontSizeBase: 14,
  radius: 12,
  spacing: 16,
};

export function themeToCSS(theme: PageTheme): string {
  const round = (value: number) => Math.round(value);

  return `
:root {
  --primary: ${theme.primary};
  --primary-foreground: ${theme.primaryForeground};
  --secondary: ${theme.secondary};
  --background: ${theme.background};
  --foreground: ${theme.foreground};
  --muted: ${theme.muted};
  --muted-foreground: ${theme.mutedForeground};
  --border: ${theme.border};
  --font-sans: ${theme.fontSans};
  --font-size-base: ${theme.fontSizeBase}px;
  --font-weight-normal: 400;
  --font-weight-bold: 700;
  --radius-sm: ${round(theme.radius * 0.4)}px;
  --radius-md: ${round(theme.radius * 0.7)}px;
  --radius-lg: ${theme.radius}px;
  --spacing-sm: ${round(theme.spacing * 0.5)}px;
  --spacing-md: ${theme.spacing}px;
  --spacing-lg: ${theme.spacing * 2}px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.15);
}
`.trim();
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseThemeData(
  raw: Record<string, unknown> | null | undefined,
): PageTheme {
  if (!raw) return DEFAULT_PAGE_THEME;
  const legacyRadius = toNumber(raw.radiusLg);
  const legacySpacing = toNumber(raw.spacingMd);
  const parsed = pageThemeSchema.safeParse({
    ...DEFAULT_PAGE_THEME,
    ...raw,
    ...(raw.radius === undefined && legacyRadius !== null
      ? { radius: legacyRadius }
      : {}),
    ...(raw.spacing === undefined && legacySpacing !== null
      ? { spacing: legacySpacing }
      : {}),
  });
  return parsed.success ? parsed.data : DEFAULT_PAGE_THEME;
}
