import "server-only";

import { prisma } from "@/lib/prisma";

import { resolveRange, startOfUtcDay } from "./range-window";
import { RANGE_OPTIONS, type RangeValue } from "./ranges";
import { UNKNOWN_COUNTRY } from "./sessions";

export const TRACKING_DAYS: RangeValue = RANGE_OPTIONS[0];

export type PageviewDay = {
  iso: string;
  visitors: number;
  pageviews: number;
};

export type PageviewStats = {
  totalPageviews: number;
  totalVisitors: number;
  avgVisitorsPerDay: number;
  visitorsToday: number;
  avgActivitySeconds: number;
  timeseries: PageviewDay[];
  topCountries: Array<[country: string, visitors: number]>;
  topReferrers: Array<[referrer: string, visitors: number]>;
  countryTotal: number;
  referrerTotal: number;
};

const EMPTY_STATS: PageviewStats = {
  totalPageviews: 0,
  totalVisitors: 0,
  avgVisitorsPerDay: 0,
  visitorsToday: 0,
  avgActivitySeconds: 0,
  timeseries: [],
  topCountries: [],
  topReferrers: [],
  countryTotal: 0,
  referrerTotal: 0,
};

type DailyRow = { day: Date; visitors: bigint; pageviews: bigint };
type GroupRow = { key: string; visitors: bigint };
type TotalsRow = { countries: bigint; referrers: bigint };

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildDayRange(since: Date, days: number): Date[] {
  return Array.from({ length: days }, (_, index) => {
    const day = new Date(since);
    day.setUTCDate(day.getUTCDate() + index);
    return day;
  });
}

function toEntries(rows: GroupRow[]): Array<[string, number]> {
  return rows.map((row) => [row.key, Number(row.visitors)]);
}

export async function getPageviewStats(
  range: RangeValue = TRACKING_DAYS,
): Promise<PageviewStats> {
  try {
    const { since, days } = await resolveRange(range);
    const dayRange = buildDayRange(since, days);
    const [daily, countries, referrers, activity, uniqueVisitors, totals] =
      await Promise.all([
        prisma.$queryRaw<DailyRow[]>`
          SELECT date_trunc('day', "entryTime" AT TIME ZONE 'UTC') AS day,
                 count(DISTINCT "visitorId") AS visitors,
                 count(*) AS pageviews
          FROM visitor_session
          WHERE "entryTime" >= ${since}
          GROUP BY day`,
        prisma.$queryRaw<GroupRow[]>`
          SELECT country AS key, count(DISTINCT "visitorId") AS visitors
          FROM visitor_session
          WHERE "entryTime" >= ${since} AND country <> ${UNKNOWN_COUNTRY}
          GROUP BY country
          ORDER BY visitors DESC
          LIMIT 5`,
        prisma.$queryRaw<GroupRow[]>`
          SELECT referrer AS key, count(DISTINCT "visitorId") AS visitors
          FROM visitor_session
          WHERE "entryTime" >= ${since} AND referrer <> 'internal'
          GROUP BY referrer
          ORDER BY visitors DESC
          LIMIT 5`,
        prisma.visitorSession.aggregate({
          where: { entryTime: { gte: since } },
          _avg: { activitySeconds: true },
        }),
        prisma.visitorSession.findMany({
          where: { entryTime: { gte: since } },
          distinct: ["visitorId"],
          select: { visitorId: true },
        }),
        prisma.$queryRaw<TotalsRow[]>`
          SELECT count(DISTINCT country) FILTER (WHERE country <> ${UNKNOWN_COUNTRY}) AS countries,
                 count(DISTINCT referrer) FILTER (WHERE referrer <> 'internal') AS referrers
          FROM visitor_session
          WHERE "entryTime" >= ${since}`,
      ]);

    const byDay = new Map(
      daily.map((row) => [
        toIsoDate(row.day),
        { visitors: Number(row.visitors), pageviews: Number(row.pageviews) },
      ]),
    );

    const timeseries = dayRange.map((day) => {
      const iso = toIsoDate(day);
      const row = byDay.get(iso);

      return {
        iso,
        visitors: row?.visitors ?? 0,
        pageviews: row?.pageviews ?? 0,
      };
    });

    const totalPageviews = timeseries.reduce(
      (total, day) => total + day.pageviews,
      0,
    );
    const totalVisitors = uniqueVisitors.length;

    return {
      totalPageviews,
      totalVisitors,
      avgVisitorsPerDay: totalVisitors / days,
      visitorsToday: byDay.get(toIsoDate(startOfUtcDay()))?.visitors ?? 0,
      avgActivitySeconds: Math.round(activity._avg.activitySeconds ?? 0),
      timeseries,
      topCountries: toEntries(countries),
      topReferrers: toEntries(referrers),
      countryTotal: Number(totals[0]?.countries ?? 0),
      referrerTotal: Number(totals[0]?.referrers ?? 0),
    };
  } catch (error) {
    console.error("Failed to load pageview analytics", error);
    return EMPTY_STATS;
  }
}
