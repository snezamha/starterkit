"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { LayoutDashboard, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  readStoredHidden,
  subscribeLayout,
  writeStoredHidden,
} from "@/lib/dashboard/layout-storage";

function getServerHiddenSnapshot() {
  return "[]";
}

export function useWidgetVisibility(
  allWidgetIds: string[],
  storageKey: string,
) {
  const hiddenSnapshot = useSyncExternalStore(
    useCallback(
      (onStoreChange) => subscribeLayout(storageKey, onStoreChange),
      [storageKey],
    ),
    useCallback(
      () => JSON.stringify(readStoredHidden(storageKey)),
      [storageKey],
    ),
    getServerHiddenSnapshot,
  );
  const hidden = useMemo(() => {
    try {
      const parsed = JSON.parse(hiddenSnapshot);
      return Array.isArray(parsed)
        ? new Set<string>(parsed)
        : new Set<string>();
    } catch {
      return new Set<string>();
    }
  }, [hiddenSnapshot]);

  const toggle = useCallback(
    (id: string) => {
      const next = new Set(hidden);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeStoredHidden(storageKey, [...next]);
    },
    [hidden, storageKey],
  );

  const visibleWidgetIds = allWidgetIds.filter((id) => !hidden.has(id));

  return { hidden, toggle, visibleWidgetIds };
}

export function WidgetVisibilityPanel({
  allWidgetIds,
  widgetTitles,
  hidden,
  onToggle,
  onReset,
  customizeLabel,
  resetLabel,
}: {
  allWidgetIds: string[];
  widgetTitles: Record<string, string>;
  hidden: Set<string>;
  onToggle: (id: string) => void;
  onReset: () => void;
  customizeLabel: string;
  resetLabel: string;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-md p-1.5 transition-colors"
        title={customizeLabel}
        aria-label={customizeLabel}
      >
        <LayoutDashboard className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-2">
        <p className="text-muted-foreground px-2 pb-2 text-xs font-medium">
          {customizeLabel}
        </p>
        <div className="space-y-0.5">
          {allWidgetIds.map((id) => (
            <label
              key={id}
              className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5"
            >
              <span className="text-sm">{widgetTitles[id] ?? id}</span>
              <Switch
                checked={!hidden.has(id)}
                onCheckedChange={() => onToggle(id)}
              />
            </label>
          ))}
        </div>
        <Separator className="my-2" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onReset}
        >
          <RotateCcw className="size-4" />
          {resetLabel}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
