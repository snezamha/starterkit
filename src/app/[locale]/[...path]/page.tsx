import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { PublicPageView } from "@/features/page-builder/frontend/public-page";
import { getPublishedProjectPageByPath } from "@/features/page-builder/page-db";
import { mapPageRecord } from "@/features/page-builder/page-record";
import type { Locale } from "@/i18n/config";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string; path: string[] }>;
};

function resolveLocale(localeParam: string): Locale {
  return hasLocale(routing.locales, localeParam)
    ? localeParam
    : routing.defaultLocale;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam, path } = await params;
  const locale = resolveLocale(localeParam);
  const slug = path.join("/");

  if (!slug) return {};

  const page = await getPublishedProjectPageByPath(locale, slug);

  if (!page) return {};

  const translation = page.translations.find((item) => item.locale === locale);
  const title = translation?.seoTitle || translation?.title || undefined;
  const description =
    translation?.seoDescription || translation?.excerpt || undefined;

  return {
    title,
    description,
    robots: page.noIndex ? { index: false } : undefined,
  };
}

export default async function PublicPathRoute({ params }: Props) {
  const { locale: localeParam, path } = await params;
  const locale = resolveLocale(localeParam);

  setRequestLocale(locale);

  const slug = path.join("/");
  const page = slug ? await getPublishedProjectPageByPath(locale, slug) : null;

  if (!page) {
    notFound();
  }

  return <PublicPageView content={mapPageRecord(page)} locale={locale} />;
}
