import { hasLocale } from "next-intl";

import type { Locale } from "./config";
import { routing } from "./routing";

export function resolveLocale(value: string): Locale {
  return hasLocale(routing.locales, value) ? value : routing.defaultLocale;
}
