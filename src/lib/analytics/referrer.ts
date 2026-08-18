export const DIRECT_REFERRER = "direct";
export const INTERNAL_REFERRER = "internal";

export function normalizeReferrer(referrer: unknown, selfHost: string): string {
  if (typeof referrer !== "string" || referrer.length === 0) {
    return DIRECT_REFERRER;
  }

  try {
    const { hostname } = new URL(referrer);

    if (!hostname) return DIRECT_REFERRER;
    if (hostname === selfHost) return INTERNAL_REFERRER;

    return hostname.replace(/^www\./, "").slice(0, 100);
  } catch {
    return DIRECT_REFERRER;
  }
}
