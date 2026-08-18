"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LoadingSpinner } from "@/components/loading/loading-spinner";
import { useLoadingSettings } from "@/components/providers/loading-context";
import type { LoadingPosition } from "@/lib/site-settings/loading";
import { cn } from "@/lib/utils";

const positionClasses: Record<LoadingPosition, string> = {
  "top-start": "top-4 start-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-end": "top-4 end-4",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "bottom-start": "bottom-4 start-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-end": "bottom-4 end-4",
};

const NAVIGATION_TIMEOUT_MS = 4000;

export function RouteLoadingIndicator() {
  const { enabled, spinner, position, colorMode, color, size } =
    useLoadingSettings();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const navigationKey = `${pathname}?${searchParams.toString()}`;
  const [loading, setLoading] = useState(false);
  const [settledKey, setSettledKey] = useState(navigationKey);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (navigationKey !== settledKey) {
    setSettledKey(navigationKey);
    setLoading(false);
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) {
        return;
      }
      if (anchor.target && anchor.target !== "_self") {
        return;
      }
      if (anchor.hasAttribute("download")) {
        return;
      }

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) {
        return;
      }
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      setLoading(true);
      timeoutRef.current = setTimeout(
        () => setLoading(false),
        NAVIGATION_TIMEOUT_MS,
      );
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [enabled]);

  if (!enabled || !loading) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-50",
        positionClasses[position],
      )}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner
        spinner={spinner}
        colorMode={colorMode}
        color={color}
        size={size}
      />
    </div>
  );
}
