import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";

import {
  defaultSiteSettings,
  mergeSiteSettings,
  parseSiteSettings,
  type SiteSettings,
  type SiteSettingsPatch,
} from "./schema";

const settingsId = "global";

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const row = await prisma.settings.findUnique({ where: { id: settingsId } });

    return row ? parseSiteSettings(row) : defaultSiteSettings;
  } catch {
    return defaultSiteSettings;
  }
});

export async function updateSiteSettings(
  patch: SiteSettingsPatch,
): Promise<void> {
  const current = await getSiteSettings();
  const next = mergeSiteSettings(current, patch);
  const row = {
    themeSettings: next.theme,
    loadingSettings: next.loading,
    metadataSettings: next.metadata,
    dateTimeSettings: next.dateTime,
    localeSettings: next.locale,
    consentSettings: next.consent,
    mediaSettings: next.media,
  };

  await prisma.settings.upsert({
    where: { id: settingsId },
    create: { id: settingsId, ...row },
    update: row,
  });
}
