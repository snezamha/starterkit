"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Maximize2, Monitor, Smartphone, Tablet } from "lucide-react";

import {
  PUCK_ACCENT,
  PUCK_BORDER,
  PUCK_MUTED,
  PUCK_SURFACE,
  SIDEBAR_HEADER_HEIGHT,
  usePuckSelector,
} from "./context";

export type ViewportWidth = number | "100%";

const VIEWPORT_PRESETS: {
  width: ViewportWidth;
  label: "mobile" | "tablet" | "desktop" | "fullWidthViewport";
  icon: React.ReactNode;
}[] = [
  { width: 360, label: "mobile", icon: <Smartphone size={14} /> },
  { width: 768, label: "tablet", icon: <Tablet size={14} /> },
  { width: 1280, label: "desktop", icon: <Monitor size={14} /> },
  { width: "100%", label: "fullWidthViewport", icon: <Maximize2 size={14} /> },
];

export function ViewportBar() {
  const t = useTranslations("pageBuilder.builder");
  const dispatch = usePuckSelector((s) => s.dispatch);
  const activeWidth = usePuckSelector(
    (s) => s.appState.ui.viewports?.current?.width,
  );

  const setViewport = useCallback(
    (width: ViewportWidth) => {
      dispatch({
        type: "setUi",
        ui: (prev) => ({
          viewports: {
            ...prev.viewports,
            current: { width, height: "auto" as const },
          },
        }),
      });
    },
    [dispatch],
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        height: SIDEBAR_HEADER_HEIGHT,
        boxSizing: "border-box",
        padding: "0 8px",
        borderBottom: PUCK_BORDER,
        background: PUCK_SURFACE,
        flexShrink: 0,
      }}
    >
      {VIEWPORT_PRESETS.map(({ width, label, icon }) => {
        const isActive = activeWidth === width;

        return (
          <button
            key={String(width)}
            type="button"
            title={t(label)}
            aria-label={t(label)}
            aria-pressed={isActive}
            onClick={() => setViewport(width)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 28,
              background: isActive
                ? "var(--puck-color-azure-11, #e8f1f8)"
                : "none",
              border: isActive
                ? "1px solid var(--puck-color-azure-07, #9dc3e8)"
                : "1px solid transparent",
              borderRadius: 4,
              cursor: "pointer",
              color: isActive ? PUCK_ACCENT : PUCK_MUTED,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
