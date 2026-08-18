import type { Metadata } from "next";
import { LayoutDashboardIcon } from "lucide-react";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { PublicPageView } from "@/features/page-builder/frontend/public-page";
import { getPublishedProjectPageByPath } from "@/features/page-builder/page-db";
import { mapPageRecord } from "@/features/page-builder/page-record";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

function resolveLocale(localeParam: string): Locale {
  return hasLocale(routing.locales, localeParam)
    ? localeParam
    : routing.defaultLocale;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const page = await getPublishedProjectPageByPath(locale, "home");

  if (page) {
    const translation = page.translations.find(
      (item) => item.locale === locale,
    );
    const title = translation?.seoTitle || translation?.title || undefined;
    const description =
      translation?.seoDescription || translation?.excerpt || undefined;

    return {
      title,
      description,
      robots: page.noIndex ? { index: false } : undefined,
    };
  }

  const t = await getTranslations({ locale, namespace: "common.home" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function Home({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  setRequestLocale(locale);

  const page = await getPublishedProjectPageByPath(locale, "home");

  if (page) {
    return <PublicPageView content={mapPageRecord(page)} locale={locale} />;
  }

  const t = await getTranslations({ locale, namespace: "common.home" });
  const tDashboard = await getTranslations({
    locale,
    namespace: "dashboard",
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <Link
          className={buttonVariants({ variant: "ghost", size: "icon" })}
          href="/dashboard"
          aria-label={tDashboard("nav.dashboard")}
        >
          <LayoutDashboardIcon />
        </Link>
      </div>
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
    </div>
  );
}
