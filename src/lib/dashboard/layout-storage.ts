import {
  parseDashboardLayout,
  type DashboardLayout,
  type DashboardLayoutItem,
} from "./layout";

function getLayoutEventName(storageKey: string) {
  return `dashboard-layout-change:${storageKey}`;
}

type StoredLayoutState = {
  items: unknown[];
  hidden: string[];
};

function readStoredState(storageKey: string): StoredLayoutState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(storageKey);

  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return null;
    }

    const record = value as { items?: unknown; hidden?: unknown };
    return {
      items: Array.isArray(record.items) ? record.items : [],
      hidden: Array.isArray(record.hidden)
        ? record.hidden.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
    };
  } catch {
    return null;
  }
}

function write(
  storageKey: string,
  value: { items: unknown; hidden: string[] },
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
    window.dispatchEvent(new Event(getLayoutEventName(storageKey)));
  } catch {}
}

export function readStoredLayoutSnapshot(storageKey: string) {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(storageKey);
}

export function readStoredLayout(storageKey: string): DashboardLayout | null {
  const state = readStoredState(storageKey);
  return state
    ? parseDashboardLayout({ items: state.items, hidden: state.hidden })
    : null;
}

export function readStoredHidden(storageKey: string): string[] {
  return readStoredState(storageKey)?.hidden ?? [];
}

export function writeStoredLayout(
  storageKey: string,
  items: DashboardLayoutItem[],
) {
  write(storageKey, { items, hidden: readStoredHidden(storageKey) });
}

export function writeStoredHidden(storageKey: string, hidden: string[]) {
  write(storageKey, {
    items: readStoredState(storageKey)?.items ?? [],
    hidden,
  });
}

export function clearStoredLayout(storageKey: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event(getLayoutEventName(storageKey)));
  } catch {}
}

export function subscribeLayout(storageKey: string, onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key === storageKey) onStoreChange();
  }

  const eventName = getLayoutEventName(storageKey);

  window.addEventListener("storage", handleStorage);
  window.addEventListener(eventName, onStoreChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(eventName, onStoreChange);
  };
}

function isLayoutItemsArray(
  value: unknown,
): value is { items: DashboardLayoutItem[] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  if (!("items" in value) || !Array.isArray(value.items)) return false;
  return value.items.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      "id" in item &&
      typeof item.id === "string" &&
      "full" in item &&
      typeof item.full === "boolean",
  );
}

export function buildInitialItems(
  initialLayout: DashboardLayout,
  activeWidgetIds: string[],
): DashboardLayoutItem[] {
  const activeSet = new Set(activeWidgetIds);
  let result: DashboardLayoutItem[] = [];

  if (isLayoutItemsArray(initialLayout)) {
    result = initialLayout.items.filter((item) => activeSet.has(item.id));
  } else if (Array.isArray(initialLayout)) {
    result = initialLayout
      .filter((id) => activeSet.has(id))
      .map((id) => ({ id, full: false, minimized: false }));
  }

  const seen = new Set(result.map((item) => item.id));
  activeWidgetIds.forEach((id) => {
    if (!seen.has(id)) result.push({ id, full: false, minimized: false });
  });

  return result;
}
