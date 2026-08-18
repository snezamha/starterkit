import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MediaSettingsView } from "@/features/media/components/media-settings-view";
import { requireAdmin } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/site-settings/store";
import { resolveLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = await getTranslations({ locale, namespace: "media.settings" });

  return { title: t("title") };
}

export default async function MediaSettingsRoute({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  setRequestLocale(locale);

  await requireAdmin(locale);
  const settings = await getSiteSettings();

  return <MediaSettingsView settings={settings.media} />;
}
