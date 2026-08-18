import type { CSSProperties } from "react";

import { sanitizeMediaUrl } from "@/features/page-builder/puck/safety";

import type { SectionStyleValue } from "./section-style";

export function applySectionStyle(
  sectionStyle: SectionStyleValue | undefined,
): CSSProperties {
  if (!sectionStyle) return {};
  const {
    backgroundColor,
    backgroundSize,
    backgroundPosition,
    paddingVertical,
    maxWidth,
  } = sectionStyle;
  const imageUrl = sanitizeMediaUrl(sectionStyle.backgroundImage ?? "");

  return {
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(imageUrl
      ? {
          backgroundImage: `url("${imageUrl}")`,
          backgroundSize: backgroundSize === "contain" ? "contain" : "cover",
          backgroundPosition:
            backgroundPosition === "top" || backgroundPosition === "bottom"
              ? backgroundPosition
              : "center",
          backgroundRepeat: "no-repeat",
        }
      : {}),
    ...(paddingVertical
      ? { paddingTop: paddingVertical, paddingBottom: paddingVertical }
      : {}),
    ...(maxWidth && maxWidth !== "none"
      ? { maxWidth, marginInline: "auto" }
      : {}),
  };
}
