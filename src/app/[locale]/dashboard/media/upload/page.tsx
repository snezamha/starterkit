import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MediaUploadView } from "@/features/media/components/media-upload-view";
import { requireUser } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/site-settings/store";
import { resolveLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = await getTranslations({ locale, namespace: "media" });

  return { title: t("uploadTitle") };
}

export default async function MediaUploadRoute({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  setRequestLocale(locale);

  await requireUser(locale);
  const settings = await getSiteSettings();

  return <MediaUploadView maxFileSizeMb={settings.media.maxFileSizeMb} />;
}
