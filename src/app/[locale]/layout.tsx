import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";

import { Suspense } from "react";

import { SessionTracker } from "@/components/analytics/session-tracker";
import { CookieConsent } from "@/components/consent/cookie-consent";
import { getThemeScript } from "@/components/theme-script";
import { RouteLoadingIndicator } from "@/components/loading/route-loading-indicator";
import { ConsentProvider } from "@/components/providers/consent-context";
import { LoadingSettingsProvider } from "@/components/providers/loading-context";
import { ToastProvider } from "@/components/providers/toast-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getDirection, locales, type Locale } from "@/i18n/config";
import { resolveLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { resolveConsentTexts } from "@/lib/site-settings/consent";
import { getSiteSettings } from "@/lib/site-settings/store";
import { getSiteUrl } from "@/lib/site-url";
import { generateThemeCss } from "@/lib/theme/presets";
import "@/styles/app.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const { metadata } = await getSiteSettings();

  const title = metadata.title[locale]?.trim() || "Next.js Starterkit";
  const description =
    metadata.description[locale]?.trim() || "A localized Next.js starterkit.";

  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: title, template: `%s | ${title}` },
    description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale: Locale = localeParam;

  setRequestLocale(locale);
  const [messages, settings] = await Promise.all([
    getMessages(),
    getSiteSettings(),
  ]);
  const consent = settings.consent;
  const tConsent = await getTranslations({
    locale,
    namespace: "common.consent",
  });
  const consentTexts = resolveConsentTexts(
    consent,
    locale,
    (field) => tConsent.raw(`defaults.${field}`) as string,
  );
  const themeCss = generateThemeCss(
    settings.theme.color,
    settings.theme.radius,
    settings.theme.customColor,
  );

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html: getThemeScript(settings.theme.defaultMode),
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        <NextIntlClientProvider messages={messages}>
          <ConsentProvider version={consent.version}>
            <SessionTracker />
            <LoadingSettingsProvider settings={settings.loading}>
              <Suspense fallback={null}>
                <RouteLoadingIndicator />
              </Suspense>
              <TooltipProvider>
                <ToastProvider>{children}</ToastProvider>
              </TooltipProvider>
              {consent.enabled && (
                <CookieConsent
                  texts={consentTexts}
                  policyUrl={consent.policyUrl}
                  position={consent.position}
                  showReopenButton={consent.showReopenButton}
                  categories={consent.categories}
                />
              )}
            </LoadingSettingsProvider>
          </ConsentProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
