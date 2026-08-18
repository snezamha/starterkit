"use client";

import { consentPositionClasses } from "@/components/consent/position";
import { getDirection, type Locale } from "@/i18n/config";
import type {
  ConsentSettings,
  ConsentTextField,
} from "@/lib/site-settings/consent";
import { cn } from "@/lib/utils";

type Props = {
  value: ConsentSettings;
  locale: Locale;
  resolve: (field: ConsentTextField, locale: Locale) => string;
};

export function ConsentPreview({ value, locale, resolve }: Props) {
  const showCustomize =
    value.categories.statistics || value.categories.marketing;

  return (
    <div className="bg-muted/40 relative h-64 overflow-hidden rounded-lg border">
      <div
        dir={getDirection(locale)}
        className={cn(
          "bg-background absolute w-[min(28rem,calc(100%-2rem))] rounded-xl border p-4 shadow-lg",
          consentPositionClasses[value.position],
        )}
      >
        <p className="text-sm font-semibold">{resolve("title", locale)}</p>
        <p className="text-muted-foreground mt-2 line-clamp-3 text-xs leading-relaxed">
          {resolve("description", locale).replace(
            "{policy}",
            resolve("policyLabel", locale),
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {showCustomize && (
            <>
              <span className="text-muted-foreground rounded-md px-2 py-1 text-[11px]">
                {resolve("customizeLabel", locale)}
              </span>
              <span className="rounded-md border px-2 py-1 text-[11px]">
                {resolve("necessaryLabel", locale)}
              </span>
            </>
          )}
          <span className="bg-primary text-primary-foreground rounded-md px-2 py-1 text-[11px]">
            {resolve("acceptLabel", locale)}
          </span>
        </div>
      </div>
    </div>
  );
}
