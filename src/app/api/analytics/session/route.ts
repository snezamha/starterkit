import { NextResponse, type NextRequest } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { resolveCountry } from "@/lib/analytics/country";
import { getTrackedPage } from "@/lib/analytics/page";
import { normalizeReferrer } from "@/lib/analytics/referrer";
import {
  endSession,
  heartbeatSession,
  startSession,
} from "@/lib/analytics/sessions";

const MAX_ID_LENGTH = 64;

function isValidId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= MAX_ID_LENGTH
  );
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return new NextResponse(null, { status: 403 });
  }

  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const { type, sessionId, visitorId, pathname, referrer, activityDelta } =
    body;

  try {
    if (type === "heartbeat" || type === "end") {
      if (!isValidId(sessionId)) {
        return new NextResponse(null, { status: 400 });
      }

      if (type === "heartbeat") {
        await heartbeatSession(sessionId, activityDelta);
      } else {
        await endSession(sessionId, activityDelta);
      }

      return new NextResponse(null, { status: 204 });
    }

    if (type !== "start") {
      return new NextResponse(null, { status: 400 });
    }

    if (!isValidId(visitorId) || typeof pathname !== "string") {
      return new NextResponse(null, { status: 400 });
    }

    const page = getTrackedPage(pathname);

    if (!page) {
      return new NextResponse(null, { status: 204 });
    }

    const user = await getSessionUser().catch(() => null);

    const id = await startSession({
      visitorId,
      page,
      country: resolveCountry(request.headers),
      referrer: normalizeReferrer(referrer, request.nextUrl.hostname),
      userId: user?.id ?? null,
    });

    return NextResponse.json({ sessionId: id });
  } catch (err) {
    console.error(err);
    return new NextResponse(null, { status: 500 });
  }
}
