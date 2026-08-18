"use client";

import { ArrowLeft, Check, Copy, Loader2, Save } from "lucide-react";
import { SpinnerSection } from "@/components/loading/spinner-section";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PuckEditorPanel } from "@/features/page-builder/components/puck-editor-panel";
import { useMobileViewport } from "@/features/page-builder/components/use-mobile-viewport";
import { Link } from "@/i18n/navigation";

import { Button } from "@/components/ui/button";
import { LocaleTabs } from "@/components/shared/locale-tabs";
import { defaultLocale, getDirection, type Locale } from "@/i18n/config";
import type { PageRecord } from "@/features/page-builder/types";
import { getActionErrorMessage } from "@/lib/errors/action-error";
import {
  hasPuckContent,
  normalizePuckDataWithTitle,
} from "@/features/page-builder/puck/data";
import type { PuckData } from "@/features/page-builder/puck/config";
import { toastManager } from "@/lib/toast-manager";
import { parseThemeData, type PageTheme } from "@/features/page-builder/theme";

import { updatePageBuilderData } from "@/features/page-builder/actions";
import { useUnsavedChanges } from "@/features/page-builder/components/use-unsaved-changes";
import { PageSettingsDialog } from "@/features/page-builder/components/page-settings-dialog";
import { PuckThemeEditor } from "@/features/page-builder/components/puck-theme-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AUTOSAVE_DELAY = 1500;
const AUTOSAVE_RETRY_DELAY = 8000;
const AUTOSAVE_MAX_RETRIES = 3;

type Props = {
  basePath?: string;
  content: PageRecord;
  homepagePageId?: string | null;
};

function getBuilderState(content: PageRecord): Record<Locale, PuckData> {
  return {
    en: normalizePuckDataWithTitle(
      content.translations.en.builderData,
      content.translations.en.title,
    ),
    fa: normalizePuckDataWithTitle(
      content.translations.fa.builderData,
      content.translations.fa.title,
    ),
    de: normalizePuckDataWithTitle(
      content.translations.de.builderData,
      content.translations.de.title,
    ),
  };
}

