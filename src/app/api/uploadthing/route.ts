import { createRouteHandler } from "uploadthing/next";

import { mediaFileRouter } from "@/features/media/uploadthing/core";

export const { GET, POST } = createRouteHandler({ router: mediaFileRouter });
