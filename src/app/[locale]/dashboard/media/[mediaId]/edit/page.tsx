import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MediaEditView } from "@/features/media/components/media-edit-view";
import { getMediaFile } from "@/features/media/queries";
import { requireUser } from "@/lib/auth/session";
import { resolveLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string; mediaId: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = await getTranslations({ locale, namespace: "media" });

  return { title: t("editTitle") };
}

export default async function MediaEditRoute({ params }: Props) {
  const { locale: localeParam, mediaId } = await params;
  const locale = resolveLocale(localeParam);
  setRequestLocale(locale);

  const user = await requireUser(locale);
  const file = await getMediaFile(mediaId);

  if (!file) {
    notFound();
  }

  if (user.role !== "admin" && file.uploadedById !== user.id) {
    notFound();
  }

  return <MediaEditView file={file} />;
}
