import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getPages } from "@/features/page-builder/actions";
import { PageView } from "@/features/page-builder/components/page-view";
import { parsePageStatus } from "@/features/page-builder/types";
import { requireUser } from "@/lib/auth/session";
import { parsePage, parseQuery } from "@/lib/pagination";
import { resolveLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = await getTranslations({ locale, namespace: "pageBuilder" });

  return { title: t("title") };
}

export default async function PageBuilderListRoute({
  params,
  searchParams,
}: Props) {
  const [{ locale: localeParam }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const locale = resolveLocale(localeParam);
  setRequestLocale(locale);
  await requireUser(locale);

  const page = parsePage(resolvedSearchParams.page);
  const query = parseQuery(resolvedSearchParams.q);
  const status = parsePageStatus(parseQuery(resolvedSearchParams.status));
  const result = await getPages({ page, query, status });

  return (
    <PageView
      pages={result.items}
      total={result.total}
      page={result.page}
      pageSize={result.pageSize}
      query={query}
      status={status}
    />
  );
}
