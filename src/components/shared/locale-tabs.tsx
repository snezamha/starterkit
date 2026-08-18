"use client";

import { useTranslations } from "next-intl";

import { locales, type Locale } from "@/i18n/config";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  value?: Locale;
  onValueChange?: (value: Locale) => void;
  children?: (locale: Locale) => React.ReactNode;
  className?: string;
  listClassName?: string;
  contentClassName?: string;
  triggerRender?: (locale: Locale, label: string) => React.ReactNode;
};

export function LocaleTabs({
  value,
  onValueChange,
  children,
  className = "min-w-0 w-full",
  listClassName = "grid w-full min-w-0 grid-cols-3",
  contentClassName = "space-y-4",
  triggerRender,
}: Props) {
  const t = useTranslations("common.locale");

  return (
    <Tabs
      value={value}
      defaultValue={value === undefined ? locales[0] : undefined}
      onValueChange={(v) => onValueChange?.(v as Locale)}
      className={className}
    >
      <TabsList className={listClassName}>
        {locales.map((locale) => {
          const label = t(locale);
          return (
            <TabsTrigger key={locale} value={locale}>
              {triggerRender ? triggerRender(locale, label) : label}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {children
        ? locales.map((locale) => (
            <TabsContent
              key={locale}
              value={locale}
              className={contentClassName}
            >
              {children(locale)}
            </TabsContent>
          ))
        : null}
    </Tabs>
  );
}
