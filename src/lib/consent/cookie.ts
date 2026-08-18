export const consentCookieName = "cookie_consent";
export const consentCookieMaxAge = 60 * 60 * 24 * 365;

export const consentCategories = ["statistics", "marketing"] as const;

export type ConsentCategory = (typeof consentCategories)[number];

export type ConsentValue = {
  version: number;
  timestamp: number;
  categories: Record<ConsentCategory, boolean>;
};

export function parseConsentCookie(
  raw: string | undefined,
): ConsentValue | null {
  if (!raw) return null;

  try {
    const data = JSON.parse(decodeURIComponent(raw)) as Partial<ConsentValue>;

    if (
      typeof data.version !== "number" ||
      typeof data.timestamp !== "number" ||
      !data.categories ||
      typeof data.categories !== "object"
    ) {
      return null;
    }

    const categories = Object.fromEntries(
      consentCategories.map((category) => [
        category,
        data.categories?.[category] === true,
      ]),
    ) as Record<ConsentCategory, boolean>;

    return { version: data.version, timestamp: data.timestamp, categories };
  } catch {
    return null;
  }
}

export function serializeConsentCookie(value: ConsentValue): string {
  return encodeURIComponent(JSON.stringify(value));
}

export function isConsentCurrent(
  value: ConsentValue | null,
  version: number,
): value is ConsentValue {
  return value !== null && value.version >= version;
}
