import "server-only";

import { prisma } from "@/lib/prisma";

import type { MediaAssetDto } from "./shared";

export const mediaAssetSelect = {
  id: true,
  shortId: true,
  filename: true,
  mimeType: true,
  size: true,
  publicUrl: true,
  alt: true,
  caption: true,
  description: true,
  credit: true,
  createdAt: true,
  uploadedById: true,
  uploadedBy: { select: { name: true, email: true } },
} as const;

type MediaAssetRow = {
  id: string;
  shortId: string;
  filename: string;
  mimeType: string;
  size: number;
  publicUrl: string;
  alt: string;
  caption: string;
  description: string;
  credit: string;
  createdAt: Date;
  uploadedById: string | null;
  uploadedBy: { name: string | null; email: string | null } | null;
};

export function toMediaAssetDto(asset: MediaAssetRow): MediaAssetDto {
  return {
    id: asset.id,
    shortId: asset.shortId,
    filename: asset.filename,
    mimeType: asset.mimeType,
    size: asset.size,
    publicUrl: asset.publicUrl,
    alt: asset.alt,
    caption: asset.caption,
    description: asset.description,
    credit: asset.credit,
    createdAt: asset.createdAt.toISOString(),
    uploadedById: asset.uploadedById,
    uploadedBy: asset.uploadedBy,
  };
}

export async function listMedia(): Promise<MediaAssetDto[]> {
  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: mediaAssetSelect,
  });

  return assets.map(toMediaAssetDto);
}

export async function getMediaFile(id: string): Promise<MediaAssetDto | null> {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    select: mediaAssetSelect,
  });

  return asset ? toMediaAssetDto(asset) : null;
}

export async function getMediaUsage(userId?: string): Promise<number> {
  const usage = await prisma.mediaAsset.aggregate({
    ...(userId ? { where: { uploadedById: userId } } : {}),
    _sum: { size: true },
  });

  return usage._sum.size ?? 0;
}
