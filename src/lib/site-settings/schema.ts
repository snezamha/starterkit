import {
  defaultConsentSettings,
  parseConsentSettings,
  sanitizeConsentSettings,
  type ConsentSettings,
} from "./consent";
import {
  defaultDateTimeSettings,
  parseDateTimeSettings,
  sanitizeDateTimeSettings,
  type DateTimeSettings,
} from "./date-time";
import {
  defaultLoadingSettings,
  parseLoadingSettings,
  sanitizeLoadingSettings,
  type LoadingSettings,
} from "./loading";
import {
  defaultLocaleSettings,
  parseLocaleSettings,
  sanitizeLocaleSettings,
  type LocaleSettings,
} from "./locale";
import {
  defaultMediaSettings,
  parseMediaSettings,
  sanitizeMediaSettings,
  type MediaSettings,
} from "./media";
import {
  defaultMetadataSettings,
  parseMetadataSettings,
  sanitizeMetadataSettings,
  type MetadataSettings,
} from "./metadata";
import {
  defaultThemeSettings,
  parseThemeSettings,
  sanitizeThemeSettings,
  type ThemeSettings,
} from "./theme";

export type SiteSettings = {
  theme: ThemeSettings;
  loading: LoadingSettings;
  metadata: MetadataSettings;
  dateTime: DateTimeSettings;
  locale: LocaleSettings;
  consent: ConsentSettings;
  media: MediaSettings;
};

export type SiteSettingsSection = keyof SiteSettings;

export type SiteSettingsPatch = {
  [K in SiteSettingsSection]?: Partial<SiteSettings[K]>;
};

type SiteSettingsRow = {
  themeSettings: unknown;
  loadingSettings: unknown;
  metadataSettings: unknown;
  dateTimeSettings: unknown;
  localeSettings: unknown;
  consentSettings: unknown;
  mediaSettings: unknown;
};

export const defaultSiteSettings: SiteSettings = {
  theme: defaultThemeSettings,
  loading: defaultLoadingSettings,
  metadata: defaultMetadataSettings,
  dateTime: defaultDateTimeSettings,
  locale: defaultLocaleSettings,
  consent: defaultConsentSettings,
  media: defaultMediaSettings,
};

export function parseSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    theme: parseThemeSettings(row.themeSettings),
    loading: parseLoadingSettings(row.loadingSettings),
    metadata: parseMetadataSettings(row.metadataSettings),
    dateTime: parseDateTimeSettings(row.dateTimeSettings),
    locale: parseLocaleSettings(row.localeSettings),
    consent: parseConsentSettings(row.consentSettings),
    media: parseMediaSettings(row.mediaSettings),
  };
}

export function mergeSiteSettings(
  current: SiteSettings,
  patch: SiteSettingsPatch,
): SiteSettings {
  return {
    theme: { ...current.theme, ...sanitizeThemeSettings(patch.theme ?? {}) },
    loading: {
      ...current.loading,
      ...sanitizeLoadingSettings(patch.loading ?? {}),
    },
    metadata: {
      ...current.metadata,
      ...sanitizeMetadataSettings(patch.metadata ?? {}),
    },
    dateTime: {
      ...current.dateTime,
      ...sanitizeDateTimeSettings(patch.dateTime ?? {}),
    },
    locale: {
      ...current.locale,
      ...sanitizeLocaleSettings(patch.locale ?? {}),
    },
    consent: {
      ...current.consent,
      ...sanitizeConsentSettings(patch.consent ?? {}),
    },
    media: { ...current.media, ...sanitizeMediaSettings(patch.media ?? {}) },
  };
}
