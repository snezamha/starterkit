const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
  "application/pdf",
] as const;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export function isAcceptedMimeType(mimeType: string): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export type MediaAssetDto = {
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
  createdAt: string;
  uploadedById: string | null;
  uploadedBy: { name: string | null; email: string | null } | null;
};

export type MediaUploadError =
  | "invalidFile"
  | "fileTooLarge"
  | "unsupportedType"
  | "quotaExceeded"
  | "userQuotaExceeded"
  | "forbidden"
  | "notFound"
  | "invalid"
  | "uploadFailed";
