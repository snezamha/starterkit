import type { Prisma } from "@prisma/client";

import type { Locale } from "@/i18n/config";
import { prisma } from "@/lib/prisma";

export type PageLocale = Locale;

type ProjectDbPageTranslation = {
  locale: PageLocale;
  slug: string;
  title: string;
  excerpt: string;
  builderData: unknown;
  seoTitle: string;
  seoDescription: string;
  navigationTitle: string;
  ogImage: string;
  canonicalUrl: string;
  enabled: boolean;
};

export type PageKind = "page" | "post";

export type ProjectDbPage = {
  id: string;
  kind: PageKind;
  status: string;
  isHomepage: boolean;
  noIndex: boolean;
  authorId: string;
  themeData: Record<string, unknown> | null;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  translations: ProjectDbPageTranslation[];
};

export type ProjectPageWriteInput = {
  kind?: PageKind;
  slugEn: string;
  slugFa: string | null;
  slugDe: string | null;
  status: string;
  isHomepage: boolean;
  noIndex: boolean;
  themeData: Record<string, unknown> | null;
  authorId: string;
  scheduledAt: Date | null;
  publishedAt: Date | null;
  translations: Record<
    PageLocale,
    Omit<ProjectDbPageTranslation, "locale" | "slug">
  >;
};

type PageListOptions = {
  page: number;
  pageSize: number;
  query: string;
  status: string;
};

type PageWithTranslations = Prisma.PageGetPayload<{
  include: { translations: true };
}>;

function asRecord(
  value: Prisma.JsonValue | null,
): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function toJsonObject(
  value: Record<string, unknown> | null,
): Prisma.InputJsonValue {
  return (value ?? {}) as Prisma.InputJsonValue;
}

function rowToPage(row: PageWithTranslations): ProjectDbPage {
  return {
    id: row.id,
    kind: row.kind === "post" ? "post" : "page",
    status: row.status,
    isHomepage: row.isHomepage,
    noIndex: row.noIndex,
    authorId: row.authorId,
    themeData: asRecord(row.themeData),
    scheduledAt: row.scheduledAt,
    publishedAt: row.publishedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    translations: row.translations.map((translation) => ({
      locale: translation.locale as PageLocale,
      slug: translation.slug,
      title: translation.title,
      excerpt: translation.excerpt,
      builderData: translation.builderData,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
      navigationTitle: translation.navigationTitle,
      ogImage: translation.ogImage,
      canonicalUrl: translation.canonicalUrl,
      enabled: translation.enabled,
    })),
  };
}

function pageMatchesQuery(page: ProjectDbPage, query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;

  return page.translations.some((translation) =>
    [translation.title, translation.slug, translation.excerpt].some((value) =>
      value.toLocaleLowerCase().includes(normalized),
    ),
  );
}

function slugByLocale(input: ProjectPageWriteInput, locale: PageLocale) {
  if (locale === "en") return input.slugEn;
  if (locale === "fa") return input.slugFa;
  return input.slugDe;
}

async function getProjectPageRows(kind: PageKind) {
  return prisma.page
    .findMany({
      where: { kind },
      include: { translations: true },
      orderBy: { updatedAt: "desc" },
    })
    .then((rows) => rows.map(rowToPage));
}

export async function listProjectPages(
  options: PageListOptions,
  kind: PageKind = "page",
): Promise<{ items: ProjectDbPage[]; total: number }> {
  const pages = (await getProjectPageRows(kind)).filter((page) => {
    const matchesStatus =
      options.status === "all" || page.status === options.status;
    return matchesStatus && pageMatchesQuery(page, options.query);
  });
  const start = Math.max(0, (options.page - 1) * options.pageSize);

  return {
    items: pages.slice(start, start + options.pageSize),
    total: pages.length,
  };
}

export async function getProjectPageById(pageId: string) {
  const page = await prisma.page.findFirst({
    where: { id: pageId },
    include: { translations: true },
  });

  return page ? rowToPage(page) : null;
}

export async function getProjectHomepageId() {
  const page = await prisma.page.findFirst({
    where: { isHomepage: true },
    select: { id: true },
  });

  return page?.id ?? null;
}

export async function getPublishedProjectPageByPath(
  locale: Locale,
  slug: string,
) {
  const page = await prisma.page.findFirst({
    where: {
      kind: "page",
      status: "published",
      translations: {
        some:
          slug === "home"
            ? { locale, enabled: true }
            : { locale, slug, enabled: true },
      },
      ...(slug === "home" ? { isHomepage: true } : {}),
    },
    include: { translations: true },
  });

  return page ? rowToPage(page) : null;
}

export async function listPublishedProjectPageEntries() {
  const pages = await prisma.page.findMany({
    where: { kind: "page", status: "published", noIndex: false },
    select: {
      isHomepage: true,
      updatedAt: true,
      translations: {
        where: { enabled: true },
        select: { locale: true, slug: true },
      },
    },
  });

  return pages.map((page) => ({
    isHomepage: page.isHomepage,
    updatedAt: page.updatedAt,
    slugs: page.translations.map((translation) => ({
      locale: translation.locale as PageLocale,
      slug: translation.slug,
    })),
  }));
}