export function PageBuilderView({
  basePath = "/dashboard/page-builder",
  content,
  homepagePageId = null,
}: Props) {
  const t = useTranslations("pageBuilder");
  const interfaceLocale = useLocale() as Locale;
  const [pageRecord, setPageRecord] = useState(content);
  const [saveState, setSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [builderState, setBuilderState] = useState(() =>
    getBuilderState(content),
  );
  const [savedBuilderState, setSavedBuilderState] = useState(() =>
    getBuilderState(content),
  );
  const [theme, setTheme] = useState<PageTheme>(() =>
    parseThemeData(content.themeData),
  );
  const [savedTheme, setSavedTheme] = useState<PageTheme>(() =>
    parseThemeData(content.themeData),
  );
  const [activeLocale, setActiveLocale] = useState<Locale>(defaultLocale);
  const [isLocaleLoading, setIsLocaleLoading] = useState(true);
  const [puckToolbarRightDesktopSlot, setPuckToolbarRightDesktopSlot] =
    useState<HTMLDivElement | null>(null);
  const [puckToolbarRightMobileSlot, setPuckToolbarRightMobileSlot] =
    useState<HTMLDivElement | null>(null);
  const isMobile = useMobileViewport();
  const puckToolbarRightSlot = isMobile
    ? puckToolbarRightMobileSlot
    : puckToolbarRightDesktopSlot;
  const activePageTitle = pageRecord.translations[activeLocale].title;
  const isDirty = useMemo(
    () =>
      JSON.stringify(builderState) !== JSON.stringify(savedBuilderState) ||
      JSON.stringify(theme) !== JSON.stringify(savedTheme),
    [builderState, savedBuilderState, theme, savedTheme],
  );

  const [confirmCopyOpen, setConfirmCopyOpen] = useState(false);
  const autosaveRetriesRef = useRef(0);
  const unsavedChangesDialog = useUnsavedChanges(
    isDirty && saveState === "error",
  );

  function setLocaleBuilderData(locale: Locale, data: PuckData) {
    if (saveState !== "saving") setSaveState("idle");
    autosaveRetriesRef.current = 0;
    setBuilderState((current) => ({
      ...current,
      [locale]: data,
    }));
  }

  const saveChanges = useCallback(
    async (showToast = false) => {
      if (!isDirty || saveState === "saving") return;

      const submittedState = builderState;
      const submittedTheme = theme;
      setSaveState("saving");
      try {
        await updatePageBuilderData(
          pageRecord.id,
          {
            en: hasPuckContent(submittedState.en) ? submittedState.en : null,
            fa: hasPuckContent(submittedState.fa) ? submittedState.fa : null,
            de: hasPuckContent(submittedState.de) ? submittedState.de : null,
          },
          submittedTheme,
        );
        setSavedBuilderState(submittedState);
        setSavedTheme(submittedTheme);
        setSaveState("saved");
        autosaveRetriesRef.current = 0;
        if (showToast) {
          toastManager.add({
            title: t("saved"),
            type: "success",
            timeout: 3000,
          });
        }
      } catch (error) {
        setSaveState("error");
        const retriesLeft = AUTOSAVE_MAX_RETRIES - autosaveRetriesRef.current;
        if (showToast || retriesLeft <= 0) {
          toastManager.add({
            title: getActionErrorMessage(error, t("error")),
            type: "error",
            timeout: 5000,
          });
        }
      }
    },
    [builderState, isDirty, pageRecord.id, saveState, t, theme],
  );

  useEffect(() => {
    if (!isDirty || saveState === "saving") return;
    if (
      saveState === "error" &&
      autosaveRetriesRef.current >= AUTOSAVE_MAX_RETRIES
    ) {
      return;
    }
    const isRetry = saveState === "error";
    const timeout = window.setTimeout(
      () => {
        if (isRetry) autosaveRetriesRef.current += 1;
        void saveChanges();
      },
      isRetry ? AUTOSAVE_RETRY_DELAY : AUTOSAVE_DELAY,
    );
    return () => window.clearTimeout(timeout);
  }, [isDirty, saveChanges, saveState]);

  function handleThemeChange(nextTheme: PageTheme) {
    if (saveState !== "saving") setSaveState("idle");
    autosaveRetriesRef.current = 0;
    setTheme(nextTheme);
  }

  function applyEnglishLayout() {
    setLocaleBuilderData(
      activeLocale,
      normalizePuckDataWithTitle(
        structuredClone(builderState.en),
        activePageTitle,
      ),
    );
  }

  function copyEnglishLayout() {
    if (hasPuckContent(builderState[activeLocale])) {
      setConfirmCopyOpen(true);
      return;
    }
    applyEnglishLayout();
  }

  return (
    <div
      data-fullbleed=""
      className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden"
    >
      <div className="border-border bg-background shrink-0 border-b px-3 py-2 md:px-4 md:py-3">
        <div
          dir="ltr"
          className="flex flex-col items-center gap-2 md:grid md:grid-cols-[minmax(0,1fr)_auto_auto] md:grid-rows-1 md:items-center md:gap-3"
        >
          <div className="flex w-full items-center justify-between gap-3 md:hidden">
            <p
              dir={getDirection(activeLocale)}
              className="min-w-0 flex-1 truncate text-left text-sm font-semibold"
            >
              {activePageTitle}
            </p>
            <div className="flex shrink-0 items-center justify-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                className="gap-2"
                render={<Link href={basePath} />}
              >
                <ArrowLeft
                  className={`size-4 shrink-0 ${getDirection(interfaceLocale) === "rtl" ? "rotate-180" : ""}`}
                />
                <span>{t("actions.backToList")}</span>
              </Button>
              <PuckThemeEditor theme={theme} onChange={handleThemeChange} />
              <PageSettingsDialog
                content={pageRecord}
                onSaved={setPageRecord}
              />
              <div
                ref={setPuckToolbarRightMobileSlot}
                className="flex shrink-0 items-center"
              />
              <Button
                size="sm"
                className="size-7 shrink-0 px-0"
                disabled={saveState === "saving" || !isDirty}
                onClick={() => void saveChanges(true)}
              >
                {saveState === "saving" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                <span className="sr-only">{t("actions.save")}</span>
              </Button>
            </div>
          </div>
          <div className="hidden min-w-0 md:col-span-1 md:block">
            <div className="min-w-0">
              <p
                dir={getDirection(activeLocale)}
                className="truncate text-left text-sm font-semibold"
              >
                {activePageTitle}
              </p>
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-1.5 md:col-start-3 md:flex md:justify-self-end">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              className="gap-2"
              render={<Link href={basePath} />}
            >
              <ArrowLeft
                className={`size-4 shrink-0 ${getDirection(interfaceLocale) === "rtl" ? "rotate-180" : ""}`}
              />
              <span className="hidden xl:inline">
                {t("actions.backToList")}
              </span>
              <span className="sr-only xl:hidden">
                {t("actions.backToList")}
              </span>
            </Button>
            <PuckThemeEditor theme={theme} onChange={handleThemeChange} />
            <PageSettingsDialog
              content={pageRecord}
              homepagePageId={homepagePageId}
              onSaved={setPageRecord}
            />
            <div
              ref={setPuckToolbarRightDesktopSlot}
              className="flex shrink-0 items-center"
            />
            <Button
              size="sm"
              className="shrink-0 gap-2 max-md:size-7 max-md:px-0"
              disabled={saveState === "saving" || !isDirty}
              onClick={() => void saveChanges(true)}
            >
              {saveState === "saving" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span className="hidden md:inline">{t("actions.save")}</span>
              <span className="sr-only md:hidden">{t("actions.save")}</span>
            </Button>
          </div>
          <LocaleTabs
            value={activeLocale}
            onValueChange={(value) => {
              setActiveLocale(value);
              setIsLocaleLoading(true);
            }}
            className="w-full justify-self-center md:col-span-1 md:col-start-2 md:row-start-1 md:w-auto md:justify-self-center"
            listClassName="grid h-8 w-full grid-cols-3 md:inline-flex md:w-auto"
            triggerRender={(locale, label) => {
              const translation = pageRecord.translations[locale];
              const complete =
                translation.enabled &&
                Boolean(translation.title.trim()) &&
                hasPuckContent(builderState[locale]);
              return (
                <div className="flex items-center gap-1.5 px-2 text-xs sm:px-3">
                  {label}
                  <span
                    aria-hidden="true"
                    className={
                      complete
                        ? "size-1.5 rounded-full bg-emerald-500"
                        : "size-1.5 rounded-full bg-amber-500"
                    }
                  />
                </div>
              );
            }}
          />
          <div className="flex items-center gap-1 md:col-start-2 md:row-start-2 md:justify-self-center">
            {activeLocale !== defaultLocale ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs"
                onClick={copyEnglishLayout}
              >
                <Copy className="size-3.5" />
                {t("pageBuilder.copyFromEnglish")}
              </Button>
            ) : null}
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              {saveState === "saving" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : !isDirty && saveState !== "error" ? (
                <Check className="size-3 text-emerald-500" />
              ) : null}
              {t(
                `pageBuilder.saveState.${!isDirty && saveState !== "error" ? "saved" : saveState === "saved" ? "idle" : saveState}`,
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <PuckEditorPanel
          fullScreen
          headerTitle={activePageTitle}
          toolbarRightSlot={puckToolbarRightSlot}
          data={builderState[activeLocale]}
          onChange={(data) => setLocaleBuilderData(activeLocale, data)}
          theme={theme}
          onReady={() => setIsLocaleLoading(false)}
          locale={activeLocale}
        />
        {isLocaleLoading && (
          <div className="bg-background absolute inset-0 z-50">
            <SpinnerSection className="h-full" />
          </div>
        )}
      </div>

      {unsavedChangesDialog}

      <AlertDialog open={confirmCopyOpen} onOpenChange={setConfirmCopyOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("pageBuilder.confirmCopyLayoutTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("pageBuilder.confirmCopyLayout")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("actions.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                applyEnglishLayout();
                setConfirmCopyOpen(false);
              }}
            >
              {t("pageBuilder.copyFromEnglish")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
