import type { ComponentType } from "react";

export const CORE_WIDGET_LOADERS: Record<
  string,
  () => Promise<{ default: ComponentType<Record<string, unknown>> }>
> = {
  "core:sample": async () => {
    const mod = await import("@/components/dashboard/widgets/sample-widget");
    return { default: mod.SampleWidget };
  },
  "core:media-usage": async () => {
    const mod =
      await import("@/components/dashboard/widgets/media-usage-widget");
    return {
      default: mod.MediaUsageWidget as ComponentType<Record<string, unknown>>,
    };
  },
  "core:analytics": async () => {
    const mod = await import("@/components/dashboard/widgets/analytics-widget");
    return {
      default: mod.AnalyticsWidget as ComponentType<Record<string, unknown>>,
    };
  },
};

export const CORE_WIDGET_TITLE_KEYS: Record<
  string,
  [namespace: string, key: string]
> = {
  "core:sample": ["dashboard", "widgets.sample.name"],
  "core:analytics": ["dashboard", "widgets.analytics.name"],
  "core:media-usage": ["dashboard", "widgets.mediaUsage.name"],
};

const ADMIN_ONLY_WIDGET_IDS = new Set(["core:analytics"]);

const FIXED_SIZE_WIDGET_IDS = new Set(["core:analytics"]);

export function isFixedSizeWidget(id: string): boolean {
  return FIXED_SIZE_WIDGET_IDS.has(id);
}

const CORE_WIDGET_DEFAULT_LAYOUT: Array<{ id: string; full: boolean }> = [
  { id: "core:analytics", full: true },
  { id: "core:media-usage", full: false },
  { id: "core:sample", full: false },
];

export function getCoreWidgetIds(isAdmin: boolean): string[] {
  return CORE_WIDGET_DEFAULT_LAYOUT.map(({ id }) => id).filter(
    (id) => isAdmin || !ADMIN_ONLY_WIDGET_IDS.has(id),
  );
}

export function getCoreWidgetDefaultLayout(isAdmin: boolean): Array<{
  id: string;
  full: boolean;
  minimized: boolean;
}> {
  return CORE_WIDGET_DEFAULT_LAYOUT.filter(
    ({ id }) => isAdmin || !ADMIN_ONLY_WIDGET_IDS.has(id),
  ).map(({ id, full }) => ({ id, full, minimized: false }));
}
