"use client";

import { useTranslations } from "next-intl";

import {
  DashboardPage,
  DashboardPageHeader,
} from "@/components/dashboard/layout/dashboard-page";
import { SortableDashboard } from "@/components/dashboard/widgets/sortable-dashboard";
import {
  useWidgetVisibility,
  WidgetVisibilityPanel,
} from "@/components/dashboard/widgets/widget-visibility-panel";
import type { DashboardLayout } from "@/lib/dashboard/layout";
import { clearStoredLayout } from "@/lib/dashboard/layout-storage";

export function DashboardView({
  allWidgetIds,
  widgetTitles,
  defaultLayout,
  userId,
  widgetProps,
}: {
  allWidgetIds: string[];
  widgetTitles: Record<string, string>;
  defaultLayout: DashboardLayout;
  userId: string;
  widgetProps?: Record<string, Record<string, unknown>>;
}) {
  const t = useTranslations("dashboard.widgets");
  const storageKey = `dashboard:layout:${userId}`;
  const { hidden, toggle, visibleWidgetIds } = useWidgetVisibility(
    allWidgetIds,
    storageKey,
  );

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={t("title")}
        actions={
          allWidgetIds.length > 0 ? (
            <WidgetVisibilityPanel
              allWidgetIds={allWidgetIds}
              widgetTitles={widgetTitles}
              hidden={hidden}
              onToggle={toggle}
              onReset={() => clearStoredLayout(storageKey)}
              customizeLabel={t("customize")}
              resetLabel={t("resetLayout")}
            />
          ) : null
        }
      />
      <SortableDashboard
        activeWidgetIds={visibleWidgetIds}
        storageKey={storageKey}
        widgetTitles={widgetTitles}
        widgetProps={widgetProps}
        defaultLayout={defaultLayout}
        emptyLabel={t("empty")}
        labels={{
          expand: t("expand"),
          collapse: t("collapse"),
          moveUp: t("moveUp"),
          moveDown: t("moveDown"),
          reorder: t("reorder"),
          minimize: t("minimize"),
          restore: t("restore"),
        }}
      />
    </DashboardPage>
  );
}
