import { defaultLocale, locales, type Locale } from "@/i18n/config";

export type LocaleSettings = {
  defaultLocale: Locale;
};

export const defaultLocaleSettings: LocaleSettings = {
  defaultLocale,
};

function sanitizeDefaultLocale(value: unknown): Locale | undefined {
  return typeof value === "string" &&
    (locales as readonly string[]).includes(value)
    ? (value as Locale)
    : undefined;
}

export function sanitizeLocaleSettings(
  data: Partial<LocaleSettings>,
): Partial<LocaleSettings> {
  const nextDefaultLocale = sanitizeDefaultLocale(data.defaultLocale);

  return {
    ...(nextDefaultLocale && { defaultLocale: nextDefaultLocale }),
  };
}

export function parseLocaleSettings(value: unknown): LocaleSettings {
  const record =
    value && typeof value === "object"
      ? (value as Partial<LocaleSettings>)
      : {};

  return { ...defaultLocaleSettings, ...sanitizeLocaleSettings(record) };
}
