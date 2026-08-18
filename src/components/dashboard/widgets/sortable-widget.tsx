"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Maximize2,
  Minimize2,
} from "lucide-react";

import { WidgetBox } from "@/components/dashboard/widgets/widget-box";
import { WidgetLoader } from "@/components/dashboard/widgets/widget-loader";
import { isFixedSizeWidget } from "@/lib/dashboard/core-widgets";
import type { DashboardLayoutItem } from "@/lib/dashboard/layout";
import { cn } from "@/lib/utils";

export type WidgetLabels = {
  expand: string;
  collapse: string;
  moveUp: string;
  moveDown: string;
  reorder: string;
  minimize: string;
  restore: string;
};

type Props = {
  item: DashboardLayoutItem;
  title?: string;
  labels: WidgetLabels;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onToggleFull: (id: string) => void;
  onToggleMinimize: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  widgetProps?: Record<string, unknown>;
};

export function SortableWidget({
  item,
  title,
  labels,
  canMoveUp,
  canMoveDown,
  onToggleFull,
  onToggleMinimize,
  onMoveUp,
  onMoveDown,
  widgetProps,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const [moduleId, widgetId] = item.id.split(":");
  const fixedSize = isFixedSizeWidget(item.id);
  const isFull = fixedSize || item.full;
  const isMinimized = fixedSize ? false : item.minimized;

  const headerStart = (
    <>
      <button
        type="button"
        aria-label={labels.reorder}
        className="hidden cursor-grab rounded active:cursor-grabbing sm:flex"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="text-muted-foreground size-4 shrink-0" />
      </button>
      <div className="flex items-center gap-0.5 sm:hidden">
        <button
          type="button"
          aria-label={labels.moveUp}
          disabled={!canMoveUp}
          onClick={() => onMoveUp(item.id)}
          className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors disabled:opacity-30"
        >
          <ArrowUp className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={labels.moveDown}
          disabled={!canMoveDown}
          onClick={() => onMoveDown(item.id)}
          className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors disabled:opacity-30"
        >
          <ArrowDown className="size-3.5" />
        </button>
      </div>
    </>
  );

  const headerEnd = fixedSize ? null : (
    <button
      type="button"
      onClick={() => onToggleFull(item.id)}
      title={item.full ? labels.collapse : labels.expand}
      aria-label={item.full ? labels.collapse : labels.expand}
      className="text-muted-foreground hover:text-foreground hidden rounded p-0.5 transition-colors sm:flex"
    >
      {item.full ? (
        <Minimize2 className="size-3.5" />
      ) : (
        <Maximize2 className="size-3.5" />
      )}
    </button>
  );

  return (
    <WidgetBox
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition: transition ?? undefined,
        gridColumn: isFull ? "1 / -1" : undefined,
      }}
      className={cn("transition-opacity", isDragging && "opacity-0")}
      title={title}
      minimized={isMinimized}
      onToggleMinimize={fixedSize ? undefined : () => onToggleMinimize(item.id)}
      minimizeLabel={labels.minimize}
      restoreLabel={labels.restore}
      headerStart={headerStart}
      headerEnd={headerEnd}
    >
      <WidgetLoader
        moduleId={moduleId!}
        widgetId={widgetId!}
        widgetProps={widgetProps}
      />
    </WidgetBox>
  );
}
