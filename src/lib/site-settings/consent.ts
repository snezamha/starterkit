import { locales, type Locale } from "@/i18n/config";
import { consentCategories, type ConsentCategory } from "@/lib/consent/cookie";

export const consentPositionOptions = [
  "top-start",
  "top-center",
  "top-end",
  "center",
  "bottom-start",
  "bottom-center",
  "bottom-end",
] as const;

export type ConsentPosition = (typeof consentPositionOptions)[number];

export const consentTextFields = [
  "title",
  "description",
  "policyLabel",
  "necessaryLabel",
  "acceptLabel",
  "customizeLabel",
  "saveLabel",
  "necessaryTitle",
  "necessaryDescription",
  "statisticsTitle",
  "statisticsDescription",
  "marketingTitle",
  "marketingDescription",
] as const;

export type ConsentTextField = (typeof consentTextFields)[number];

export type ConsentTexts = Record<ConsentTextField, string>;

export type ConsentSettings = {
  enabled: boolean;
  showReopenButton: boolean;
  position: ConsentPosition;
  policyUrl: string;
  version: number;
  categories: Record<ConsentCategory, boolean>;
} & Record<ConsentTextField, Record<Locale, string>>;

const maxTextLength: Record<ConsentTextField, number> = {
  title: 120,
  description: 600,
  policyLabel: 80,
  necessaryLabel: 60,
  acceptLabel: 60,
  customizeLabel: 60,
  saveLabel: 60,
  necessaryTitle: 80,
  necessaryDescription: 300,
  statisticsTitle: 80,
  statisticsDescription: 300,
  marketingTitle: 80,
  marketingDescription: 300,
};

function localeRecord(value: string): Record<Locale, string> {
  return Object.fromEntries(locales.map((locale) => [locale, value])) as Record<
    Locale,
    string
  >;
}

function emptyTexts(): Record<ConsentTextField, Record<Locale, string>> {
  return Object.fromEntries(
    consentTextFields.map((field) => [field, localeRecord("")]),
  ) as Record<ConsentTextField, Record<Locale, string>>;
}

export const defaultConsentSettings: ConsentSettings = {
  enabled: true,
  showReopenButton: true,
  position: "bottom-start",
  policyUrl: "",
  version: 1,
  categories: { statistics: true, marketing: false },
  ...emptyTexts(),
};

export function resolveConsentTexts(
  settings: ConsentSettings,
  locale: Locale,
  fallback: (field: ConsentTextField) => string,
): ConsentTexts {
  return Object.fromEntries(
    consentTextFields.map((field) => [
      field,
      settings[field][locale]?.trim() || fallback(field),
    ]),
  ) as ConsentTexts;
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function sanitizeLocaleRecord(
  value: unknown,
  maxLength: number,
): Record<Locale, string> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const next = localeRecord("");

  for (const locale of locales) {
    next[locale] = sanitizeText(record[locale], maxLength);
  }

  return next;
}

function sanitizeConsentPosition(value: unknown): ConsentPosition | undefined {
  return consentPositionOptions.includes(value as ConsentPosition)
    ? (value as ConsentPosition)
    : undefined;
}

function sanitizeVersion(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const version = Math.round(value);

  return version < 1 || version > 9999 ? undefined : version;
}

function sanitizeCategories(
  value: unknown,
): Record<ConsentCategory, boolean> | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const record = value as Record<string, unknown>;

  return Object.fromEntries(
    consentCategories.map((category) => [category, record[category] === true]),
  ) as Record<ConsentCategory, boolean>;
}

function sanitizePolicyUrl(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim().slice(0, 300);

  if (trimmed.length === 0) {
    return "";
  }

  return /^(https?:\/\/|\/)/.test(trimmed) ? trimmed : undefined;
}

export function sanitizeConsentSettings(
  data: Partial<ConsentSettings>,
): Partial<ConsentSettings> {
  const next: Partial<ConsentSettings> = {};

  if (typeof data.enabled === "boolean") {
    next.enabled = data.enabled;
  }

  if (typeof data.showReopenButton === "boolean") {
    next.showReopenButton = data.showReopenButton;
  }

  const position = sanitizeConsentPosition(data.position);

  if (position) {
    next.position = position;
  }

  const version = sanitizeVersion(data.version);

  if (version) {
    next.version = version;
  }

  const categories = sanitizeCategories(data.categories);

  if (categories) {
    next.categories = categories;
  }

  const policyUrl = sanitizePolicyUrl(data.policyUrl);

  if (policyUrl !== undefined) {
    next.policyUrl = policyUrl;
  }

  for (const field of consentTextFields) {
    const record = sanitizeLocaleRecord(data[field], maxTextLength[field]);

    if (record) {
      next[field] = record;
    }
  }

  return next;
}

export function parseConsentSettings(value: unknown): ConsentSettings {
  const record =
    value && typeof value === "object"
      ? (value as Partial<ConsentSettings>)
      : {};

  return { ...defaultConsentSettings, ...sanitizeConsentSettings(record) };
}
