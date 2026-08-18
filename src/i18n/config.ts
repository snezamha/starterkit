export const locales = ["en", "de", "fa"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const defaultTimeZone = "UTC";

const rtlLocales: readonly Locale[] = ["fa"];

export function getDirection(locale: Locale): "ltr" | "rtl" {
  return rtlLocales.includes(locale) ? "rtl" : "ltr";
}
