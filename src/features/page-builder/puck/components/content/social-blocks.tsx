import { User } from "lucide-react";

import { mediaPickerField } from "@/features/page-builder/puck/fields/media-picker";
import { sanitizeMediaUrl } from "@/features/page-builder/puck/safety";
import type { PuckRenderProps } from "@/features/page-builder/puck/render-types";

import { StarsDisplay } from "./stars-display";

type TestimonialProps = PuckRenderProps & {
  quote?: string;
  name?: string;
  role?: string;
  avatarSrc?: string;
  rating?: number;
};

export const socialBlockComponents = {
  Testimonial: {
    label: "Testimonial",
    fields: {
      quote: { type: "textarea" as const, contentEditable: true },
      name: { type: "text" as const, contentEditable: true },
      role: { type: "text" as const, contentEditable: true },
      avatarSrc: mediaPickerField,
      rating: {
        type: "number" as const,
        min: 0,
        max: 5,
        step: 0.5,
      },
    },
    defaultProps: {
      quote: "This made our work simpler and faster.",
      name: "Customer name",
      role: "Role or company",
      avatarSrc: "",
      rating: 5,
    },
    render: (props: TestimonialProps) => {
      const { quote, name, role, avatarSrc = "", rating = 0 } = props;
      const safeAvatar = sanitizeMediaUrl(avatarSrc);

      return (
        <figure className="bg-card border-border rounded-[var(--radius-lg)] border p-[var(--spacing-md)]">
          {rating > 0 ? (
            <div className="mb-3">
              <StarsDisplay rating={rating} size="sm" />
            </div>
          ) : null}
          {quote ? (
            <blockquote className="text-foreground leading-7">
              “{quote}”
            </blockquote>
          ) : null}
          <figcaption className="mt-5 flex items-center gap-3">
            <div className="bg-muted text-muted-foreground size-10 shrink-0 overflow-hidden rounded-full">
              {safeAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={safeAvatar}
                  alt={name ?? ""}
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <User className="size-1/2" />
                </div>
              )}
            </div>
            <div>
              {name ? (
                <p className="text-foreground text-sm font-semibold">{name}</p>
              ) : null}
              {role ? (
                <p className="text-muted-foreground text-sm">{role}</p>
              ) : null}
            </div>
          </figcaption>
        </figure>
      );
    },
  },
};
