"use client";

import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import type { CustomFieldRender } from "@puckeditor/core";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaPickerDialog } from "@/features/media/components/media-picker-dialog";

export const MediaPickerField: CustomFieldRender<string> = ({
  value,
  onChange,
  readOnly,
}) => {
  const t = useTranslations("pageBuilder.builder");
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="space-y-2">
      {value ? (
        <div className="bg-muted relative aspect-video overflow-hidden rounded-md border">
          <div
            className="size-full bg-cover bg-center"
            style={{ backgroundImage: `url(${value})` }}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            className="absolute end-2 top-2"
            disabled={readOnly}
            onClick={() => onChange("")}
          >
            <X className="size-4" />
            <span className="sr-only">{t("removeMedia")}</span>
          </Button>
        </div>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={readOnly}
        onClick={() => setPickerOpen(true)}
      >
        <ImagePlus className="size-4" />
        {t("chooseFromLibrary")}
      </Button>
      <Input
        type="url"
        value={value ?? ""}
        placeholder={t("orPasteUrl")}
        disabled={readOnly}
        onChange={(event) => onChange(event.target.value)}
      />
      <MediaPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={onChange}
        imagesOnly
      />
    </div>
  );
};

export const mediaPickerField = {
  type: "custom" as const,
  render: MediaPickerField,
};
