"use client";

import { createContext } from "react";
import { createUsePuck } from "@puckeditor/core";

import type { PuckConfig, PuckData } from "@/features/page-builder/puck/config";
import type { Locale } from "@/i18n/config";

type PuckEditorContextValue = {
  toolbarRightSlot: HTMLElement | null;
  hasToolbarSlots: boolean;
  locale: Locale;
  localeData: PuckData;
};

export const PuckEditorContext = createContext<PuckEditorContextValue | null>(
  null,
);

export const usePuckSelector = createUsePuck<PuckConfig>();

export const PANEL_HEIGHT = 320;
export const SIDEBAR_WIDTH = "clamp(260px, 24vw, 360px)";
export const SIDEBAR_COLLAPSED_WIDTH = 44;
export const SIDEBAR_HEADER_HEIGHT = 41;
export const COMPACT_LAYOUT_QUERY = "(max-width: 1023px)";

export const PUCK_BORDER = "1px solid var(--puck-color-grey-09, #e2e8f0)";
export const PUCK_SURFACE = "var(--puck-color-grey-12, #f9fafb)";
export const PUCK_MUTED = "var(--puck-color-grey-05, #737373)";
export const PUCK_ACCENT = "var(--puck-color-azure-05, #4d8fc9)";
