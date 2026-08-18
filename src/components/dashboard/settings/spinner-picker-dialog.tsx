"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { LoadingSpinner } from "@/components/loading/loading-spinner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getLoadingSpinnerPath,
  loadingSpinnerCatalog,
  type LoadingSpinnerGroup,
  type LoadingSpinnerId,
} from "@/lib/loading/spinners";
import type { LoadingColorMode } from "@/lib/site-settings/loading";
import { cn } from "@/lib/utils";

const groups: LoadingSpinnerGroup[] = [
  "rings",
  "dots",
  "bars",
  "blocks",
  "pulses",
  "other",
];

type Props = {
  spinner: LoadingSpinnerId;
  colorMode: LoadingColorMode;
  color: string;
  onSelect: (spinner: LoadingSpinnerId) => void;
};

export function SpinnerPickerDialog({
  spinner,
  colorMode,
  color,
  onSelect,
}: Props) {
  const t = useTranslations("dashboard.settings");
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="w-full" />}>
        <LoadingSpinner
          spinner={spinner}
          colorMode={colorMode}
          color={color}
          size={20}
        />
        {t("loading.chooseSpinner")}
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(720px,calc(100dvh-2rem))] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("loading.spinnerModalTitle")}</DialogTitle>
          <DialogDescription>
            {t("loading.spinnerModalDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 space-y-4 overflow-y-auto pe-1">
          {groups.map((group) => {
            const items = loadingSpinnerCatalog.filter(
              (item) => item.group === group,
            );

            if (items.length === 0) {
              return null;
            }

            return (
              <div key={group} className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium uppercase">
                  {t(`loading.groups.${group}`)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-label={t("loading.selectSpinner", {
                        spinner: item.id,
                      })}
                      aria-pressed={spinner === item.id}
                      onClick={() => {
                        onSelect(item.id as LoadingSpinnerId);
                        setOpen(false);
                      }}
                      className={cn(
                        "border-border bg-background hover:bg-muted/50 grid size-9 place-items-center rounded-lg border transition-colors",
                        spinner === item.id &&
                          "border-primary ring-primary/30 ring-2",
                      )}
                    >
                      <Image
                        src={getLoadingSpinnerPath(item.id)}
                        alt=""
                        width={24}
                        height={24}
                        className="size-6 dark:invert"
                      />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
