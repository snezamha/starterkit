"use client";

import { useCallback, useContext, useEffect, useState } from "react";
import { Puck } from "@puckeditor/core";
import { useTranslations } from "next-intl";
import {
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { PuckToolbarPortal } from "./puck-toolbar-portal";
import { useMobileViewport } from "./use-mobile-viewport";
import {
  COMPACT_LAYOUT_QUERY,
  PANEL_HEIGHT,
  PUCK_BORDER,
  PUCK_MUTED,
  PUCK_SURFACE,
  PuckEditorContext,
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_HEADER_HEIGHT,
  SIDEBAR_WIDTH,
  usePuckSelector,
} from "./puck-layout/context";
import { LocaleDataSync } from "./puck-layout/locale-data-sync";
import { MyBlocksPanel } from "./puck-layout/my-blocks-panel";
import { PreviewWithViewport } from "./puck-layout/preview-with-viewport";
import { TabButton } from "./puck-layout/tab-button";
import { ViewportBar } from "./puck-layout/viewport-bar";

export { PuckEditorContext } from "./puck-layout/context";
export { SaveBlockAction } from "./puck-layout/save-block-action";

type Tab = "components" | "fields" | "outline" | "myBlocks";

const TABS: Tab[] = ["components", "fields", "outline", "myBlocks"];

export function PuckCustomLayout() {
  const t = useTranslations("pageBuilder.builder");
  const ctx = useContext(PuckEditorContext);
  const isMobile = useMobileViewport();
  const isCompact = useMobileViewport(COMPACT_LAYOUT_QUERY);
  const contentLength = usePuckSelector(
    (state) => state.appState.data.content.length,
  );

  const [activeTab, setActiveTab] = useState<Tab>("components");
  const [expanded, setExpanded] = useState(true);

  const selected = usePuckSelector((s) => s.appState.ui.itemSelector);

  useEffect(() => {
    if (!selected) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveTab("fields");
    setExpanded(true);
  }, [selected]);

  const handleTabClick = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setExpanded(true);
  }, []);

  const panelBody = (
    <>
      {activeTab === "components" && <Puck.Components />}
      {activeTab === "fields" && <Puck.Fields />}
      {activeTab === "outline" && <Puck.Outline />}
      {activeTab === "myBlocks" && <MyBlocksPanel />}
    </>
  );

  const tabStrip = (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        background: PUCK_SURFACE,
        flex: 1,
        minWidth: 0,
        overflowX: "hidden",
      }}
    >
      {TABS.map((id) => (
        <TabButton
          key={id}
          label={t(`mobileTabs.${id}`)}
          active={activeTab === id && expanded}
          compact={isCompact}
          onClick={() => handleTabClick(id)}
        />
      ))}
    </div>
  );

  const collapseButton = (
    <button
      type="button"
      onClick={() => setExpanded((v) => !v)}
      title={t(expanded ? "collapsePanel" : "expandPanel")}
      aria-label={t(expanded ? "collapsePanel" : "expandPanel")}
      style={{
        padding: "0 10px",
        background: "none",
        border: "none",
        cursor: "pointer",
        color: PUCK_MUTED,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderInlineStart: expanded ? PUCK_BORDER : "none",
        alignSelf: "stretch",
        flexShrink: 0,
        width: expanded ? undefined : "100%",
      }}
    >
      {isCompact ? (
        expanded ? (
          <ChevronDown size={14} />
        ) : (
          <ChevronUp size={14} />
        )
      ) : expanded ? (
        <PanelLeftClose size={14} />
      ) : (
        <PanelLeftOpen size={14} />
      )}
    </button>
  );

  const shared = (
    <>
      {ctx?.hasToolbarSlots && (
        <PuckToolbarPortal rightSlot={ctx.toolbarRightSlot} />
      )}
      {ctx && <LocaleDataSync locale={ctx.locale} data={ctx.localeData} />}
    </>
  );

  const preview = (
    <PreviewWithViewport
      isEmpty={contentLength === 0}
      onStart={() => {
        setActiveTab("components");
        setExpanded(true);
      }}
    />
  );

  if (isCompact) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {shared}
        {preview}
        <div
          style={{
            flexShrink: 0,
            background: "var(--puck-color-white, #fff)",
            borderTop: PUCK_BORDER,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {expanded && (
            <div
              style={{
                height: isMobile ? "min(42dvh, 320px)" : PANEL_HEIGHT,
                overflow: "auto",
                padding: "8px 12px",
              }}
            >
              {panelBody}
            </div>
          )}
          <ViewportBar />
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              background: PUCK_SURFACE,
              borderTop: expanded ? PUCK_BORDER : "none",
              minWidth: 0,
            }}
          >
            {tabStrip}
            {collapseButton}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {shared}
      <aside
        style={{
          width: expanded ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--puck-color-white, #fff)",
          borderInlineEnd: PUCK_BORDER,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            height: SIDEBAR_HEADER_HEIGHT,
            borderBottom: PUCK_BORDER,
            minWidth: 0,
          }}
        >
          {expanded ? tabStrip : null}
          {collapseButton}
        </div>
        {expanded && (
          <div style={{ flex: 1, overflow: "auto", padding: "8px 12px" }}>
            {panelBody}
          </div>
        )}
      </aside>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <ViewportBar />
        {preview}
      </div>
    </div>
  );
}
