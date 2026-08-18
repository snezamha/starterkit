"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useConsent } from "@/components/providers/consent-context";

const HEARTBEAT_MS = 15_000;
const VISITOR_STORAGE_KEY = "analytics:visitor-id";

function getVisitorId(): string {
  try {
    const stored = window.localStorage.getItem(VISITOR_STORAGE_KEY);
    if (stored) return stored;

    const created = crypto.randomUUID();
    window.localStorage.setItem(VISITOR_STORAGE_KEY, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

function forgetVisitorId() {
  try {
    window.localStorage.removeItem(VISITOR_STORAGE_KEY);
    window.sessionStorage.removeItem(VISITOR_STORAGE_KEY);
  } catch {}
}

function post(body: Record<string, unknown>, keepalive = false) {
  return fetch("/api/analytics/session", {
    method: "POST",
    keepalive,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function SessionTracker() {
  const pathname = usePathname();
  const { hydrated, isAllowed } = useConsent();
  const allowed = isAllowed("statistics");

  useEffect(() => {
    if (!hydrated) return;

    if (!allowed) {
      forgetVisitorId();

      return;
    }

    let activityMs = 0;
    let reportedSeconds = 0;
    let lastActiveAt =
      document.visibilityState === "visible" ? Date.now() : null;
    let ended = false;

    function flush() {
      if (lastActiveAt === null) return;
      activityMs += Date.now() - lastActiveAt;
      lastActiveAt = Date.now();
    }

    function activitySeconds() {
      return Math.round(activityMs / 1000);
    }

    const started = post({
      type: "start",
      visitorId: getVisitorId(),
      pathname,
      referrer: document.referrer,
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as { sessionId?: string };
        return data.sessionId ?? null;
      })
      .catch(() => null);

    function send(type: "heartbeat" | "end", keepalive = false) {
      return started.then((sessionId) => {
        if (!sessionId) return;
        if (type === "end" && ended) return;
        if (type === "end") ended = true;

        const total = activitySeconds();
        const delta = Math.max(0, total - reportedSeconds);

        if (type === "heartbeat" && delta === 0) return;

        reportedSeconds = total;

        return post({ type, sessionId, activityDelta: delta }, keepalive).catch(
          () => {},
        );
      });
    }

    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      flush();
      void send("heartbeat");
    }, HEARTBEAT_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        flush();
        lastActiveAt = null;
        void send("heartbeat");
      } else {
        lastActiveAt = Date.now();
      }
    }

    function handlePageHide() {
      flush();
      void send("end", true);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);
      flush();
      void send("end", true);
    };
  }, [pathname, allowed, hydrated]);

  return null;
}
