"use client";

import { CheckIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { presetAvatars, presetAvatarSrc } from "@/lib/auth/avatars";
import type { SessionUser } from "@/lib/auth/types";

type Props = {
  user: SessionUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function initials(name: string, email: string) {
  const source = name.trim() || email;

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function EditProfileDialog({ user, open, onOpenChange }: Props) {
  const t = useTranslations("common.auth.profile");
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [image, setImage] = useState(user.image ?? null);
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const isDirty = name.trim() !== user.name || image !== (user.image ?? null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setName(user.name);
      setImage(user.image ?? null);
      setStatus("idle");
    }
    onOpenChange(nextOpen);
  }

  function handleSave() {
    setStatus("idle");
    startSaveTransition(async () => {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image,
      });

      if (error) {
        setStatus("error");
        return;
      }

      router.refresh();
      onOpenChange(false);
    });
  }

  function handleDeleteClick() {
    onOpenChange(false);
    setDeleteConfirmOpen(true);
  }

  function handleDeleteAccount() {
    startDeleteTransition(async () => {
      const { error } = await authClient.deleteUser();

      if (error) {
        setStatus("error");
        return;
      }

      router.replace(`/${locale}/auth`);
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="profile-name">{t("nameLabel")}</Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t("namePlaceholder")}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>{t("avatarLabel")}</Label>
              <div className="flex flex-wrap items-center gap-2">
                {user.defaultImage ? (
                  <Button
                    type="button"
                    variant="ghost"
                    title={t("resetToDefaultAvatar")}
                    aria-label={t("resetToDefaultAvatar")}
                    aria-pressed={image === user.defaultImage}
                    onClick={() => setImage(user.defaultImage ?? null)}
                    className="relative size-10 rounded-full p-0 ring-2 ring-transparent ring-offset-2 ring-offset-background aria-pressed:ring-primary"
                  >
                    <Avatar className="size-10">
                      <AvatarImage src={user.defaultImage} alt={user.name} />
                    </Avatar>
                    {image === user.defaultImage ? (
                      <CheckIcon className="absolute size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    ) : null}
                  </Button>
                ) : null}

                <Button
                  type="button"
                  variant="ghost"
                  title={t("removeAvatar")}
                  aria-label={t("removeAvatar")}
                  aria-pressed={image === null}
                  onClick={() => setImage(null)}
                  className="relative size-10 rounded-full p-0 ring-2 ring-transparent ring-offset-2 ring-offset-background aria-pressed:ring-primary"
                >
                  <Avatar className="size-10">
                    <AvatarFallback className="text-xs">
                      {initials(name, user.email)}
                    </AvatarFallback>
                  </Avatar>
                  {image === null ? (
                    <CheckIcon className="absolute size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                  ) : null}
                </Button>

                {presetAvatars.map((preset) => {
                  const src = presetAvatarSrc(preset);
                  const isSelected = image === src;

                  return (
                    <Button
                      key={preset}
                      type="button"
                      variant="ghost"
                      aria-label={preset}
                      aria-pressed={isSelected}
                      onClick={() => setImage(src)}
                      className="relative size-10 rounded-full p-0 ring-2 ring-transparent ring-offset-2 ring-offset-background aria-pressed:ring-primary"
                    >
                      <Avatar className="size-10">
                        <AvatarImage src={src} alt={preset} />
                      </Avatar>
                      {isSelected ? (
                        <CheckIcon className="absolute size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                      ) : null}
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-2 rounded-lg border border-destructive/30 p-3">
              <p className="text-sm font-medium text-destructive">
                {t("dangerZone")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("deleteAccountDescription")}
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-fit"
                onClick={handleDeleteClick}
              >
                {t("deleteAccount")}
              </Button>
            </div>

            {status === "error" ? (
              <p className="text-sm text-destructive">{t("saveError")}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              {t("cancel")}
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !isDirty}>
              {isSaving ? t("saving") : t("save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteAccountConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteAccountConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {t("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={handleDeleteAccount}
            >
              {isDeleting ? t("deleting") : t("deleteAccountConfirmAction")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
