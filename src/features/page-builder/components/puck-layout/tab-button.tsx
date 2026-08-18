"use client";

import { PUCK_ACCENT, PUCK_MUTED } from "./context";

type Props = {
  label: string;
  active: boolean;
  compact?: boolean;
  onClick: () => void;
};

export function TabButton({ label, active, compact, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      style={{
        flex: "1 1 0",
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        padding: compact ? "10px 8px" : "10px 10px",
        fontSize: compact ? 11 : 12,
        fontWeight: active ? 600 : 400,
        color: active ? PUCK_ACCENT : PUCK_MUTED,
        borderTop: "none",
        borderInlineStart: "none",
        borderInlineEnd: "none",
        borderBottom: `2px solid ${active ? PUCK_ACCENT : "transparent"}`,
        background: "none",
        cursor: "pointer",
        transition: "color 0.15s, border-color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}
