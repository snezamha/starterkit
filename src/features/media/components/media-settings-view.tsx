"use client";

import { useMemo, useState, useTransition } from "react";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import {
  DashboardCardFormFooter,
  DashboardPage,
  DashboardPageHeader,
} from "@/components/dashboard/layout/dashboard-page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { saveMediaSettings } from "@/features/media/actions";
import { Link } from "@/i18n/navigation";
import {
  MEDIA_MAX_FILE_SIZE_MB_RANGE,
  MEDIA_STORAGE_PER_USER_MB_RANGE,
  MEDIA_STORAGE_QUOTA_GB_RANGE,
  mediaQuotaMb,
  type MediaSettings,
} from "@/lib/site-settings/media";
import { toastManager } from "@/lib/toast-manager";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Math.round(value), min), max);
}

type SliderFieldProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: "GB" | "MB";
  hint: string;
  decreaseLabel: string;
  increaseLabel: string;
  rangeLabel: string;
  onChange: (value: number) => void;
};

function SliderField({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  hint,
  decreaseLabel,
  increaseLabel,
  rangeLabel,
  onChange,
}: SliderFieldProps) {
  const setClampedValue = (next: number) => onChange(clamp(next, min, max));

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={decreaseLabel}
            disabled={value <= min}
            onClick={() => setClampedValue(value - step)}
          >
            <Minus className="size-4" />
          </Button>
          <Input
            id={id}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(event) => setClampedValue(Number(event.target.value))}
            className="h-7 w-24 text-center"
            dir="ltr"
          />
          <span className="text-muted-foreground min-w-8 text-sm" dir="ltr">
            {unit}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={increaseLabel}
            disabled={value >= max}
            onClick={() => setClampedValue(value + step)}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>
      <Slider
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(next) =>
          setClampedValue(Array.isArray(next) ? (next[0] ?? value) : next)
        }
      />
      <p className="text-muted-foreground text-xs leading-relaxed">
        {hint} <span dir="ltr">{rangeLabel}</span>
      </p>
    </div>
  );
}

export function MediaSettingsView({ settings }: { settings: MediaSettings }) {
  const t = useTranslations("media");
  const ts = useTranslations("media.settings");
  const format = useFormatter();
  const [quota, setQuota] = useState(settings.storageQuotaGb);
  const [maxFile, setMaxFile] = useState(settings.maxFileSizeMb);
  const [perUser, setPerUser] = useState(settings.maxStoragePerUserMb);
  const [baseline, setBaseline] = useState(settings);
  const [isSaving, startSaving] = useTransition();
  const quotaMb = mediaQuotaMb(quota);

  const isDirty = useMemo(
    () =>
      quota !== baseline.storageQuotaGb ||
      maxFile !== baseline.maxFileSizeMb ||
      perUser !== baseline.maxStoragePerUserMb,
    [baseline, maxFile, perUser, quota],
  );

  function formatRange(min: number, max: number, unit: "GB" | "MB") {
    return `${format.number(min)} ${unit} - ${format.number(max)} ${unit}`;
  }

  function setQuotaValue(value: number) {
    const nextQuota = clamp(
      value,
      MEDIA_STORAGE_QUOTA_GB_RANGE.min,
      MEDIA_STORAGE_QUOTA_GB_RANGE.max,
    );
    const nextQuotaMb = mediaQuotaMb(nextQuota);

    setQuota(nextQuota);
    setMaxFile((current) =>
      clamp(current, MEDIA_MAX_FILE_SIZE_MB_RANGE.min, nextQuotaMb),
    );
    setPerUser((current) =>
      clamp(current, MEDIA_STORAGE_PER_USER_MB_RANGE.min, nextQuotaMb),
    );
  }

  function handleSave() {
    startSaving(async () => {
      try {
        const next = {
          storageQuotaGb: quota,
          maxFileSizeMb: maxFile,
          maxStoragePerUserMb: perUser,
        };

        await saveMediaSettings(next);
        setBaseline(next);
        toastManager.add({
          title: ts("saved"),
          type: "success",
          timeout: 3000,
        });
      } catch {
        toastManager.add({ title: ts("error"), type: "error", timeout: 5000 });
      }
    });
  }

  function handleCancel() {
    setQuota(baseline.storageQuotaGb);
    setMaxFile(baseline.maxFileSizeMb);
    setPerUser(baseline.maxStoragePerUserMb);
  }

  return (
    <DashboardPage>
      <DashboardPageHeader
        title={ts("title")}
        description={t("description")}
        actions={
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/dashboard/media" />}
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("backToLibrary")}
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{ts("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <SliderField
            id="media-quota"
            label={ts("quota")}
            value={quota}
            min={MEDIA_STORAGE_QUOTA_GB_RANGE.min}
            max={MEDIA_STORAGE_QUOTA_GB_RANGE.max}
            unit="GB"
            hint={ts("quotaHint")}
            decreaseLabel={ts("decrease", { label: ts("quota") })}
            increaseLabel={ts("increase", { label: ts("quota") })}
            rangeLabel={formatRange(
              MEDIA_STORAGE_QUOTA_GB_RANGE.min,
              MEDIA_STORAGE_QUOTA_GB_RANGE.max,
              "GB",
            )}
            onChange={setQuotaValue}
          />
          <SliderField
            id="media-max-file"
            label={ts("maxFile")}
            value={maxFile}
            min={MEDIA_MAX_FILE_SIZE_MB_RANGE.min}
            max={quotaMb}
            unit="MB"
            hint={ts("maxFileHint")}
            decreaseLabel={ts("decrease", { label: ts("maxFile") })}
            increaseLabel={ts("increase", { label: ts("maxFile") })}
            rangeLabel={formatRange(
              MEDIA_MAX_FILE_SIZE_MB_RANGE.min,
              quotaMb,
              "MB",
            )}
            onChange={setMaxFile}
          />
          <SliderField
            id="media-per-user"
            label={ts("perUser")}
            value={perUser}
            min={MEDIA_STORAGE_PER_USER_MB_RANGE.min}
            max={quotaMb}
            step={10}
            unit="MB"
            hint={ts("perUserHint")}
            decreaseLabel={ts("decrease", { label: ts("perUser") })}
            increaseLabel={ts("increase", { label: ts("perUser") })}
            rangeLabel={formatRange(
              MEDIA_STORAGE_PER_USER_MB_RANGE.min,
              quotaMb,
              "MB",
            )}
            onChange={setPerUser}
          />
        </CardContent>
        <DashboardCardFormFooter
          cancelLabel={t("cancel")}
          saveLabel={ts("save")}
          status={isDirty ? ts("unsavedChanges") : null}
          isDirty={isDirty}
          isSaving={isSaving}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </Card>
    </DashboardPage>
  );
}
