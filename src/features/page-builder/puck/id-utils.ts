export type SavedComponentData = {
  type: string;
  props: Record<string, unknown> & { id: string };
};

function isComponentData(value: unknown): value is SavedComponentData {
  return (
    !!value && typeof value === "object" && "type" in value && "props" in value
  );
}

function freshId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export function regenerateComponentIds(
  component: SavedComponentData,
): SavedComponentData {
  const props: Record<string, unknown> & { id: string } = {
    ...component.props,
    id: freshId(),
  };

  for (const [key, value] of Object.entries(component.props)) {
    if (Array.isArray(value)) {
      props[key] = value.map((item) =>
        isComponentData(item) ? regenerateComponentIds(item) : item,
      );
    }
  }

  return { type: component.type, props };
}
