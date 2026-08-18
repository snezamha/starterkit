"use server";

import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

import {
  BREAKDOWN_DIMENSIONS,
  BREAKDOWN_PAGE_SIZE,
  getBreakdown,
  type BreakdownDimension,
  type BreakdownResult,
} from "./breakdown";
import { getPageviewStats, type PageviewStats } from "./pageviews";
import { normalizeRange, type RangeValue } from "./ranges";

async function requireAdminUser() {
  const user = await getSessionUser();

  if (user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function loadAnalyticsStats(
  range: RangeValue,
): Promise<PageviewStats> {
  await requireAdminUser();

  return getPageviewStats(normalizeRange(range));
}

export async function loadAnalyticsBreakdown(
  dimension: BreakdownDimension,
  range: RangeValue,
  page: number,
): Promise<BreakdownResult> {
  await requireAdminUser();

  if (!BREAKDOWN_DIMENSIONS.includes(dimension)) {
    throw new Error("Invalid dimension");
  }

  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;

  return getBreakdown(
    dimension,
    normalizeRange(range),
    safePage,
    BREAKDOWN_PAGE_SIZE,
  );
}

export async function clearAnalyticsData(): Promise<number> {
  await requireAdminUser();

  const { count } = await prisma.visitorSession.deleteMany({});

  return count;
}
