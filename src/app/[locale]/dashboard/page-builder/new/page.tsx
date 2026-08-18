import { setRequestLocale } from "next-intl/server";

import { PageCreateView } from "@/features/page-builder/components/page-create-view";
import { requireUser } from "@/lib/auth/session";
import { resolveLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

export default async function NewPageRoute({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  setRequestLocale(locale);
  await requireUser(locale);

  return <PageCreateView />;
}
