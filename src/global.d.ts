import type common from "./messages/en/common.json";
import type dashboard from "./messages/en/dashboard.json";
import type media from "./messages/en/media.json";
import type pageBuilder from "./messages/en/pageBuilder.json";
import type { Locale } from "./i18n/config";

declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: {
      common: typeof common;
      dashboard: typeof dashboard;
      media: typeof media;
      pageBuilder: typeof pageBuilder;
    };
  }
}
