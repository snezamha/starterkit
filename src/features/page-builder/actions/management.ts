"use server";

import { revalidatePath } from "next/cache";

import type { Locale } from "@/i18n/config";
import { defaultTimeZone } from "@/i18n/config";
import { getSessionUser } from "@/lib/auth/session";
import { ActionError } from "@/lib/errors/action-error";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import {
  assertProjectSlugsAvailable,
  createProjectPage,
  deleteProjectPage,
  getProjectHomepageId,
  getProjectPageById,
  listProjectPages,
  updateProjectPage,
  updateProjectPageBuilderData,
  updateProjectPageTheme,
  type PageKind,
  type ProjectDbPage,
  type ProjectPageWriteInput,
} from "@/features/page-builder/page-db";
import {
  pageBuilderDataUpdateSchema,
  pageCreateSchema,
  pageFormSchema,
  pageListQuerySchema,
  pageThemeUpdateSchema,
  type PageStatus,
} from "@/features/page-builder/schemas";
import { sanitizeSlug } from "@/features/page-builder/slug";
import { serializePuckData } from "@/features/page-builder/puck/data";
import { zonedDateTimeToUtc } from "@/features/page-builder/scheduled-time";
import { mapPageRecord } from "@/features/page-builder/page-record";
import type {
  PageCreateFormData,
  PageFormData,
  PageRecord,
} from "@/features/page-builder/types";

export type PaginatedPages = {
  items: PageRecord[];
  total: number;
  page: number;
  pageSize: number;
};

type ResolvedActor = {
  userId: string;
  role: "admin" | "user";
  timezone: string;
};

async function resolveActor(): Promise<ResolvedActor> {
  const user = await getSessionUser();
  if (!user) throw new ActionError("UNAUTHORIZED", "Unauthorized");

  return {
    userId: user.id,
    role: user.role,
    timezone: defaultTimeZone,
  };
}

function assertCanManage(actor: ResolvedActor, authorId: string) {
  if (actor.role === "admin") return;
  if (authorId && authorId === actor.userId) return;
  throw new ActionError("FORBIDDEN", "Unauthorized");
}

function normalizeOptionalSlug(value: string, locale: Locale) {
  const sanitized = sanitizeSlug(value, locale);
  return sanitized || null;
}

function normalizePageForm(data: PageFormData, timezone: string) {
  const parsed = pageFormSchema.safeParse({
    ...data,
    slugEn: sanitizeSlug(data.slugEn, "en"),
    slugFa: sanitizeSlug(data.slugFa, "fa"),
    slugDe: sanitizeSlug(data.slugDe, "de"),
  });

  if (!parsed.success) {
    throw new ActionError(
      "VALIDATION",
      parsed.error.issues[0]?.message ?? "Invalid page",
    );
  }

  const scheduledAt = parsed.data.scheduledAt
    ? zonedDateTimeToUtc(parsed.data.scheduledAt, timezone)
    : null;

  return {
    ...parsed.data,
    slugFa: normalizeOptionalSlug(parsed.data.slugFa, "fa"),
    slugDe: normalizeOptionalSlug(parsed.data.slugDe, "de"),
    scheduledAt,
  };
}

function buildWriteInput(
  payload: ReturnType<typeof normalizePageForm>,
  authorId: string,
  publishedAt: Date | null,
  themeData: Record<string, unknown> | null,
  builderData?: Record<Locale, unknown>,
): ProjectPageWriteInput {
  const toTranslation = (locale: Locale) => ({
    title: payload.translations[locale].title,
    excerpt: payload.translations[locale].excerpt,
    builderData: serializePuckData(
      builderData?.[locale] ?? payload.translations[locale].builderData,
    ),
    seoTitle: payload.translations[locale].seoTitle,
    seoDescription: payload.translations[locale].seoDescription,
    navigationTitle: payload.translations[locale].navigationTitle,
    ogImage: payload.translations[locale].ogImage,
    canonicalUrl: payload.translations[locale].canonicalUrl,
    enabled: payload.translations[locale].enabled,
  });

  return {
    slugEn: payload.slugEn,
    slugFa: payload.slugFa,
    slugDe: payload.slugDe,
    status: payload.status,
    isHomepage: payload.isHomepage,
    noIndex: payload.noIndex,
    themeData,
    authorId,
    scheduledAt: payload.scheduledAt,
    publishedAt,
    translations: {
      en: toTranslation("en"),
      fa: toTranslation("fa"),
      de: toTranslation("de"),
    },
  };
}

function revalidateProjectPages() {
  revalidatePath("/", "layout");
}

async function recordWithAuthor(page: ProjectDbPage): Promise<PageRecord> {
  return mapPageRecord(page, null);
}

export async function getPages(
  options: {
    page?: number;
    pageSize?: number;
    query?: string;
    status?: PageStatus | "all";
    kind?: PageKind;
  } = {},
): Promise<PaginatedPages> {
  await resolveActor();

  const parsed = pageListQuerySchema.parse({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
    query: options.query ?? "",
    status: options.status ?? "all",
  });

  const result = await listProjectPages(
    {
      page: parsed.page,
      pageSize: parsed.pageSize,
      query: parsed.query,
      status: parsed.status,
    },
    options.kind ?? "page",
  );

  return {
    items: result.items.map((page) => mapPageRecord(page, null)),
    total: result.total,
    page: parsed.page,
    pageSize: parsed.pageSize,
  };
}

