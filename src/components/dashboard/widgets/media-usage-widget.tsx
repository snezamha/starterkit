"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

import { SpinnerSection } from "@/components/loading/spinner-section";
import { getMediaUsageWidgetData } from "@/features/media/actions";

type WidgetData = Awaited<ReturnType<typeof getMediaUsageWidgetData>>;

function formatBytes(bytes: number, mb: string, gb: string) {
  if (bytes <= 0) return `0 ${mb}`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} ${mb}`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} ${gb}`;
}

function UsageTooltip({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number }>;
  formatValue: (bytes: number) => string;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0];

  if (!item) return null;

  return (
    <div className="bg-background rounded-lg border px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{item.name}</p>
      <p className="text-muted-foreground">{formatValue(item.value ?? 0)}</p>
    </div>
  );
}

export function MediaUsageWidget() {
  const t = useTranslations("dashboard.widgets.mediaUsage");
  const [data, setData] = useState<WidgetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    void getMediaUsageWidgetData()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setData(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const usedBytes = data?.usedBytes ?? 0;
  const maxBytes = data?.maxBytes ?? 0;
  const freeBytes = Math.max(maxBytes - usedBytes, 0);
  const usedPercent =
    maxBytes > 0 ? Math.min((usedBytes / maxBytes) * 100, 100) : 0;

  const megabytes = t("megabytes");
  const gigabytes = t("gigabytes");

  const chartData = useMemo(
    () => [
      { name: t("used"), value: usedBytes },
      { name: t("free"), value: freeBytes },
    ],
    [freeBytes, t, usedBytes],
  );

  if (isLoading) {
    return <SpinnerSection className="h-56 w-full" size={24} />;
  }

  const usedColor = "var(--primary)";
  const freeColor = "var(--muted-foreground)";

  return (
    <div className="flex h-full flex-col items-center gap-4 p-4">
      <div className="relative h-44 w-full">
        <PieChart width={200} height={176} className="mx-auto">
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="80%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={usedColor} />
            <Cell fill={freeColor} />
          </Pie>
          <Tooltip
            content={
              <UsageTooltip
                formatValue={(bytes) =>
                  formatBytes(bytes, megabytes, gigabytes)
                }
              />
            }
          />
        </PieChart>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{usedPercent.toFixed(1)}%</span>
          <span className="text-muted-foreground text-xs">{t("used")}</span>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: usedColor }}
            />
            {t("used")}
          </span>
          <span className="font-medium">
            {formatBytes(usedBytes, megabytes, gigabytes)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: freeColor }}
            />
            {t("free")}
          </span>
          <span className="font-medium">
            {formatBytes(freeBytes, megabytes, gigabytes)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t pt-1 font-medium">
          <span>{t("files")}</span>
          <span>{data?.fileCount ?? 0}</span>
        </div>
        <div className="flex items-center justify-between font-medium">
          <span>{t("total")}</span>
          <span>{formatBytes(maxBytes, megabytes, gigabytes)}</span>
        </div>
      </div>
    </div>
  );
}
