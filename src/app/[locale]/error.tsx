"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export default function LocaleError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations("common.errors");

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
      <p className="text-muted-foreground max-w-prose">{t("description")}</p>
      <Button onClick={() => reset()}>{t("retry")}</Button>
    </div>
  );
}
