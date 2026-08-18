"use client";

import React from "react";

import { SpinnerSection } from "@/components/loading/spinner-section";
import { CORE_WIDGET_LOADERS } from "@/lib/dashboard/core-widgets";

function WidgetLoadError({ widgetKey }: { widgetKey: string }) {
  return (
    <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs">
      {widgetKey}
    </div>
  );
}

export function WidgetLoader({
  moduleId,
  widgetId,
  widgetProps,
}: {
  moduleId: string;
  widgetId: string;
  widgetProps?: Record<string, unknown>;
}) {
  const widgetKey = `${moduleId}:${widgetId}`;
  const loader = CORE_WIDGET_LOADERS[widgetKey];
  const [loaded, setLoaded] = React.useState<{
    key: string;
    Component: React.ComponentType<Record<string, unknown>>;
  } | null>(null);

  React.useEffect(() => {
    if (!loader) return;

    let active = true;

    void loader()
      .then((mod) => {
        if (active)
          setLoaded({
            key: widgetKey,
            Component: mod.default as React.ComponentType<
              Record<string, unknown>
            >,
          });
      })
      .catch(() => {
        const ErrorWidget = () => <WidgetLoadError widgetKey={widgetKey} />;
        if (active) setLoaded({ key: widgetKey, Component: ErrorWidget });
      });

    return () => {
      active = false;
    };
  }, [loader, widgetKey]);

  if (!loader) return <WidgetLoadError widgetKey={widgetKey} />;

  if (!loaded || loaded.key !== widgetKey) {
    return <SpinnerSection className="w-full p-8" size={24} />;
  }

  const Widget = loaded.Component;

  return <Widget {...(widgetProps ?? {})} />;
}
