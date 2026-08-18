export type SpacingSettings = {
  marginTop?: string;
  marginBottom?: string;
  paddingTop?: string;
  paddingBottom?: string;
};

export type AdvancedSettings = {
  spacing?: SpacingSettings;
  rounded?: string;
  shadow?: string;
  animation?: string;
};

export const defaultAdvancedSettings: AdvancedSettings = {
  spacing: {
    marginTop: "none",
    marginBottom: "none",
    paddingTop: "none",
    paddingBottom: "none",
  },
  rounded: "none",
  shadow: "none",
  animation: "none",
};

const spacingOptions = [
  { label: "None", value: "none" },
  { label: "Small", value: "sm" },
  { label: "Medium", value: "md" },
  { label: "Large", value: "lg" },
  { label: "X-Large", value: "xl" },
];

export const advancedField = {
  type: "object" as const,
  objectFields: {
    spacing: {
      type: "object" as const,
      objectFields: {
        marginTop: { type: "select" as const, options: spacingOptions },
        marginBottom: { type: "select" as const, options: spacingOptions },
        paddingTop: { type: "select" as const, options: spacingOptions },
        paddingBottom: { type: "select" as const, options: spacingOptions },
      },
    },
    rounded: {
      type: "select" as const,
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    shadow: {
      type: "select" as const,
      options: [
        { label: "None", value: "none" },
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
    animation: {
      type: "select" as const,
      options: [
        { label: "None", value: "none" },
        { label: "Fade in", value: "fade" },
        { label: "Slide up", value: "slide-up" },
        { label: "Zoom in", value: "zoom" },
      ],
    },
  },
};

const marginTopMap: Record<string, string> = {
  none: "",
  sm: "mt-4",
  md: "mt-8",
  lg: "mt-16",
  xl: "mt-24",
};

const marginBottomMap: Record<string, string> = {
  none: "",
  sm: "mb-4",
  md: "mb-8",
  lg: "mb-16",
  xl: "mb-24",
};

const paddingTopMap: Record<string, string> = {
  none: "",
  sm: "pt-4",
  md: "pt-8",
  lg: "pt-16",
  xl: "pt-24",
};

const paddingBottomMap: Record<string, string> = {
  none: "",
  sm: "pb-4",
  md: "pb-8",
  lg: "pb-16",
  xl: "pb-24",
};

export function getSpacingClass(spacing?: SpacingSettings) {
  if (!spacing) return "";
  return [
    marginTopMap[spacing.marginTop ?? "none"] ?? "",
    marginBottomMap[spacing.marginBottom ?? "none"] ?? "",
    paddingTopMap[spacing.paddingTop ?? "none"] ?? "",
    paddingBottomMap[spacing.paddingBottom ?? "none"] ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

const roundedMap: Record<string, string> = {
  none: "",
  sm: "rounded-[var(--radius-sm)] overflow-hidden",
  md: "rounded-[var(--radius-md)] overflow-hidden",
  lg: "rounded-[var(--radius-lg)] overflow-hidden",
};

export function getRoundedClass(rounded?: string) {
  return roundedMap[rounded ?? "none"] ?? "";
}

const shadowMap: Record<string, string> = {
  none: "",
  sm: "shadow-[var(--shadow-sm)]",
  md: "shadow-[var(--shadow-md)]",
  lg: "shadow-[var(--shadow-lg)]",
};

export function getShadowClass(shadow?: string) {
  return shadowMap[shadow ?? "none"] ?? "";
}
