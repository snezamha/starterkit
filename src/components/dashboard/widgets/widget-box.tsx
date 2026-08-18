"use client";

import type { CSSProperties, ReactNode, Ref } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";

type WidgetBoxProps = {
  ref?: Ref<HTMLDivElement>;
  title?: string;
  minimized?: boolean;
  onToggleMinimize?: () => void;
  minimizeLabel?: string;
  restoreLabel?: string;
  headerStart?: ReactNode;
  headerEnd?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
};

export function WidgetBox({
  ref,
  title,
  minimized = false,
  onToggleMinimize,
  minimizeLabel,
  restoreLabel,
  headerStart,
  headerEnd,
  children,
  className,
  contentClassName,
  style,
}: WidgetBoxProps) {
  return (
    <div
      ref={ref}
      style={style}
      className={cn("overflow-hidden rounded-xl", className)}
    >
      <div
        className={cn(
          "bg-muted/40 flex items-center gap-2 border px-3 py-2 select-none transition-[border-radius] duration-200",
          minimized ? "rounded-xl" : "rounded-t-xl",
        )}
      >
        {headerStart}
        {title ? (
          <span className="text-muted-foreground min-w-0 flex-1 truncate text-xs font-medium">
            {title}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        <div className="flex items-center gap-1">
          {headerEnd}
          {onToggleMinimize ? (
            <button
              type="button"
              onClick={onToggleMinimize}
              aria-expanded={!minimized}
              aria-label={minimized ? restoreLabel : minimizeLabel}
              title={minimized ? restoreLabel : minimizeLabel}
              className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
            >
              {minimized ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronUp className="size-3.5" />
              )}
            </button>
          ) : null}
        </div>
      </div>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{ gridTemplateRows: minimized ? "0fr" : "1fr" }}
      >
        <div
          className={cn(
            "bg-card min-h-0 min-w-0 overflow-hidden rounded-b-xl",
            !minimized && "min-h-32 border-x border-b p-4",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
