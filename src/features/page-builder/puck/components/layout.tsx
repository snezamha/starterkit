import type { CSSProperties, ReactNode } from "react";

import { applySectionStyle } from "@/features/page-builder/puck/fields/section-style-utils";
import { sectionStyleFieldDef } from "@/features/page-builder/puck/fields/section-style";
import {
  getResponsiveColumnsClass,
  getResponsivePaddingClass,
  responsiveColumnsField,
  responsiveScaleField,
  type ResponsiveColumns,
  type ResponsiveScale,
} from "@/features/page-builder/puck/responsive";
import type { SectionStyleValue } from "@/features/page-builder/puck/fields/section-style";
import type { PuckRenderProps } from "@/features/page-builder/puck/render-types";
import { sanitizeHtmlId } from "@/features/page-builder/puck/safety";

type Slot = () => ReactNode;
type ColumnsProps = PuckRenderProps & {
  count?: number;
  distribution?: string;
  gap?: string;
  responsiveColumns?: Partial<ResponsiveColumns>;
  col1?: Slot;
  col2?: Slot;
  col3?: Slot;
  col4?: Slot;
};
type ContainerProps = PuckRenderProps & {
  padding?: string;
  background?: string;
  rounded?: string;
  bordered?: boolean;
  content?: Slot;
};
type ShapeDividerConfig = {
  type?: string;
  color?: string;
  height?: string;
};
type SectionProps = PuckRenderProps & {
  background?: string;
  paddingY?: string;
  responsivePaddingY?: ResponsiveScale;
  maxWidth?: string;
  anchorId?: string;
  ariaLabel?: string;
  sectionStyle?: SectionStyleValue;
  dividerTop?: ShapeDividerConfig;
  dividerBottom?: ShapeDividerConfig;
  content?: Slot;
};
type VerticalSpaceProps = PuckRenderProps & { size?: string };
type FlexContainerProps = PuckRenderProps & {
  direction?: "row" | "column";
  mobileDirection?: "row" | "column";
  wrap?: "wrap" | "nowrap";
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  gap?: string;
  content?: Slot;
};

const gapMap: Record<string, string> = {
  "0": "gap-0",
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-12",
};

const paddingYMap: Record<string, string> = {
  none: "",
  sm: "py-6",
  md: "py-12",
  lg: "py-20",
  xl: "py-32",
};

const maxWidthMap: Record<string, string> = {
  full: "max-w-none",
  content: "max-w-4xl",
  narrow: "max-w-2xl",
};

const backgroundMap: Record<string, string> = {
  none: "",
  subtle: "bg-muted/50",
  card: "bg-card",
  primary: "bg-primary text-primary-foreground",
};

const containerPaddingMap: Record<string, string> = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-10",
};

const containerRoundedMap: Record<string, string> = {
  none: "",
  sm: "rounded-[var(--radius-sm)]",
  md: "rounded-[var(--radius-md)]",
  lg: "rounded-[var(--radius-lg)]",
};

const dividerHeightMap: Record<string, number> = {
  sm: 40,
  md: 70,
  lg: 110,
};

const dividerColorMap: Record<string, string> = {
  background: "var(--background)",
  muted: "var(--muted)",
  primary: "var(--primary)",
  card: "var(--card)",
};

const dividerPathMap: Record<string, string> = {
  wave: "M0,40 C240,100 480,0 720,40 C960,80 1200,0 1440,40 L1440,100 L0,100 Z",
  angle: "M0,100 L1440,0 L1440,100 Z",
  curve: "M0,0 Q720,100 1440,0 L1440,100 L0,100 Z",
};

const shapeDividerFieldDef = {
  type: "object" as const,
  objectFields: {
    type: {
      type: "radio" as const,
      options: [
        { label: "None", value: "none" },
        { label: "Wave", value: "wave" },
        { label: "Angle", value: "angle" },
        { label: "Curve", value: "curve" },
      ],
    },
    color: {
      type: "radio" as const,
      options: [
        { label: "Background", value: "background" },
        { label: "Muted", value: "muted" },
        { label: "Primary", value: "primary" },
        { label: "Card", value: "card" },
      ],
    },
    height: {
      type: "select" as const,
      options: [
        { label: "Small", value: "sm" },
        { label: "Medium", value: "md" },
        { label: "Large", value: "lg" },
      ],
    },
  },
};

