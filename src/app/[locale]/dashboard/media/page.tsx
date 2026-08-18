import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { MediaLibraryView } from "@/features/media/components/media-library-view";
import { listMedia } from "@/features/media/queries";
import { requireUser } from "@/lib/auth/session";
import { resolveLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = await getTranslations({ locale, namespace: "media" });

  return { title: t("title") };
}

export default async function MediaLibraryRoute({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  setRequestLocale(locale);

  const user = await requireUser(locale);
  const assets = await listMedia();

  return (
    <MediaLibraryView
      assets={assets}
      currentUserId={user.id}
      isAdmin={user.role === "admin"}
    />
  );
}