export async function getManagedPageById(pageId: string) {
  const actor = await resolveActor();
  const page = await getProjectPageById(pageId);

  if (!page) throw new ActionError("NOT_FOUND", "Not found");
  assertCanManage(actor, page.authorId);

  return recordWithAuthor(page);
}

export async function getManagedHomepagePageId() {
  await resolveActor();
  return getProjectHomepageId();
}

export async function createPageQuick(
  data: PageCreateFormData,
  kind: PageKind = "page",
) {
  const actor = await resolveActor();

  const parsed = pageCreateSchema.safeParse({
    status: data.status,
    translations: {
      en: {
        title: data.translations.en.title,
        slug: sanitizeSlug(data.translations.en.slug, "en"),
      },
      ...(data.translations.fa
        ? {
            fa: {
              title: data.translations.fa.title,
              slug: sanitizeSlug(data.translations.fa.slug, "fa"),
            },
          }
        : {}),
      ...(data.translations.de
        ? {
            de: {
              title: data.translations.de.title,
              slug: sanitizeSlug(data.translations.de.slug, "de"),
            },
          }
        : {}),
    },
  });

  if (!parsed.success) {
    throw new ActionError(
      "VALIDATION",
      parsed.error.issues[0]?.message ?? "Invalid page",
    );
  }

  const { translations } = parsed.data;
  await assertProjectSlugsAvailable({
    slugEn: translations.en.slug,
    slugFa: translations.fa?.slug ?? null,
    slugDe: translations.de?.slug ?? null,
  });

  const emptyTranslation = {
    excerpt: "",
    builderData: null,
    seoTitle: "",
    seoDescription: "",
    navigationTitle: "",
    ogImage: "",
    canonicalUrl: "",
    enabled: true,
  };
  const publishedAt = parsed.data.status === "published" ? new Date() : null;

  const page = await createProjectPage({
    kind,
    slugEn: translations.en.slug,
    slugFa: translations.fa?.slug ?? null,
    slugDe: translations.de?.slug ?? null,
    status: parsed.data.status,
    isHomepage: false,
    noIndex: false,
    themeData: null,
    authorId: actor.userId,
    scheduledAt: null,
    publishedAt,
    translations: {
      en: { ...emptyTranslation, title: translations.en.title },
      fa: { ...emptyTranslation, title: translations.fa?.title ?? "" },
      de: { ...emptyTranslation, title: translations.de?.title ?? "" },
    },
  });

  revalidateProjectPages();
  return recordWithAuthor(page);
}

export async function updatePage(pageId: string, data: PageFormData) {
  const actor = await resolveActor();
  const current = await getProjectPageById(pageId);
  if (!current) throw new ActionError("NOT_FOUND", "Not found");
  assertCanManage(actor, current.authorId);

  const payload = normalizePageForm(data, actor.timezone);
  await assertSlugs(payload, pageId);

  const publishedAt =
    payload.status === "published" ? (current.publishedAt ?? new Date()) : null;

  const page = await updateProjectPage(
    pageId,
    buildWriteInput(payload, current.authorId, publishedAt, current.themeData, {
      en:
        current.translations.find((translation) => translation.locale === "en")
          ?.builderData ?? null,
      fa:
        current.translations.find((translation) => translation.locale === "fa")
          ?.builderData ?? null,
      de:
        current.translations.find((translation) => translation.locale === "de")
          ?.builderData ?? null,
    }),
  );

  revalidateProjectPages();
  return recordWithAuthor(page);
}

export async function updatePageBuilderData(
  pageId: string,
  builderData: Record<Locale, unknown>,
  themeData?: Record<string, unknown> | null,
) {
  const actor = await resolveActor();
  const current = await getProjectPageById(pageId);
  if (!current) throw new ActionError("NOT_FOUND", "Not found");
  assertCanManage(actor, current.authorId);

  const parsedBuilderData = pageBuilderDataUpdateSchema.safeParse(builderData);
  const parsedThemeData = pageThemeUpdateSchema.safeParse(themeData ?? null);

  if (!parsedBuilderData.success || !parsedThemeData.success) {
    throw new ActionError(
      "VALIDATION",
      parsedBuilderData.error?.issues[0]?.message ??
        parsedThemeData.error?.issues[0]?.message ??
        "Invalid page builder data",
    );
  }

  await updateProjectPageBuilderData(pageId, {
    en: serializePuckData(parsedBuilderData.data.en),
    fa: serializePuckData(parsedBuilderData.data.fa),
    de: serializePuckData(parsedBuilderData.data.de),
  });

  if (themeData !== undefined) {
    await updateProjectPageTheme(pageId, parsedThemeData.data);
  }

  const page = await getProjectPageById(pageId);
  if (!page) throw new ActionError("NOT_FOUND", "Not found");

  revalidateProjectPages();
  return recordWithAuthor(page);
}

export async function deletePage(pageId: string) {
  const actor = await resolveActor();
  const current = await getProjectPageById(pageId);
  if (!current) throw new ActionError("NOT_FOUND", "Not found");
  assertCanManage(actor, current.authorId);

  await deleteProjectPage(pageId);
  revalidateProjectPages();
}

async function assertSlugs(
  payload: ReturnType<typeof normalizePageForm>,
  excludePageId?: string,
) {
  try {
    await assertProjectSlugsAvailable(
      {
        slugEn: payload.slugEn,
        slugFa: payload.slugFa,
        slugDe: payload.slugDe,
      },
      excludePageId,
    );
  } catch {
    throw new ActionError("CONFLICT", "Slug already exists");
  }
}
