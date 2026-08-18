import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import {
  getManagedHomepagePageId,
  getManagedPageById,
} from "@/features/page-builder/actions";
import { PageBuilderView } from "@/features/page-builder/components/page-builder-view";
import { requireUser } from "@/lib/auth/session";
import { isActionError } from "@/lib/errors/action-error";
import { resolveLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string; pageId: string }>;
};

export const dynamic = "force-dynamic";

export default async function PageBuilderEditorRoute({ params }: Props) {
  const { locale: localeParam, pageId } = await params;
  const locale = resolveLocale(localeParam);
  setRequestLocale(locale);
  await requireUser(locale);

  let content;
  try {
    content = await getManagedPageById(pageId);
  } catch (error) {
    if (
      isActionError(error) &&
      (error.code === "NOT_FOUND" || error.code === "FORBIDDEN")
    ) {
      notFound();
    }
    throw error;
  }

  const homepagePageId = await getManagedHomepagePageId();

  return <PageBuilderView content={content} homepagePageId={homepagePageId} />;
}
