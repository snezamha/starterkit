import type { ConsentPosition } from "@/lib/site-settings/consent";

export const consentPositionClasses: Record<ConsentPosition, string> = {
  "top-start": "top-4 start-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-end": "top-4 end-4",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
  "bottom-start": "bottom-4 start-4",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  "bottom-end": "bottom-4 end-4",
};

export const consentReopenPositionClasses: Record<ConsentPosition, string> = {
  ...consentPositionClasses,
  center: "bottom-4 start-4",
};
