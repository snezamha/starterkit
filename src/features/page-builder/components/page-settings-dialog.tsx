"use client";

import { Loader2, Save, Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updatePage } from "@/features/page-builder/actions";
import {
  LocalePageCard,
  PageDetailsCard,
  TranslationWarningPanel,
} from "@/features/page-builder/components/page-editor-sections";
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
import { getInitialPageForm } from "@/features/page-builder/page-editor-model";
import type {
  PageFormData,
  PageRecord,
  PageTranslation,
} from "@/features/page-builder/types";
import type { Locale } from "@/i18n/config";
import { getActionErrorMessage } from "@/lib/errors/action-error";
import { toastManager } from "@/lib/toast-manager";
import { useSiteDateTimeFormat } from "@/components/providers/datetime-format-provider";

type Props = {
  content: PageRecord;
  homepagePageId?: string | null;
  onSaved: (content: PageRecord) => void;
};

export function PageSettingsDialog({
  content,
  homepagePageId = null,
  onSaved,
}: Props) {
  const t = useTranslations("pageBuilder");
  const { preferences } = useSiteDateTimeFormat();
  const [open, setOpen] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<PageFormData>(() =>
    getInitialPageForm(
      content,
      content.isHomepage ? content.id : null,
      preferences.timezone,
    ),
  );
  const [savedForm, setSavedForm] = useState<PageFormData>(() =>
    getInitialPageForm(
      content,
      content.isHomepage ? content.id : null,
      preferences.timezone,
    ),
  );
  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(savedForm),
    [form, savedForm],
  );

  function setField<K extends Exclude<keyof PageFormData, "translations">>(
    key: K,
    value: PageFormData[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function setTranslationField(
    locale: Locale,
    field: keyof PageTranslation,
    value: PageTranslation[keyof PageTranslation],
  ) {
    setForm((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [locale]: { ...current.translations[locale], [field]: value },
      },
    }));
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const saved = await updatePage(content.id, form);
        const nextForm = getInitialPageForm(
          saved,
          saved.isHomepage ? saved.id : null,
          preferences.timezone,
        );
        setForm(nextForm);
        setSavedForm(nextForm);
        onSaved(saved);
        setOpen(false);
        toastManager.add({
          title: t("saved"),
          type: "success",
          timeout: 3000,
        });
      } catch (error) {
        toastManager.add({
          title: getActionErrorMessage(error, t("error"), {
            homepageAlreadySet: t("form.homepageAlreadySet"),
          }),
          type: "error",
          timeout: 5000,
        });
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isDirty) {
          setConfirmClose(true);
          return;
        }
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm" className="gap-2">
            <Settings className="size-4" />
            <span className="hidden xl:inline">
              {t("actions.pageSettings")}
            </span>
          </Button>
        }
      />
      <DialogContent className="flex max-h-[92dvh] flex-col p-0 sm:max-w-3xl lg:max-w-4xl">
        <DialogHeader className="shrink-0 border-b px-4 py-4 pe-12 sm:px-5">
          <DialogTitle>{t("actions.pageSettings")}</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-3 py-4 sm:space-y-5 sm:px-5">
          <TranslationWarningPanel form={form} />
          <LocalePageCard
            form={form}
            setField={setField}
            setTranslationField={setTranslationField}
            onSlugTouched={() => undefined}
          />
          <PageDetailsCard
            form={form}
            setField={setField}
            homepagePageId={homepagePageId}
            currentPageId={content.id}
          />
        </div>
        <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t px-4 py-4 sm:px-5">
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={isPending || !isDirty}
            onClick={handleSave}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {t("actions.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
      <AlertDialog open={confirmClose} onOpenChange={setConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("actions.confirmLeaveTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("actions.confirmLeave")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("actions.stayOnPage")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setForm(savedForm);
                setConfirmClose(false);
                setOpen(false);
              }}
            >
              {t("actions.leaveAnyway")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
