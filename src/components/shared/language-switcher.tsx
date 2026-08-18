"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { locales, type Locale } from "@/i18n/config";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  fa: "🇮🇷",
  de: "🇩🇪",
};

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function changeLocale(nextLocale: Locale) {
    setIsOpen(false);
    if (nextLocale !== locale) {
      router.replace(pathname, { locale: nextLocale });
    }
  }

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        aria-label={t("language")}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex h-8 w-fit items-center gap-1.5 rounded-lg border bg-background ps-2 pe-2 text-sm outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <span className="flex size-5 shrink-0 items-center justify-center text-sm">
          {localeFlags[locale]}
        </span>
        <span className="hidden min-w-0 flex-1 truncate text-start sm:block">
          {t(`locale.${locale}`)}
        </span>
        <ChevronDownIcon
          aria-hidden
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            isOpen ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {isOpen ? (
        <div
          role="listbox"
          aria-label={t("language")}
          className="absolute end-0 top-full z-50 mt-2 grid min-w-40 gap-1 rounded-xl border bg-background p-1 shadow-lg"
        >
          {locales.map((item) => {
            const isSelected = item === locale;

            return (
              <button
                key={item}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => changeLocale(item)}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-lg px-2 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  isSelected ? "bg-muted text-foreground" : "hover:bg-muted",
                )}
              >
                <span className="flex size-5 shrink-0 items-center justify-center text-sm">
                  {localeFlags[item]}
                </span>
                <span className="min-w-0 flex-1 truncate text-start">
                  {t(`locale.${item}`)}
                </span>
                {isSelected ? (
                  <CheckIcon className="size-4 shrink-0 text-primary" />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
