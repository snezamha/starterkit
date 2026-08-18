"use client";

import { useEffect, useRef } from "react";
import { Puck } from "@puckeditor/core";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";

import { PUCK_ACCENT, PUCK_MUTED, usePuckSelector } from "./context";
import type { ViewportWidth } from "./viewport-bar";

function pickPreset(containerWidth: number): ViewportWidth {
  if (containerWidth < 500) return 360;
  if (containerWidth < 900) return 768;
  if (containerWidth < 1400) return 1280;
  return "100%";
}

type Props = {
  isEmpty: boolean;
  onStart: () => void;
};

export function PreviewWithViewport({ isEmpty, onStart }: Props) {
  const t = useTranslations("pageBuilder.builder");
  const dispatch = usePuckSelector((s) => s.dispatch);
  const viewportWidth = usePuckSelector(
    (s) => s.appState.ui.viewports?.current?.width ?? "100%",
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const isFullWidth = viewportWidth === "100%";

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const preset = pickPreset(el.getBoundingClientRect().width);
    dispatch({
      type: "setUi",
      ui: (prev) => ({
        viewports: {
          ...prev.viewports,
          current: { width: preset, height: "auto" as const },
        },
      }),
    });
  }, [dispatch]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        minHeight: 0,
        overflow: isFullWidth ? "hidden" : "auto",
        display: "flex",
        justifyContent: "center",
        background: isFullWidth
          ? undefined
          : "var(--puck-color-grey-11, #e8eaed)",
      }}
    >
      <div
        style={{
          width: viewportWidth,
          height: "100%",
          flexShrink: 0,
          position: "relative",
        }}
      >
        <Puck.Preview />
        {isEmpty ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                width: "min(100%, 360px)",
                padding: 24,
                border: "1px dashed var(--puck-color-grey-08, #cbd5e1)",
                borderRadius: 12,
                background: "var(--puck-color-white, #fff)",
                textAlign: "center",
                boxShadow: "0 8px 30px rgba(15, 23, 42, 0.08)",
                pointerEvents: "auto",
              }}
            >
              <div style={{ fontSize: 15, fontWeight: 600 }}>
                {t("emptyTitle")}
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  lineHeight: 1.6,
                  color: PUCK_MUTED,
                }}
              >
                {t("emptyDescription")}
              </div>
              <button
                type="button"
                onClick={onStart}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 16,
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: 7,
                  background: PUCK_ACCENT,
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <Plus size={14} />
                {t("addFirstBlock")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
