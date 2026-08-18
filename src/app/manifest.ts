import type { MetadataRoute } from "next";

import { defaultLocale } from "@/i18n/config";
import { getSiteSettings } from "@/lib/site-settings/store";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { metadata } = await getSiteSettings();
  const name = metadata.title[defaultLocale]?.trim() || "Next.js Starterkit";
  const description =
    metadata.description[defaultLocale]?.trim() ||
    "A localized Next.js starterkit.";

  return {
    name,
    short_name: name,
    description,
    start_url: `/${defaultLocale}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
