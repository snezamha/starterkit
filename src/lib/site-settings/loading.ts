import {
  defaultLoadingSpinner,
  isLoadingSpinnerId,
} from "@/lib/loading/spinners";

export const loadingPositionOptions = [
  "top-start",
  "top-center",
  "top-end",
  "center",
  "bottom-start",
  "bottom-center",
  "bottom-end",
] as const;

export const loadingColorModeOptions = ["theme", "custom"] as const;

export type LoadingPosition = (typeof loadingPositionOptions)[number];
export type LoadingColorMode = (typeof loadingColorModeOptions)[number];

export type LoadingSettings = {
  enabled: boolean;
  spinner: string;
  position: LoadingPosition;
  colorMode: LoadingColorMode;
  color: string;
  size: number;
};

export const defaultLoadingSettings: LoadingSettings = {
  enabled: true,
  spinner: defaultLoadingSpinner,
  position: "top-end",
  colorMode: "theme",
  color: "#2563eb",
  size: 64,
};

export function sanitizeLoadingSpinner(value: unknown) {
  return isLoadingSpinnerId(value) ? value : undefined;
}

function sanitizeLoadingPosition(value: unknown): LoadingPosition | undefined {
  return loadingPositionOptions.includes(value as LoadingPosition)
    ? (value as LoadingPosition)
    : undefined;
}

function sanitizeLoadingColorMode(
  value: unknown,
): LoadingColorMode | undefined {
  return loadingColorModeOptions.includes(value as LoadingColorMode)
    ? (value as LoadingColorMode)
    : undefined;
}

export function sanitizeLoadingColor(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const color = value.trim();

  return /^#[0-9a-f]{6}$/i.test(color) ? color : undefined;
}

function sanitizeLoadingSize(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  const size = Math.round(value);

  return size < 32 || size > 128 ? undefined : size;
}

export function resolveLoadingColor(
  mode: LoadingColorMode,
  customColor: string,
) {
  return mode === "theme" ? "var(--primary)" : customColor;
}

export function sanitizeLoadingSettings(
  data: Partial<LoadingSettings>,
): Partial<LoadingSettings> {
  const spinner = sanitizeLoadingSpinner(data.spinner);
  const position = sanitizeLoadingPosition(data.position);
  const colorMode = sanitizeLoadingColorMode(data.colorMode);
  const color = sanitizeLoadingColor(data.color);
  const size = sanitizeLoadingSize(data.size);

  return {
    ...(typeof data.enabled === "boolean" && { enabled: data.enabled }),
    ...(spinner && { spinner }),
    ...(position && { position }),
    ...(colorMode && { colorMode }),
    ...(color && { color }),
    ...(size !== undefined && { size }),
  };
}

export function parseLoadingSettings(value: unknown): LoadingSettings {
  const record =
    value && typeof value === "object"
      ? (value as Partial<LoadingSettings>)
      : {};

  return { ...defaultLoadingSettings, ...sanitizeLoadingSettings(record) };
}
