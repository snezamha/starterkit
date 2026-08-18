import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";

import { DashboardShell } from "@/components/dashboard/layout/dashboard-shell";
import { DateTimeFormatProvider } from "@/components/providers/datetime-format-provider";
import type { Locale } from "@/i18n/config";
import { requireUser } from "@/lib/auth/session";
import { getSiteSettings } from "@/lib/site-settings/store";
import "@/styles/dashboard.css";
import { resolveLocale } from "@/i18n/locale";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function DashboardLayout({ children, params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  setRequestLocale(locale);
  const [user, settings] = await Promise.all([
    requireUser(locale),
    getSiteSettings(),
  ]);

  return (
    <DateTimeFormatProvider
      preferences={{ locale: locale as Locale, ...settings.dateTime }}
    >
      <DashboardShell user={user}>{children}</DashboardShell>
    </DateTimeFormatProvider>
  );
}
