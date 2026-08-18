import { locales, type Locale } from "@/i18n/config";

export type MetadataSettings = {
  title: Record<Locale, string>;
  description: Record<Locale, string>;
};

function emptyLocaleRecord(): Record<Locale, string> {
  return Object.fromEntries(locales.map((locale) => [locale, ""])) as Record<
    Locale,
    string
  >;
}

export const defaultMetadataSettings: MetadataSettings = {
  title: emptyLocaleRecord(),
  description: emptyLocaleRecord(),
};

function sanitizeText(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim().slice(0, 200);

  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeLocaleRecord(
  value: unknown,
): Record<Locale, string> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const next = emptyLocaleRecord();

  for (const locale of locales) {
    next[locale] = sanitizeText(record[locale]) ?? "";
  }

  return next;
}

export function sanitizeMetadataSettings(
  data: Partial<MetadataSettings>,
): Partial<MetadataSettings> {
  const title = sanitizeLocaleRecord(data.title);
  const description = sanitizeLocaleRecord(data.description);

  return {
    ...(title && { title }),
    ...(description && { description }),
  };
}

export function parseMetadataSettings(value: unknown): MetadataSettings {
  const record =
    value && typeof value === "object"
      ? (value as Partial<MetadataSettings>)
      : {};

  return { ...defaultMetadataSettings, ...sanitizeMetadataSettings(record) };
}
