"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import { updateSiteSettings } from "@/lib/site-settings/store";
import type { SiteSettingsPatch } from "@/lib/site-settings/schema";

export async function saveSiteSettings(patch: SiteSettingsPatch) {
  const user = await getSessionUser();

  if (user?.role !== "admin") {
    throw new Error("Unauthorized");
  }

  await updateSiteSettings(patch);

  revalidatePath("/[locale]/dashboard/settings", "page");
}
