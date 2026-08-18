import "server-only";

import { prisma } from "@/lib/prisma";

import { ALL_TIME, type RangeValue } from "./ranges";

const DAY_MS = 24 * 60 * 60 * 1000;

export type RangeWindow = {
  since: Date;
  days: number;
};

export function startOfUtcDay(date: Date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export async function resolveRange(range: RangeValue): Promise<RangeWindow> {
  const today = startOfUtcDay();

  if (range !== ALL_TIME) {
    const since = new Date(today);
    since.setUTCDate(since.getUTCDate() - (range - 1));

    return { since, days: range };
  }

  const earliest = await prisma.visitorSession.aggregate({
    _min: { entryTime: true },
  });

  const first = earliest._min.entryTime;

  if (!first) return { since: today, days: 1 };

  const since = startOfUtcDay(first);
  const days = Math.floor((today.getTime() - since.getTime()) / DAY_MS) + 1;

  return { since, days: Math.max(1, days) };
}
