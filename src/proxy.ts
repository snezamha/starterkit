import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/site-settings/store";

export async function proxy(request: NextRequest) {
  const hasLocaleCookie = request.cookies.has("NEXT_LOCALE");

  if (hasLocaleCookie) {
    return createMiddleware(routing)(request);
  }

  const settings = await getSiteSettings();
  const firstVisitMiddleware = createMiddleware({
    ...routing,
    defaultLocale: settings.locale.defaultLocale,
    localeDetection: false,
  });

  return firstVisitMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
