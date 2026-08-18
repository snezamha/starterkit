import { locales } from "@/i18n/config";

const UNTRACKED_PREFIXES = ["/dashboard", "/auth"];
const MAX_PAGE_LENGTH = 200;

export function getTrackedPage(pathname: string): string | null {
  if (!pathname.startsWith("/") || pathname.length > MAX_PAGE_LENGTH) {
    return null;
  }

  const [maybeLocale, ...segments] = pathname
    .split("?")[0]!
    .split("/")
    .filter(Boolean);

  if (!maybeLocale || !(locales as readonly string[]).includes(maybeLocale)) {
    return null;
  }

  if (segments.some((segment) => segment === "..")) {
    return null;
  }

  const page = `/${segments.join("/")}`;

  if (UNTRACKED_PREFIXES.some((prefix) => page.startsWith(prefix))) {
    return null;
  }

  return page;
}
