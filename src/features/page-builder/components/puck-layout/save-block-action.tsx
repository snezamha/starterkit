"use client";

import { useContext, useState, useTransition } from "react";
import { ActionBar } from "@puckeditor/core";
import { useTranslations } from "next-intl";
import { Bookmark, Loader2 } from "lucide-react";

import { createSavedBlock } from "@/features/page-builder/actions";
import { ROOT_ZONE } from "@/features/page-builder/puck/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toastManager } from "@/lib/toast-manager";

import { PuckEditorContext, usePuckSelector } from "./context";

export function SaveBlockAction() {
  const t = useTranslations("pageBuilder.builder");
  const ctx = useContext(PuckEditorContext);
  const selected = usePuckSelector((s) => s.appState.ui.itemSelector);
  const content = usePuckSelector((s) => s.appState.data.content);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!ctx || !selected || selected.zone !== ROOT_ZONE) return null;
  const component = content[selected.index];
  if (!component) return null;

  function handleSave() {
    startTransition(async () => {
      try {
        await createSavedBlock(name, component);
        setOpen(false);
        setName("");
        toastManager.add({
          title: t("blockSaved"),
          type: "success",
          timeout: 3000,
        });
      } catch {
        toastManager.add({
          title: t("blockSaveFailed"),
          type: "error",
          timeout: 5000,
        });
      }
    });
  }

  return (
    <>
      <ActionBar.Action label={t("saveAsBlock")} onClick={() => setOpen(true)}>
        <Bookmark size={16} />
      </ActionBar.Action>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("saveAsBlockTitle")}</DialogTitle>
          </DialogHeader>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("blockNamePlaceholder")}
            autoFocus
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              {t("cancel")}
            </Button>
            <Button
              type="button"
              disabled={!name.trim() || isPending}
              onClick={handleSave}
            >
              {isPending ? (
                <Loader2 className="animate-spin" size={16} />
              ) : null}
              {t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
