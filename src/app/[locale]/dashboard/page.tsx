import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { DashboardView } from "@/components/dashboard/widgets/dashboard-view";
import { getPageviewStats, TRACKING_DAYS } from "@/lib/analytics/pageviews";
import { requireUser } from "@/lib/auth/session";
import {
  CORE_WIDGET_TITLE_KEYS,
  getCoreWidgetDefaultLayout,
  getCoreWidgetIds,
} from "@/lib/dashboard/core-widgets";
import { resolveLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = await getTranslations({ locale, namespace: "dashboard" });

  return { title: t("title") };
}

export default async function DashboardPageRoute({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  setRequestLocale(locale);

  const t = await getTranslations({ locale });
  const user = await requireUser(locale);
  const isAdmin = user.role === "admin";

  const allWidgetIds = getCoreWidgetIds(isAdmin);
  const defaultLayout = { items: getCoreWidgetDefaultLayout(isAdmin) };
  const widgetTitles = Object.fromEntries(
    allWidgetIds.map((id) => {
      const [namespace, key] = CORE_WIDGET_TITLE_KEYS[id] ?? ["dashboard", id];
      return [id, t(`${namespace}.${key}` as never)];
    }),
  );

  const widgetProps = isAdmin
    ? {
        "core:analytics": {
          ...(await getPageviewStats(TRACKING_DAYS)),
          trackingDays: TRACKING_DAYS,
        },
      }
    : undefined;

  return (
    <DashboardView
      allWidgetIds={allWidgetIds}
      widgetTitles={widgetTitles}
      defaultLayout={defaultLayout}
      userId={user.id}
      widgetProps={widgetProps}
    />
  );
}
