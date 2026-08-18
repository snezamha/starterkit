import { nanoid } from "nanoid";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  maxFileBytes,
  perUserBytes,
  quotaBytes,
} from "@/lib/site-settings/media";
import { getSiteSettings } from "@/lib/site-settings/store";

import { isAcceptedMimeType } from "../shared";

const f = createUploadthing();

export const mediaFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: "1GB", maxFileCount: 10 },
    pdf: { maxFileSize: "1GB", maxFileCount: 10 },
  })
    .middleware(async ({ files }) => {
      const user = await getSessionUser();

      if (!user) {
        throw new UploadThingError("forbidden");
      }

      const settings = (await getSiteSettings()).media;
      const incomingBytes = files.reduce((total, file) => total + file.size, 0);

      for (const file of files) {
        if (!isAcceptedMimeType(file.type)) {
          throw new UploadThingError("unsupportedType");
        }

        if (file.size > maxFileBytes(settings)) {
          throw new UploadThingError("fileTooLarge");
        }
      }

      const [totalUsage, userUsage] = await Promise.all([
        prisma.mediaAsset.aggregate({ _sum: { size: true } }),
        prisma.mediaAsset.aggregate({
          where: { uploadedById: user.id },
          _sum: { size: true },
        }),
      ]);

      if ((totalUsage._sum.size ?? 0) + incomingBytes > quotaBytes(settings)) {
        throw new UploadThingError("quotaExceeded");
      }

      if ((userUsage._sum.size ?? 0) + incomingBytes > perUserBytes(settings)) {
        throw new UploadThingError("userQuotaExceeded");
      }

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const asset = await prisma.mediaAsset.create({
        data: {
          shortId: nanoid(12),
          uploadedById: metadata.userId,
          filename: file.name.slice(0, 255),
          mimeType: file.type,
          size: file.size,
          path: file.key,
          publicUrl: file.ufsUrl,
        },
        select: { id: true },
      });

      return { assetId: asset.id };
    }),
} satisfies FileRouter;

export type MediaFileRouter = typeof mediaFileRouter;
