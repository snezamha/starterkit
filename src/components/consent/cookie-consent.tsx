"use client";

import { ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { useConsent } from "@/components/providers/consent-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { consentCategories, type ConsentCategory } from "@/lib/consent/cookie";
import type {
  ConsentPosition,
  ConsentTexts,
} from "@/lib/site-settings/consent";
import { cn } from "@/lib/utils";

import {
  consentPositionClasses,
  consentReopenPositionClasses,
} from "./position";

type Props = {
  texts: ConsentTexts;
  policyUrl: string;
  position: ConsentPosition;
  showReopenButton: boolean;
  categories: Record<ConsentCategory, boolean>;
};

const POLICY_PLACEHOLDER = "{policy}";

const categoryTextFields = {
  statistics: ["statisticsTitle", "statisticsDescription"],
  marketing: ["marketingTitle", "marketingDescription"],
} as const;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function ConsentDescription({
  text,
  policyUrl,
  policyLabel,
}: {
  text: string;
  policyUrl: string;
  policyLabel: string;
}) {
  const link = policyUrl ? (
    <a
      href={policyUrl}
      className="text-primary font-medium underline-offset-4 hover:underline"
      {...(policyUrl.startsWith("http") && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
    >
      {policyLabel}
    </a>
  ) : null;

  if (text.includes(POLICY_PLACEHOLDER)) {
    const [before, ...rest] = text.split(POLICY_PLACEHOLDER);

    return (
      <>
        {before}
        {link ?? policyLabel}
        {rest.join(POLICY_PLACEHOLDER)}
      </>
    );
  }

  return (
    <>
      {text}
      {link && <> {link}.</>}
    </>
  );
}

export function CookieConsent({
  texts,
  policyUrl,
  position,
  showReopenButton,
  categories,
}: Props) {
  const t = useTranslations("common.consent");
  const { bannerOpen, answered, value, openBanner, save } = useConsent();
  const [customizing, setCustomizing] = useState(false);
  const [edits, setEdits] = useState<Partial<
    Record<ConsentCategory, boolean>
  > | null>(null);
  const [wasOpen, setWasOpen] = useState(bannerOpen);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCategories = consentCategories.filter(
    (category) => categories[category],
  );
  const isModal = position === "center";

  if (wasOpen !== bannerOpen) {
    setWasOpen(bannerOpen);
    setEdits(null);
    setCustomizing(false);
  }

  const draft = Object.fromEntries(
    consentCategories.map((category) => [
      category,
      edits?.[category] ?? value?.categories[category] ?? false,
    ]),
  ) as Record<ConsentCategory, boolean>;

  function grant(granted: boolean) {
    save(
      Object.fromEntries(
        consentCategories.map((category) => [
          category,
          granted && categories[category],
        ]),
      ) as Record<ConsentCategory, boolean>,
    );
  }

  useEffect(() => {
    if (!bannerOpen) return;

    containerRef.current?.focus();
  }, [bannerOpen]);

  useEffect(() => {
    if (!bannerOpen || !isModal) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [bannerOpen, isModal]);

  if (!bannerOpen) {
    if (!answered || !showReopenButton) return null;

    return (
      <button
        type="button"
        onClick={openBanner}
        aria-label={t("reopen")}
        title={t("reopen")}
        className={cn(
          "bg-background text-foreground hover:bg-accent focus-visible:ring-ring/50 fixed z-50 flex size-10 items-center justify-center rounded-full border shadow-lg transition-colors focus-visible:ring-[3px] focus-visible:outline-none",
          consentReopenPositionClasses[position],
        )}
      >
        <ShieldCheck className="size-4" aria-hidden />
      </button>
    );
  }

  return (
    <>
      {isModal && (
        <div className="fixed inset-0 z-50 bg-black/50" aria-hidden />
      )}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal={isModal}
        aria-labelledby="cookie-consent-title"
        tabIndex={-1}
        className={cn(
          "bg-background fixed z-50 w-[calc(100%-2rem)] max-w-2xl rounded-xl border p-6 shadow-lg focus:outline-none",
          consentPositionClasses[position],
        )}
      >
        <h2 id="cookie-consent-title" className="text-base font-semibold">
          {texts.title}
        </h2>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          <ConsentDescription
            text={texts.description}
            policyUrl={policyUrl}
            policyLabel={texts.policyLabel}
          />
        </p>

        {customizing && (
          <div className="mt-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">{texts.necessaryTitle}</p>
                <p className="text-muted-foreground text-xs">
                  {texts.necessaryDescription}
                </p>
              </div>
              <Switch checked disabled aria-label={texts.necessaryTitle} />
            </div>
            {activeCategories.map((category) => {
              const [titleField, descriptionField] =
                categoryTextFields[category];

              return (
                <div
                  key={category}
                  className="flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{texts[titleField]}</p>
                    <p className="text-muted-foreground text-xs">
                      {texts[descriptionField]}
                    </p>
                  </div>
                  <Switch
                    checked={draft[category]}
                    aria-label={texts[titleField]}
                    onCheckedChange={(checked) =>
                      setEdits((prev) => ({ ...prev, [category]: checked }))
                    }
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          {activeCategories.length > 0 && (
            <>
              {customizing ? (
                <Button
                  variant="outline"
                  className="sm:flex-1"
                  onClick={() => save(draft)}
                >
                  {texts.saveLabel}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="sm:flex-1"
                  onClick={() => setCustomizing(true)}
                >
                  {texts.customizeLabel}
                </Button>
              )}
              <Button
                variant="outline"
                className="sm:flex-1"
                onClick={() => grant(false)}
              >
                {texts.necessaryLabel}
              </Button>
            </>
          )}
          <Button className="sm:flex-1" onClick={() => grant(true)}>
            {texts.acceptLabel}
          </Button>
        </div>
      </div>
    </>
  );
}