export async function assertProjectSlugsAvailable(
  slugs: { slugEn: string; slugFa: string | null; slugDe: string | null },
  excludePageId?: string,
) {
  for (const [locale, slug] of [
    ["en", slugs.slugEn],
    ["fa", slugs.slugFa],
    ["de", slugs.slugDe],
  ] as const) {
    if (!slug) continue;

    const existing = await prisma.pageContent.findFirst({
      where: {
        locale,
        slug,
        ...(excludePageId ? { pageId: { not: excludePageId } } : {}),
      },
      select: { id: true },
    });

    if (existing) throw new Error("Slug already exists");
  }
}

async function clearOtherHomepages(pageId?: string) {
  await prisma.page.updateMany({
    where: {
      isHomepage: true,
      ...(pageId ? { id: { not: pageId } } : {}),
    },
    data: { isHomepage: false },
  });
}

export async function createProjectPage(input: ProjectPageWriteInput) {
  await assertProjectSlugsAvailable(input);
  if (input.isHomepage) await clearOtherHomepages();

  const page = await prisma.$transaction(async (tx) => {
    const created = await tx.page.create({
      data: {
        kind: input.kind ?? "page",
        status: input.status,
        isHomepage: input.isHomepage,
        noIndex: input.noIndex,
        authorId: input.authorId,
        themeData: toJsonObject(input.themeData),
        scheduledAt: input.scheduledAt,
        publishedAt: input.publishedAt,
      },
    });

    for (const locale of ["en", "fa", "de"] as const) {
      const slug = slugByLocale(input, locale);
      if (!slug) continue;
      const translation = input.translations[locale];
      await tx.pageContent.create({
        data: {
          pageId: created.id,
          locale,
          slug,
          title: translation.title,
          excerpt: translation.excerpt,
          builderData: translation.builderData as Prisma.InputJsonValue,
          seoTitle: translation.seoTitle,
          seoDescription: translation.seoDescription,
          navigationTitle: translation.navigationTitle,
          ogImage: translation.ogImage,
          canonicalUrl: translation.canonicalUrl,
          enabled: translation.enabled,
        },
      });
    }

    return tx.page.findUniqueOrThrow({
      where: { id: created.id },
      include: { translations: true },
    });
  });

  return rowToPage(page);
}

export async function updateProjectPage(
  pageId: string,
  input: ProjectPageWriteInput,
) {
  await assertProjectSlugsAvailable(input, pageId);
  if (input.isHomepage) await clearOtherHomepages(pageId);

  const page = await prisma.$transaction(async (tx) => {
    await tx.page.update({
      where: { id: pageId },
      data: {
        status: input.status,
        isHomepage: input.isHomepage,
        noIndex: input.noIndex,
        authorId: input.authorId,
        themeData: toJsonObject(input.themeData),
        scheduledAt: input.scheduledAt,
        publishedAt: input.publishedAt,
      },
    });

    for (const locale of ["en", "fa", "de"] as const) {
      const slug = slugByLocale(input, locale);
      if (!slug) continue;
      const translation = input.translations[locale];
      await tx.pageContent.upsert({
        where: { pageId_locale: { pageId, locale } },
        create: {
          pageId,
          locale,
          slug,
          title: translation.title,
          excerpt: translation.excerpt,
          builderData: translation.builderData as Prisma.InputJsonValue,
          seoTitle: translation.seoTitle,
          seoDescription: translation.seoDescription,
          navigationTitle: translation.navigationTitle,
          ogImage: translation.ogImage,
          canonicalUrl: translation.canonicalUrl,
          enabled: translation.enabled,
        },
        update: {
          slug,
          title: translation.title,
          excerpt: translation.excerpt,
          builderData: translation.builderData as Prisma.InputJsonValue,
          seoTitle: translation.seoTitle,
          seoDescription: translation.seoDescription,
          navigationTitle: translation.navigationTitle,
          ogImage: translation.ogImage,
          canonicalUrl: translation.canonicalUrl,
          enabled: translation.enabled,
        },
      });
    }

    return tx.page.findUniqueOrThrow({
      where: { id: pageId },
      include: { translations: true },
    });
  });

  return rowToPage(page);
}

export async function updateProjectPageBuilderData(
  pageId: string,
  builderData: Record<PageLocale, unknown>,
) {
  await prisma.$transaction(
    (["en", "fa", "de"] as const).map((locale) =>
      prisma.pageContent.updateMany({
        where: { pageId, locale },
        data: { builderData: builderData[locale] as Prisma.InputJsonValue },
      }),
    ),
  );
}

export async function updateProjectPageTheme(
  pageId: string,
  themeData: Record<string, unknown> | null,
) {
  await prisma.page.update({
    where: { id: pageId },
    data: { themeData: toJsonObject(themeData) },
  });
}

export async function deleteProjectPage(pageId: string) {
  await prisma.page.delete({ where: { id: pageId } });
}
