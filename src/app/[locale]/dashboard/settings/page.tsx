import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/dashboard/layout/dashboard-page";
import { SiteSettingsForm } from "@/components/dashboard/settings/site-settings-form";
import { requireAdmin } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/site-settings/store";
import { resolveLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = await getTranslations({ locale, namespace: "dashboard" });

  return { title: t("settings.title") };
}

export default async function SettingsPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  setRequestLocale(locale);
  await requireAdmin(locale);

  const t = await getTranslations({ locale, namespace: "dashboard" });
  const settings = await getSiteSettings();

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <section>
        <SiteSettingsForm settings={settings} />
      </section>
    </DashboardPage>
  );
}
