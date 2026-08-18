import { IconPickerField } from "@/features/page-builder/puck/fields/icon-picker";
import { linkPickerField } from "@/features/page-builder/puck/fields/link-picker";
import { getBuilderIcon } from "@/features/page-builder/puck/icon-registry";
import { sanitizeLinkUrl } from "@/features/page-builder/puck/safety";
import type { PuckRenderProps } from "@/features/page-builder/puck/render-types";

const buttonVariantMap: Record<string, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-2xl font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center rounded-2xl font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
  outline:
    "border border-border bg-background hover:bg-muted text-foreground inline-flex items-center justify-center rounded-2xl font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
  ghost:
    "hover:bg-muted text-foreground inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-200 hover:-translate-y-0.5",
  destructive:
    "bg-destructive text-white hover:bg-destructive/90 inline-flex items-center justify-center rounded-2xl font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
};

const buttonSizeMap: Record<string, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-8 text-lg",
};

const separatorStyleMap: Record<string, string> = {
  solid: "border-solid",
  dashed: "border-dashed",
  dotted: "border-dotted",
};

const separatorSpacingMap: Record<string, string> = {
  sm: "my-4",
  md: "my-8",
  lg: "my-16",
};

export const navigationComponents = {
  ButtonLink: {
    label: "Button",
    fields: {
      label: { type: "text" as const, contentEditable: true },
      href: linkPickerField,
      icon: {
        type: "custom" as const,
        render: IconPickerField,
      },
      variant: {
        type: "select" as const,
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Outline", value: "outline" },
          { label: "Ghost", value: "ghost" },
          { label: "Destructive", value: "destructive" },
        ],
      },
      size: {
        type: "radio" as const,
        options: [
          { label: "SM", value: "sm" },
          { label: "MD", value: "md" },
          { label: "LG", value: "lg" },
          { label: "XL", value: "xl" },
        ],
      },
      target: {
        type: "radio" as const,
        options: [
          { label: "Same tab", value: "_self" },
          { label: "New tab", value: "_blank" },
        ],
      },
      stackSpacing: {
        type: "radio" as const,
        options: [
          { label: "No", value: false },
          { label: "Yes", value: true },
        ],
      },
      fullWidth: {
        type: "radio" as const,
        options: [
          { label: "Auto", value: false },
          { label: "Full width", value: true },
        ],
      },
    },
    defaultProps: {
      label: "Learn more",
      href: "/",
      icon: "",
      variant: "primary",
      size: "md",
      target: "_self",
      fullWidth: false,
    },
    render: (props: ButtonProps) => {
      const {
        label,
        href = "/",
        icon = "",
        variant = "primary",
        size = "md",
        target = "_self",
        stackSpacing = false,
        fullWidth = false,
      } = props;
      const IconComponent = icon ? getBuilderIcon(icon) : null;
      const className = [
        buttonVariantMap[variant] ?? buttonVariantMap.primary,
        buttonSizeMap[size] ?? buttonSizeMap.md,
        "gap-2",
        stackSpacing ? "mb-4 last:mb-0" : "",
        fullWidth ? "w-full" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const safeHref = sanitizeLinkUrl(href);

      return (
        <a
          href={safeHref || undefined}
          target={safeHref ? target : undefined}
          rel={
            safeHref && target === "_blank" ? "noopener noreferrer" : undefined
          }
          aria-disabled={!safeHref || undefined}
          className={`${className} ${safeHref ? "" : "pointer-events-none opacity-60"}`}
        >
          {IconComponent ? (
            <IconComponent size={16} strokeWidth={1.6} aria-hidden="true" />
          ) : null}
          {label}
        </a>
      );
    },
  },

  Separator: {
    label: "Separator",
    fields: {
      label: { type: "text" as const, contentEditable: true },
      style: {
        type: "radio" as const,
        options: [
          { label: "Solid", value: "solid" },
          { label: "Dashed", value: "dashed" },
          { label: "Dotted", value: "dotted" },
        ],
      },
      spacing: {
        type: "radio" as const,
        options: [
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
    },
    defaultProps: {
      label: "",
      style: "solid",
      spacing: "md",
    },
    render: (props: SeparatorProps) => {
      const { label, style = "solid", spacing = "md" } = props;
      const spacingClass = separatorSpacingMap[spacing] ?? "my-8";
      const styleClass = separatorStyleMap[style] ?? "border-solid";

      if (label) {
        return (
          <div className={`flex items-center gap-4 ${spacingClass}`}>
            <div className={`flex-1 border-t border-border ${styleClass}`} />
            <span className="text-muted-foreground text-sm shrink-0">
              {label}
            </span>
            <div className={`flex-1 border-t border-border ${styleClass}`} />
          </div>
        );
      }

      return (
        <hr
          className={`border-t border-border ${styleClass} ${spacingClass}`}
        />
      );
    },
  },
};

type ButtonProps = PuckRenderProps & {
  label?: string;
  href?: string;
  variant?: string;
  size?: string;
  target?: "_self" | "_blank";
  fullWidth?: boolean;
  stackSpacing?: boolean;
  icon?: string;
};
type SeparatorProps = PuckRenderProps & {
  label?: string;
  style?: string;
  spacing?: string;
};
