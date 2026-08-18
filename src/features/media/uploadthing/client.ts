import { generateReactHelpers } from "@uploadthing/react";

import type { MediaFileRouter } from "./core";

export const { useUploadThing } = generateReactHelpers<MediaFileRouter>();
