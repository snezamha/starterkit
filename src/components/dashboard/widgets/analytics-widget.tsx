"use client";

import { CalendarDays, Globe } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, useState, useTransition } from "react";

import { SpinnerSection } from "@/components/loading/spinner-section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { loadAnalyticsStats } from "@/lib/analytics/actions";
import type { PageviewStats } from "@/lib/analytics/pageviews";
import {
  ALL_TIME,
  RANGE_OPTIONS,
  type RangeValue,
} from "@/lib/analytics/ranges";

import { ClearDataDialog } from "./analytics/clear-data-dialog";
import { countryFlag } from "./analytics/country-flag";
import { RankedList } from "./analytics/ranked-list";
import { StatCard } from "./analytics/stat-card";
import { TrendBadge } from "./analytics/trend-badge";
import { VisitorsChart } from "./analytics/visitors-chart";

type AnalyticsWidgetProps = PageviewStats & {
  trackingDays: RangeValue;
};

export function AnalyticsWidget(initialStats: AnalyticsWidgetProps) {
  const t = useTranslations("dashboard.widgets.analytics");
  const locale = useLocale();
  const format = useFormatter();

  const [stats, setStats] = useState<PageviewStats>(initialStats);
  const [range, setRange] = useState<RangeValue>(initialStats.trackingDays);
  const [isPending, startTransition] = useTransition();

  const {
    totalPageviews,
    totalVisitors,
    avgVisitorsPerDay,
    visitorsToday,
    avgActivitySeconds,
    timeseries,
    topCountries,
    topReferrers,
    countryTotal,
    referrerTotal,
  } = stats;

  const rangeLabel = useCallback(
    (value: RangeValue) =>
      value === ALL_TIME ? t("allTime") : t("lastDays", { days: value }),
    [t],
  );

  const reload = useCallback((nextRange: RangeValue) => {
    startTransition(async () => {
      try {
        setStats(await loadAnalyticsStats(nextRange));
      } catch {
        /* keep the last successful snapshot */
      }
    });
  }, []);

  const regionNames = useMemo(
    () => new Intl.DisplayNames([locale], { type: "region" }),
    [locale],
  );

  const chartData = useMemo(
    () =>
      timeseries.map((day) => ({
        label: format.dateTime(new Date(day.iso), {
          day: "numeric",
          month: "short",
        }),
        visitors: day.visitors,
        pageviews: day.pageviews,
      })),
    [timeseries, format],
  );

  const trend =
    avgVisitorsPerDay > 0 ? (visitorsToday / avgVisitorsPerDay - 1) * 100 : 0;

  return (
    <div className="relative flex flex-col gap-4">
      {isPending ? (
        <div className="bg-card/60 absolute inset-0 z-10 grid place-items-center rounded-lg backdrop-blur-[1px]">
          <SpinnerSection size={28} />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select
          value={String(range)}
          onValueChange={(value) => {
            const next: RangeValue =
              value === ALL_TIME ? ALL_TIME : (Number(value) as RangeValue);
            setRange(next);
            reload(next);
          }}
        >
          <SelectTrigger size="sm" className="w-auto min-w-44">
            <CalendarDays
              className="text-muted-foreground size-4 shrink-0"
              aria-hidden
            />
            <SelectValue>{() => rangeLabel(range)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {rangeLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ClearDataDialog onCleared={() => reload(range)} />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={t("visitorsTotal", { range: rangeLabel(range) })}
          value={format.number(totalVisitors)}
        />
        <StatCard
          label={t("pageviewsTotal")}
          value={format.number(totalPageviews)}
        />
        <StatCard
          label={t("visitorsToday")}
          value={format.number(visitorsToday)}
          action={<TrendBadge percentage={trend} />}
        />
        <StatCard
          label={t("avgTimeOnPage")}
          value={t("seconds", { count: avgActivitySeconds })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-muted-foreground text-xs">{t("visitorsChart")}</p>
        {chartData.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            {t("empty")}
          </p>
        ) : (
          <VisitorsChart
            data={chartData}
            visitorsLabel={t("visitorsSeries")}
            pageviewsLabel={t("pageviewsSeries")}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <RankedList
          title={t("topCountries")}
          rows={topCountries}
          total={countryTotal}
          dimension="country"
          range={range}
          rangeLabel={rangeLabel(range)}
          emptyLabel={t("noCountries")}
          renderLabel={(code) => regionNames.of(code.toUpperCase()) ?? code}
          renderIcon={(code) => (
            <span className="text-base" aria-hidden>
              {countryFlag(code)}
            </span>
          )}
        />
        <RankedList
          title={t("topReferrers")}
          rows={topReferrers}
          total={referrerTotal}
          dimension="referrer"
          range={range}
          rangeLabel={rangeLabel(range)}
          emptyLabel={t("noReferrers")}
          renderLabel={(key) => (key === "direct" ? t("direct") : key)}
          renderIcon={() => (
            <Globe className="text-muted-foreground size-4" aria-hidden />
          )}
        />
      </div>
    </div>
  );
}

export default AnalyticsWidget;
