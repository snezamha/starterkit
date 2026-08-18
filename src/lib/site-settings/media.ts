export const MEDIA_STORAGE_QUOTA_GB_RANGE = {
  min: 1,
  max: 2,
} as const;

export const MEDIA_MAX_FILE_SIZE_MB_RANGE = {
  min: 1,
} as const;

export const MEDIA_STORAGE_PER_USER_MB_RANGE = {
  min: 10,
} as const;

export type MediaSettings = {
  storageQuotaGb: number;
  maxFileSizeMb: number;
  maxStoragePerUserMb: number;
};

export const defaultMediaSettings: MediaSettings = {
  storageQuotaGb: 2,
  maxFileSizeMb: 50,
  maxStoragePerUserMb: 512,
};

export function mediaQuotaMb(storageQuotaGb: number): number {
  return storageQuotaGb * 1024;
}

export function quotaBytes(settings: MediaSettings): number {
  return settings.storageQuotaGb * 1024 * 1024 * 1024;
}

export function maxFileBytes(settings: MediaSettings): number {
  return settings.maxFileSizeMb * 1024 * 1024;
}

export function perUserBytes(settings: MediaSettings): number {
  return settings.maxStoragePerUserMb * 1024 * 1024;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(Math.round(value), min), max);
}

export function parseMediaSettings(value: unknown): MediaSettings {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const quota = record.storageQuotaGb;
  const maxFile = record.maxFileSizeMb;
  const perUser = record.maxStoragePerUserMb;

  const storageQuotaGb =
    typeof quota === "number"
      ? clamp(
          quota,
          MEDIA_STORAGE_QUOTA_GB_RANGE.min,
          MEDIA_STORAGE_QUOTA_GB_RANGE.max,
        )
      : defaultMediaSettings.storageQuotaGb;
  const quotaMb = mediaQuotaMb(storageQuotaGb);

  return {
    storageQuotaGb,
    maxFileSizeMb:
      typeof maxFile === "number"
        ? clamp(maxFile, MEDIA_MAX_FILE_SIZE_MB_RANGE.min, quotaMb)
        : defaultMediaSettings.maxFileSizeMb,
    maxStoragePerUserMb:
      typeof perUser === "number"
        ? clamp(perUser, MEDIA_STORAGE_PER_USER_MB_RANGE.min, quotaMb)
        : defaultMediaSettings.maxStoragePerUserMb,
  };
}

export function sanitizeMediaSettings(
  data: Partial<MediaSettings>,
): Partial<MediaSettings> {
  const next: Partial<MediaSettings> = {};

  if (typeof data.storageQuotaGb === "number") {
    next.storageQuotaGb = clamp(
      data.storageQuotaGb,
      MEDIA_STORAGE_QUOTA_GB_RANGE.min,
      MEDIA_STORAGE_QUOTA_GB_RANGE.max,
    );
  }

  const quotaMb = mediaQuotaMb(
    next.storageQuotaGb ?? defaultMediaSettings.storageQuotaGb,
  );

  if (typeof data.maxFileSizeMb === "number") {
    next.maxFileSizeMb = clamp(
      data.maxFileSizeMb,
      MEDIA_MAX_FILE_SIZE_MB_RANGE.min,
      quotaMb,
    );
  }

  if (typeof data.maxStoragePerUserMb === "number") {
    next.maxStoragePerUserMb = clamp(
      data.maxStoragePerUserMb,
      MEDIA_STORAGE_PER_USER_MB_RANGE.min,
      quotaMb,
    );
  }

  return next;
}
