import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/session";
import { resolveLocale } from "@/i18n/locale";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = await getTranslations({ locale, namespace: "common.auth" });

  return { title: t("signIn") };
}

export default async function AuthPage({ params }: Props) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  setRequestLocale(locale);

  const user = await getSessionUser();

  if (user) {
    redirect(`/${locale}/dashboard`);
  }

  const t = await getTranslations("common.auth");

  return (
    <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("signIn")}</CardTitle>
          <CardDescription>{t("signInDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignInButton callbackURL={`/${locale}/dashboard`} />
        </CardContent>
      </Card>
    </div>
  );
}
