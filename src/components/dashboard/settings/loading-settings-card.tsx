"use client";

import { useTranslations } from "next-intl";

import { DashboardFormField } from "@/components/dashboard/form-field";
import { DashboardSelectField } from "@/components/dashboard/select-field";
import { DashboardSwitchRow } from "@/components/dashboard/switch-row";
import { Input } from "@/components/ui/input";
import {
  loadingColorModeOptions,
  loadingPositionOptions,
  sanitizeLoadingColor,
  sanitizeLoadingSpinner,
  type LoadingColorMode,
  type LoadingPosition,
} from "@/lib/site-settings/loading";

import type { SettingsSectionProps } from "./section";
import { SpinnerPickerDialog } from "./spinner-picker-dialog";

const FALLBACK_SPINNER = "90-ring-with-bg";
const FALLBACK_COLOR = "#2563eb";

type Props = SettingsSectionProps<"loading"> & {
  themeColor: string;
};

export function LoadingSettingsCard({ value, onChange, themeColor }: Props) {
  const t = useTranslations("dashboard.settings");
  const spinner = sanitizeLoadingSpinner(value.spinner) ?? FALLBACK_SPINNER;
  const colorMode = value.colorMode;
  const loadingColorPreview =
    sanitizeLoadingColor(value.color) ?? FALLBACK_COLOR;
  const colorSwatchValue =
    colorMode === "custom" ? loadingColorPreview : themeColor;

  return (
    <div className="space-y-4">
      <DashboardSwitchRow
        id="loadingEnabled"
        label={t("loading.enabled")}
        description={t("loading.description")}
        checked={value.enabled}
        onCheckedChange={(enabled) => onChange({ enabled })}
        reverse
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardFormField id="loadingSpinner" label={t("loading.spinner")}>
          <SpinnerPickerDialog
            spinner={spinner}
            colorMode={colorMode}
            color={loadingColorPreview}
            onSelect={(next) => onChange({ spinner: next })}
          />
        </DashboardFormField>

        <DashboardSelectField
          id="loadingPosition"
          label={t("loading.position")}
          value={value.position}
          options={loadingPositionOptions}
          onChange={(position: LoadingPosition) => onChange({ position })}
          getLabel={(position) => t(`loading.positions.${position}`)}
          triggerClassName="w-full"
        />

        <DashboardFormField id="loadingSize" label={t("loading.size")}>
          <Input
            id="loadingSize"
            type="number"
            min={32}
            max={128}
            step={4}
            value={value.size}
            onChange={(event) => onChange({ size: Number(event.target.value) })}
          />
        </DashboardFormField>

        <DashboardSelectField
          id="loadingColorMode"
          label={t("loading.colorMode")}
          value={colorMode}
          options={loadingColorModeOptions}
          onChange={(mode: LoadingColorMode) => onChange({ colorMode: mode })}
          getLabel={(mode) => t(`loading.colorModes.${mode}`)}
          triggerClassName="w-full"
          after={
            <input
              id="loadingColor"
              type="color"
              value={colorSwatchValue}
              onChange={(event) => onChange({ color: event.target.value })}
              disabled={colorMode !== "custom"}
              aria-label={t("loading.color")}
              className="border-input bg-background size-9 shrink-0 cursor-pointer rounded-lg border p-1 disabled:cursor-not-allowed disabled:opacity-40"
            />
          }
        />
      </div>
    </div>
  );
}
