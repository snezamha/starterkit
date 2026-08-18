"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { perUserBytes, type MediaSettings } from "@/lib/site-settings/media";
import { getSiteSettings, updateSiteSettings } from "@/lib/site-settings/store";

import {
  getMediaUsage,
  listMedia,
  mediaAssetSelect,
  toMediaAssetDto,
} from "./queries";
import { deleteStoredFile, uploadStoredFile } from "./storage";
import type { MediaAssetDto } from "./shared";

type ActionResult = { ok: boolean; error?: string };

const metadataSchema = z.object({
  alt: z.string().max(300),
  caption: z.string().max(500),
  description: z.string().max(2000),
  credit: z.string().max(300),
});

function revalidateMedia() {
  revalidatePath("/[locale]/dashboard/media", "page");
  revalidatePath("/[locale]/dashboard/media/upload", "page");
  revalidatePath("/[locale]/dashboard/media/[mediaId]/edit", "page");
}

async function requireManageableAsset(assetId: string) {
  const user = await getSessionUser();

  if (!user) {
    return { user: null, asset: null, allowed: false as const };
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: assetId },
    select: { id: true, path: true, mimeType: true, uploadedById: true },
  });

  if (!asset) {
    return { user, asset: null, allowed: false as const };
  }

  return {
    user,
    asset,
    allowed: user.role === "admin" || asset.uploadedById === user.id,
  };
}

export async function getMediaAsset(
  assetId: string,
): Promise<MediaAssetDto | null> {
  const user = await getSessionUser();

  if (!user) {
    return null;
  }

  const asset = await prisma.mediaAsset.findUnique({
    where: { id: assetId },
    select: mediaAssetSelect,
  });

  return asset ? toMediaAssetDto(asset) : null;
}

export async function listMediaAssets(): Promise<MediaAssetDto[]> {
  const user = await getSessionUser();

  if (!user) {
    return [];
  }

  return listMedia();
}

export async function getMediaUploadLimit(): Promise<number> {
  const settings = await getSiteSettings();

  return settings.media.maxFileSizeMb;
}

export async function updateMediaMetadata(
  assetId: string,
  data: { alt: string; caption: string; description: string; credit: string },
): Promise<ActionResult> {
  const { asset, allowed } = await requireManageableAsset(assetId);

  if (!asset) return { ok: false, error: "notFound" };
  if (!allowed) return { ok: false, error: "forbidden" };

  const parsed = metadataSchema.safeParse(data);

  if (!parsed.success) {
    return { ok: false, error: "invalid" };
  }

  await prisma.mediaAsset.update({ where: { id: assetId }, data: parsed.data });
  revalidateMedia();

  return { ok: true };
}

export async function updateMediaImage(
  assetId: string,
  base64Data: string,
  mimeType: string,
): Promise<ActionResult & { publicUrl?: string }> {
  const { asset, allowed } = await requireManageableAsset(assetId);

  if (!asset) return { ok: false, error: "notFound" };
  if (!allowed) return { ok: false, error: "forbidden" };

  const record = await prisma.mediaAsset.findUnique({
    where: { id: assetId },
    select: { filename: true, size: true },
  });

  if (!record) return { ok: false, error: "notFound" };

  const buffer = Buffer.from(
    base64Data.replace(/^data:[^;]+;base64,/, ""),
    "base64",
  );

  try {
    const uploaded = await uploadStoredFile(
      record.filename,
      new Uint8Array(buffer),
      mimeType,
    );

    await prisma.mediaAsset.update({
      where: { id: assetId },
      data: {
        path: uploaded.key,
        publicUrl: uploaded.url,
        size: uploaded.size,
        mimeType,
      },
    });

    await deleteStoredFile(asset.path).catch(() => {});
    revalidateMedia();

    return { ok: true, publicUrl: uploaded.url };
  } catch {
    return { ok: false, error: "uploadFailed" };
  }
}

export async function deleteMedia(assetId: string): Promise<ActionResult> {
  const { asset, allowed } = await requireManageableAsset(assetId);

  if (!asset) return { ok: false, error: "notFound" };
  if (!allowed) return { ok: false, error: "forbidden" };

  await deleteStoredFile(asset.path).catch(() => {});
  await prisma.mediaAsset.delete({ where: { id: asset.id } });
  revalidateMedia();

  return { ok: true };
}

export async function saveMediaSettings(
  data: Partial<MediaSettings>,
): Promise<void> {
  const user = await getSessionUser();

  if (user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await updateSiteSettings({ media: data });
  revalidateMedia();
  revalidatePath("/[locale]/dashboard/media/settings", "page");
}

export async function getMediaUsageWidgetData(): Promise<{
  usedBytes: number;
  maxBytes: number;
  fileCount: number;
}> {
  const user = await getSessionUser();

  if (!user) {
    return { usedBytes: 0, maxBytes: 0, fileCount: 0 };
  }

  const [usedBytes, fileCount, settings] = await Promise.all([
    getMediaUsage(user.id),
    prisma.mediaAsset.count({ where: { uploadedById: user.id } }),
    getSiteSettings(),
  ]);

  return {
    usedBytes,
    maxBytes: perUserBytes(settings.media),
    fileCount,
  };
}
