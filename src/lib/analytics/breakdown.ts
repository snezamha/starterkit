import "server-only";

import { prisma } from "@/lib/prisma";

import { resolveRange } from "./range-window";
import type { RangeValue } from "./ranges";
import { UNKNOWN_COUNTRY } from "./sessions";

export const BREAKDOWN_DIMENSIONS = ["country", "referrer"] as const;
export const BREAKDOWN_PAGE_SIZE = 10;

export type BreakdownDimension = (typeof BREAKDOWN_DIMENSIONS)[number];

export type BreakdownResult = {
  rows: Array<[key: string, visitors: number]>;
  total: number;
  page: number;
  pageSize: number;
};

type GroupRow = { key: string; visitors: bigint };
type CountRow = { total: bigint };

export async function getBreakdown(
  dimension: BreakdownDimension,
  range: RangeValue,
  page: number,
  pageSize: number = BREAKDOWN_PAGE_SIZE,
): Promise<BreakdownResult> {
  const { since } = await resolveRange(range);
  const offset = (page - 1) * pageSize;

  const [rows, counts] =
    dimension === "country"
      ? await Promise.all([
          prisma.$queryRaw<GroupRow[]>`
            SELECT country AS key, count(DISTINCT "visitorId") AS visitors
            FROM visitor_session
            WHERE "entryTime" >= ${since} AND country <> ${UNKNOWN_COUNTRY}
            GROUP BY country
            ORDER BY visitors DESC, country ASC
            LIMIT ${pageSize} OFFSET ${offset}`,
          prisma.$queryRaw<CountRow[]>`
            SELECT count(DISTINCT country) AS total
            FROM visitor_session
            WHERE "entryTime" >= ${since} AND country <> ${UNKNOWN_COUNTRY}`,
        ])
      : await Promise.all([
          prisma.$queryRaw<GroupRow[]>`
            SELECT referrer AS key, count(DISTINCT "visitorId") AS visitors
            FROM visitor_session
            WHERE "entryTime" >= ${since} AND referrer <> 'internal'
            GROUP BY referrer
            ORDER BY visitors DESC, referrer ASC
            LIMIT ${pageSize} OFFSET ${offset}`,
          prisma.$queryRaw<CountRow[]>`
            SELECT count(DISTINCT referrer) AS total
            FROM visitor_session
            WHERE "entryTime" >= ${since} AND referrer <> 'internal'`,
        ]);

  return {
    rows: rows.map((row) => [row.key, Number(row.visitors)]),
    total: Number(counts[0]?.total ?? 0),
    page,
    pageSize,
  };
}
