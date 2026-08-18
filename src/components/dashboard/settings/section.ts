import type {
  SiteSettings,
  SiteSettingsSection,
} from "@/lib/site-settings/schema";

export type SettingsSectionProps<K extends SiteSettingsSection> = {
  value: SiteSettings[K];
  onChange: (patch: Partial<SiteSettings[K]>) => void;
};
