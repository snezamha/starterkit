"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import {
  SortableWidget,
  type WidgetLabels,
} from "@/components/dashboard/widgets/sortable-widget";
import { WidgetBox } from "@/components/dashboard/widgets/widget-box";
import { WidgetLoader } from "@/components/dashboard/widgets/widget-loader";
import { isFixedSizeWidget } from "@/lib/dashboard/core-widgets";
import type {
  DashboardLayout,
  DashboardLayoutItem,
} from "@/lib/dashboard/layout";
import {
  buildInitialItems,
  readStoredLayout,
  readStoredLayoutSnapshot,
  subscribeLayout,
  writeStoredLayout,
} from "@/lib/dashboard/layout-storage";
import { cn } from "@/lib/utils";

type Props = {
  activeWidgetIds: string[];
  storageKey: string;
  labels: WidgetLabels;
  emptyLabel: string;
  widgetTitles?: Record<string, string>;
  widgetProps?: Record<string, Record<string, unknown>>;
  defaultLayout?: DashboardLayout;
};

export function SortableDashboard({
  activeWidgetIds,
  storageKey,
  labels,
  emptyLabel,
  widgetTitles = {},
  widgetProps = {},
  defaultLayout = [],
}: Props) {
  const storedLayoutSnapshot = useSyncExternalStore(
    useCallback(
      (onStoreChange) => subscribeLayout(storageKey, onStoreChange),
      [storageKey],
    ),
    useCallback(() => readStoredLayoutSnapshot(storageKey), [storageKey]),
    () => null,
  );

  const items = useMemo(
    () =>
      buildInitialItems(
        storedLayoutSnapshot
          ? (readStoredLayout(storageKey) ?? defaultLayout)
          : defaultLayout,
        activeWidgetIds,
      ),
    [activeWidgetIds, defaultLayout, storageKey, storedLayoutSnapshot],
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const persist = useCallback(
    (newItems: DashboardLayoutItem[]) =>
      writeStoredLayout(storageKey, newItems),
    [storageKey],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const move = useCallback(
    (id: string, offset: number) => {
      const index = items.findIndex((item) => item.id === id);
      const target = index + offset;
      if (index < 0 || target < 0 || target >= items.length) return;
      persist(arrayMove(items, index, target));
    },
    [persist, items],
  );

  const toggleFlag = useCallback(
    (id: string, flag: "full" | "minimized") => {
      persist(
        items.map((item) =>
          item.id === id ? { ...item, [flag]: !item[flag] } : item,
        ),
      );
    },
    [persist, items],
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    persist(arrayMove(items, oldIndex, newIndex));
  }

  const activeItem = items.find((item) => item.id === activeId);

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
        {emptyLabel}
      </div>
    );
  }

  return (
    <DndContext
      id="dashboard-layout-dnd"
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={rectSortingStrategy}
      >
        <div
          className={cn(
            "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
            activeId && "cursor-grabbing select-none",
          )}
        >
          {items.map((item, index) => (
            <SortableWidget
              key={item.id}
              item={item}
              title={widgetTitles[item.id]}
              labels={labels}
              canMoveUp={index > 0}
              canMoveDown={index < items.length - 1}
              onToggleFull={(id) => toggleFlag(id, "full")}
              onToggleMinimize={(id) => toggleFlag(id, "minimized")}
              onMoveUp={(id) => move(id, -1)}
              onMoveDown={(id) => move(id, 1)}
              widgetProps={widgetProps[item.id]}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem ? (
          <WidgetBox
            className="pointer-events-none opacity-95 shadow-2xl"
            style={{
              gridColumn:
                isFixedSizeWidget(activeItem.id) || activeItem.full
                  ? "1 / -1"
                  : undefined,
            }}
            title={widgetTitles[activeItem.id]}
            minimized={
              isFixedSizeWidget(activeItem.id) ? false : activeItem.minimized
            }
          >
            {(isFixedSizeWidget(activeItem.id) || !activeItem.minimized) && (
              <WidgetLoader
                moduleId={activeItem.id.split(":")[0]!}
                widgetId={activeItem.id.split(":")[1]!}
                widgetProps={widgetProps[activeItem.id]}
              />
            )}
          </WidgetBox>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
