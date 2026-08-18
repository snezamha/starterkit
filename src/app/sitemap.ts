import type { MetadataRoute } from "next";

import { listPublishedProjectPageEntries } from "@/features/page-builder/page-db";
import { locales, type Locale } from "@/i18n/config";
import { absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type SlugByLocale = Partial<Record<Locale, string>>;

function toAlternates(slugs: SlugByLocale): Record<string, string> {
  return Object.fromEntries(
    locales
      .filter((locale) => slugs[locale] !== undefined)
      .map((locale) => [locale, absoluteUrl(`/${locale}/${slugs[locale]}`)]),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await listPublishedProjectPageEntries();
  const homeAlternates = Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(`/${locale}`)]),
  );

  const entries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: absoluteUrl(`/${locale}`),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
    alternates: { languages: homeAlternates },
  }));

  for (const page of pages) {
    if (page.isHomepage) continue;

    const slugs: SlugByLocale = Object.fromEntries(
      page.slugs.map(({ locale, slug }) => [locale, slug]),
    );
    const languages = toAlternates(slugs);

    for (const locale of locales) {
      const slug = slugs[locale];
      if (!slug) continue;

      entries.push({
        url: absoluteUrl(`/${locale}/${slug}`),
        lastModified: page.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
