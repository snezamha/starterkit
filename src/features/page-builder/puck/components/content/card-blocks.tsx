import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";

import { linkPickerField } from "@/features/page-builder/puck/fields/link-picker";
import { mediaPickerField } from "@/features/page-builder/puck/fields/media-picker";
import {
  sanitizeLinkUrl,
  sanitizeMediaUrl,
} from "@/features/page-builder/puck/safety";
import type { PuckRenderProps } from "@/features/page-builder/puck/render-types";

type CardProps = PuckRenderProps & {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  buttonLabel?: string;
  buttonHref?: string;
  buttonTarget?: "_self" | "_blank";
  variant?: string;
};

type AlertProps = PuckRenderProps & {
  variant?: string;
  title?: string;
  description?: string;
};

const cardVariantMap: Record<string, string> = {
  default:
    "bg-card border border-border rounded-[var(--radius-lg)] p-[var(--spacing-md)]",
  outline:
    "border border-border rounded-[var(--radius-lg)] p-[var(--spacing-md)]",
  ghost: "p-[var(--spacing-md)]",
  elevated:
    "bg-card rounded-[var(--radius-lg)] p-[var(--spacing-md)] shadow-[var(--shadow-md)]",
};

const alertVariantMap: Record<
  string,
  { container: string; icon: string; Icon: typeof Info }
> = {
  info: {
    container: "bg-primary/10 border-primary/20",
    icon: "text-primary",
    Icon: Info,
  },
  success: {
    container:
      "bg-green-500/10 border-green-500/20 dark:bg-green-900/20 dark:border-green-900/40",
    icon: "text-green-600 dark:text-green-400",
    Icon: CheckCircle,
  },
  warning: {
    container:
      "bg-amber-500/10 border-amber-500/20 dark:bg-amber-900/20 dark:border-amber-900/40",
    icon: "text-amber-600 dark:text-amber-400",
    Icon: AlertTriangle,
  },
  destructive: {
    container: "bg-destructive/10 border-destructive/20",
    icon: "text-destructive",
    Icon: XCircle,
  },
};

export const cardBlockComponents = {
  Card: {
    label: "Card",
    fields: {
      title: { type: "text" as const, contentEditable: true },
      description: { type: "textarea" as const, contentEditable: true },
      imageSrc: mediaPickerField,
      imageAlt: { type: "text" as const },
      buttonLabel: { type: "text" as const, contentEditable: true },
      buttonHref: linkPickerField,
      buttonTarget: {
        type: "radio" as const,
        options: [
          { label: "Same tab", value: "_self" },
          { label: "New tab", value: "_blank" },
        ],
      },
      variant: {
        type: "radio" as const,
        options: [
          { label: "Default", value: "default" },
          { label: "Outline", value: "outline" },
          { label: "Ghost", value: "ghost" },
          { label: "Elevated", value: "elevated" },
        ],
      },
    },
    defaultProps: {
      title: "Card Title",
      description: "A short description of this card content.",
      imageSrc: "",
      imageAlt: "",
      buttonLabel: "",
      buttonHref: "",
      buttonTarget: "_self",
      variant: "default",
    },
    render: (props: CardProps) => {
      const {
        title,
        description,
        imageSrc = "",
        imageAlt = "",
        buttonLabel,
        buttonHref = "",
        buttonTarget = "_self",
        variant = "default",
      } = props;
      const cardClass = cardVariantMap[variant] ?? cardVariantMap.default;
      const safeImageSrc = sanitizeMediaUrl(imageSrc);
      const safeButtonHref = sanitizeLinkUrl(buttonHref);

      return (
        <div className={cardClass}>
          {safeImageSrc && (
            <div className="mb-4 overflow-hidden rounded-lg aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={safeImageSrc}
                alt={imageAlt}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          {title && (
            <h3 className="text-foreground text-lg font-semibold mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-muted-foreground text-sm leading-6 whitespace-pre-wrap">
              {description}
            </p>
          )}
          {buttonLabel && safeButtonHref && (
            <div className="mt-4">
              <a
                href={safeButtonHref}
                target={buttonTarget}
                rel={
                  buttonTarget === "_blank" ? "noopener noreferrer" : undefined
                }
                className="text-primary text-sm font-medium hover:underline underline-offset-4"
              >
                {buttonLabel}
              </a>
            </div>
          )}
        </div>
      );
    },
  },

  Alert: {
    label: "Alert",
    fields: {
      variant: {
        type: "radio" as const,
        options: [
          { label: "Info", value: "info" },
          { label: "Success", value: "success" },
          { label: "Warning", value: "warning" },
          { label: "Destructive", value: "destructive" },
        ],
      },
      title: { type: "text" as const, contentEditable: true },
      description: { type: "textarea" as const, contentEditable: true },
    },
    defaultProps: {
      variant: "info",
      title: "Heads up",
      description: "This is an informational message for your visitors.",
    },
    render: (props: AlertProps) => {
      const { variant = "info", title, description } = props;
      const style = alertVariantMap[variant] ?? alertVariantMap.info;
      const Icon = style.Icon;

      return (
        <div
          role="alert"
          className={`flex gap-3 rounded-[var(--radius-lg)] border p-4 ${style.container}`}
        >
          <Icon className={`size-5 shrink-0 ${style.icon}`} />
          <div className="space-y-1">
            {title ? (
              <p className="text-foreground text-sm font-semibold">{title}</p>
            ) : null}
            {description ? (
              <p className="text-muted-foreground text-sm leading-6">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      );
    },
  },
};
