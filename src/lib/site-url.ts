import { env } from "@/env";

const FALLBACK_SITE_URL = "http://localhost:3000";

export function getSiteUrl(): string {
  const raw = env.SITE_URL ?? env.BETTER_AUTH_URL ?? FALLBACK_SITE_URL;

  return raw.replace(/\/+$/, "") || FALLBACK_SITE_URL;
}

export function absoluteUrl(path: string): string {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
