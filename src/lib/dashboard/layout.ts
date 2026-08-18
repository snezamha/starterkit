export type DashboardLayoutItem = {
  id: string;
  full: boolean;
  minimized: boolean;
};

export type DashboardLayout =
  string[] | { items: DashboardLayoutItem[]; hidden?: string[] };

function isLayoutItem(value: unknown): value is DashboardLayoutItem {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof (value as { id: unknown }).id === "string" &&
    "full" in value &&
    typeof (value as { full: unknown }).full === "boolean"
  );
}

export function parseDashboardLayout(value: unknown): DashboardLayout {
  if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
    return value as string[];
  }

  if (
    value &&
    typeof value === "object" &&
    "items" in value &&
    Array.isArray((value as { items: unknown }).items)
  ) {
    const items = (value as { items: unknown[] }).items
      .filter(isLayoutItem)
      .map((item) => ({
        id: item.id,
        full: item.full,
        minimized: Boolean(item.minimized),
      }));
    const rawHidden = (value as { hidden?: unknown }).hidden;
    const hidden = Array.isArray(rawHidden)
      ? rawHidden.filter((v): v is string => typeof v === "string")
      : [];
    return { items, hidden };
  }

  return [];
}
