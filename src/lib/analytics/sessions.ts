import "server-only";

import { prisma } from "@/lib/prisma";

export const UNKNOWN_COUNTRY = "unknown";
export const SESSION_TIMEOUT_SECONDS = 30 * 60;
const MAX_ACTIVITY_SECONDS = 12 * 60 * 60;

function clampActivityDelta(seconds: unknown): number | undefined {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds < 0) {
    return undefined;
  }

  const delta = Math.min(Math.round(seconds), MAX_ACTIVITY_SECONDS);

  return delta > 0 ? delta : undefined;
}

type StartSessionInput = {
  visitorId: string;
  page: string;
  country: string;
  referrer: string;
  userId: string | null;
};

export async function startSession({
  visitorId,
  page,
  country,
  referrer,
  userId,
}: StartSessionInput): Promise<string> {
  const windowStart = new Date(Date.now() - SESSION_TIMEOUT_SECONDS * 1000);

  const recent = await prisma.visitorSession.findFirst({
    where: { visitorId, page, lastSeenAt: { gte: windowStart } },
    orderBy: { lastSeenAt: "desc" },
    select: { id: true },
  });

  if (recent) {
    await prisma.visitorSession.update({
      where: { id: recent.id },
      data: { lastSeenAt: new Date(), exitTime: null },
    });

    return recent.id;
  }

  const created = await prisma.visitorSession.create({
    data: { visitorId, page, country, referrer, userId },
    select: { id: true },
  });

  return created.id;
}

export async function heartbeatSession(id: string, activityDelta: unknown) {
  const delta = clampActivityDelta(activityDelta);

  await prisma.visitorSession.updateMany({
    where: { id },
    data: {
      lastSeenAt: new Date(),
      ...(delta === undefined ? {} : { activitySeconds: { increment: delta } }),
    },
  });
}

export async function endSession(id: string, activityDelta: unknown) {
  const delta = clampActivityDelta(activityDelta);
  const now = new Date();

  await prisma.visitorSession.updateMany({
    where: { id },
    data: {
      exitTime: now,
      lastSeenAt: now,
      ...(delta === undefined ? {} : { activitySeconds: { increment: delta } }),
    },
  });
}