function ShapeDivider({
  config,
  position,
}: {
  config?: ShapeDividerConfig;
  position: "top" | "bottom";
}) {
  const type = config?.type ?? "none";
  if (type === "none" || !dividerPathMap[type]) return null;
  const height = dividerHeightMap[config?.height ?? "md"];
  const fill = dividerColorMap[config?.color ?? "background"];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 overflow-hidden leading-[0] ${
        position === "top" ? "top-0" : "bottom-0"
      }`}
      style={{ height }}
    >
      <svg
        viewBox="0 0 1440 100"
        preserveAspectRatio="none"
        className="block h-full w-full"
        style={position === "top" ? { transform: "rotate(180deg)" } : undefined}
      >
        <path d={dividerPathMap[type]} fill={fill} />
      </svg>
    </div>
  );
}

const spacerSizeMap: Record<string, string> = {
  xs: "h-2",
  sm: "h-4",
  md: "h-8",
  lg: "h-16",
  xl: "h-24",
  "2xl": "h-40",
};

export const layoutComponents = {
  Columns: {
    label: "Columns",
    fields: {
      count: {
        type: "radio" as const,
        options: [
          { label: "2", value: 2 },
          { label: "3", value: 3 },
          { label: "4", value: 4 },
        ],
      },
      distribution: {
        type: "select" as const,
        options: [
          { label: "Equal", value: "equal" },
          { label: "Wide Left (2/3 + 1/3)", value: "wide-left" },
          { label: "Wide Right (1/3 + 2/3)", value: "wide-right" },
        ],
      },
      gap: {
        type: "select" as const,
        options: [
          { label: "None", value: "0" },
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
      responsiveColumns: responsiveColumnsField,
      col1: { type: "slot" as const },
      col2: { type: "slot" as const },
      col3: { type: "slot" as const },
      col4: { type: "slot" as const },
    },
    defaultProps: {
      count: 2,
      distribution: "equal",
      gap: "md",
      responsiveColumns: { mobile: "1", tablet: "2", desktop: "2" },
    },
    render: (props: ColumnsProps) => {
      const {
        count = 2,
        distribution = "equal",
        gap = "md",
        responsiveColumns,
        col1,
        col2,
        col3,
        col4,
      } = props;
      const colCount = Number(count);
      const gapClass = gapMap[gap] ?? "gap-6";
      const distributionClass =
        colCount === 2 && distribution === "wide-left"
          ? "lg:grid-cols-[2fr_1fr]"
          : colCount === 2 && distribution === "wide-right"
            ? "lg:grid-cols-[1fr_2fr]"
            : "";

      return (
        <div
          className={`grid ${getResponsiveColumnsClass(responsiveColumns)} ${distributionClass} ${gapClass}`}
        >
          <div className="min-w-0">{col1?.()}</div>
          <div className="min-w-0">{col2?.()}</div>
          {colCount >= 3 && <div className="min-w-0">{col3?.()}</div>}
          {colCount >= 4 && <div className="min-w-0">{col4?.()}</div>}
        </div>
      );
    },
  },

  Container: {
    label: "Container",
    fields: {
      padding: {
        type: "select" as const,
        options: [
          { label: "None", value: "none" },
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
      background: {
        type: "radio" as const,
        options: [
          { label: "None", value: "none" },
          { label: "Subtle", value: "subtle" },
          { label: "Card", value: "card" },
        ],
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
      bordered: {
        type: "radio" as const,
        options: [
          { label: "No", value: false },
          { label: "Yes", value: true },
        ],
      },
      content: { type: "slot" as const },
    },
    defaultProps: {
      padding: "md",
      background: "none",
      rounded: "none",
      bordered: false,
    },
    render: (props: ContainerProps) => {
      const {
        padding = "md",
        background = "none",
        rounded = "none",
        bordered = false,
        content,
      } = props;
      const className = [
        containerPaddingMap[padding] ?? "p-6",
        backgroundMap[background] ?? "",
        containerRoundedMap[rounded] ?? "",
        bordered ? "border border-border" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return <div className={className}>{content?.()}</div>;
    },
  },

  Section: {
    label: "Section",
    fields: {
      background: {
        type: "radio" as const,
        options: [
          { label: "None", value: "none" },
          { label: "Subtle", value: "subtle" },
          { label: "Card", value: "card" },
          { label: "Primary", value: "primary" },
        ],
      },
      paddingY: {
        type: "select" as const,
        options: [
          { label: "None", value: "none" },
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
          { label: "X-Large", value: "xl" },
        ],
      },
      responsivePaddingY: responsiveScaleField,
      maxWidth: {
        type: "radio" as const,
        options: [
          { label: "Full", value: "full" },
          { label: "Content", value: "content" },
          { label: "Narrow", value: "narrow" },
        ],
      },
      anchorId: { type: "text" as const },
      ariaLabel: { type: "text" as const },
      sectionStyle: sectionStyleFieldDef,
      dividerTop: shapeDividerFieldDef,
      dividerBottom: shapeDividerFieldDef,
      content: { type: "slot" as const },
    },
    defaultProps: {
      background: "none",
      paddingY: "md",
      responsivePaddingY: { mobile: "sm", tablet: "md", desktop: "lg" },
      maxWidth: "content",
      anchorId: "",
      ariaLabel: "",
      sectionStyle: {},
      dividerTop: { type: "none", color: "background", height: "md" },
      dividerBottom: { type: "none", color: "background", height: "md" },
    },
    render: (props: SectionProps) => {
      const {
        background = "none",
        paddingY = "md",
        responsivePaddingY,
        maxWidth = "content",
        anchorId = "",
        ariaLabel = "",
        sectionStyle,
        dividerTop,
        dividerBottom,
        content,
      } = props;
      const paddingClass = responsivePaddingY
        ? getResponsivePaddingClass(responsivePaddingY)
        : (paddingYMap[paddingY] ?? "py-12");
      return (
        <section
          id={sanitizeHtmlId(anchorId) || undefined}
          aria-label={ariaLabel || undefined}
          className={`relative w-full ${backgroundMap[background] ?? ""} ${paddingClass}`}
          style={applySectionStyle(sectionStyle)}
        >
          <ShapeDivider config={dividerTop} position="top" />
          <div
            className={`relative mx-auto w-full px-[var(--spacing-md)] ${maxWidthMap[maxWidth] ?? "max-w-4xl"}`}
          >
            {content?.()}
          </div>
          <ShapeDivider config={dividerBottom} position="bottom" />
        </section>
      );
    },
  },

  VerticalSpace: {
    label: "Vertical Space",
    fields: {
      size: {
        type: "select" as const,
        options: [
          { label: "XS (8px)", value: "xs" },
          { label: "Small (16px)", value: "sm" },
          { label: "Medium (32px)", value: "md" },
          { label: "Large (64px)", value: "lg" },
          { label: "X-Large (96px)", value: "xl" },
          { label: "2X-Large (160px)", value: "2xl" },
        ],
      },
    },
    defaultProps: { size: "md" },
    render: (props: VerticalSpaceProps) => {
      const { size = "md" } = props;
      return (
        <div className={spacerSizeMap[size] ?? "h-8"} aria-hidden="true" />
      );
    },
  },

  FlexContainer: {
    label: "Flex Container",
    fields: {
      direction: {
        type: "radio" as const,
        options: [
          { label: "Row", value: "row" },
          { label: "Column", value: "column" },
        ],
      },
      mobileDirection: {
        type: "radio" as const,
        options: [
          { label: "Row", value: "row" },
          { label: "Column", value: "column" },
        ],
      },
      wrap: {
        type: "radio" as const,
        options: [
          { label: "Wrap", value: "wrap" },
          { label: "No wrap", value: "nowrap" },
        ],
      },
      align: {
        type: "select" as const,
        options: [
          { label: "Start", value: "flex-start" },
          { label: "Center", value: "center" },
          { label: "End", value: "flex-end" },
          { label: "Stretch", value: "stretch" },
          { label: "Baseline", value: "baseline" },
        ],
      },
      justify: {
        type: "select" as const,
        options: [
          { label: "Start", value: "flex-start" },
          { label: "Center", value: "center" },
          { label: "End", value: "flex-end" },
          { label: "Space between", value: "space-between" },
          { label: "Space around", value: "space-around" },
          { label: "Space evenly", value: "space-evenly" },
        ],
      },
      gap: {
        type: "select" as const,
        options: [
          { label: "None", value: "0" },
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
      content: { type: "slot" as const },
    },
    defaultProps: {
      direction: "row",
      mobileDirection: "column",
      wrap: "wrap",
      align: "flex-start",
      justify: "flex-start",
      gap: "md",
    },
    render: (props: FlexContainerProps) => {
      const {
        direction = "row",
        mobileDirection = "column",
        wrap = "wrap",
        align = "flex-start",
        justify = "flex-start",
        gap = "md",
        content,
        puck,
      } = props;

      const gapValue = gapMap[gap] ?? "gap-6";

      return (
        <div
          className={`flex ${mobileDirection === "column" ? "flex-col" : "flex-row"} ${direction === "column" ? "md:flex-col" : "md:flex-row"} ${gapValue}`}
          style={{
            flexWrap: wrap as "wrap" | "nowrap",
            alignItems: align,
            justifyContent: justify,
            padding: puck?.isEditing ? "8px" : undefined,
          }}
        >
          {content?.()}
        </div>
      );
    },
  },
};
