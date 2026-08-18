"use client";

import { useState, useCallback, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CustomFieldRender } from "@puckeditor/core";
import { useTranslations } from "next-intl";
import { ColorPickerField } from "./color-picker";
import { GapSliderField } from "./gap-slider";
import { MediaPickerField } from "./media-picker";

export type SectionStyleValue = {
  backgroundColor: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundPosition: string;
  paddingVertical: number;
  maxWidth: string;
};

const DEFAULT_SECTION_STYLE: SectionStyleValue = {
  backgroundColor: "",
  backgroundImage: "",
  backgroundSize: "cover",
  backgroundPosition: "center",
  paddingVertical: 0,
  maxWidth: "none",
};

const MAX_WIDTH_OPTIONS = [
  { label: "None (Full)", value: "none" },
  { label: "7xl (80rem)", value: "80rem" },
  { label: "5xl (64rem)", value: "64rem" },
  { label: "4xl (56rem)", value: "56rem" },
  { label: "2xl (42rem)", value: "42rem" },
];

const BACKGROUND_SIZE_OPTIONS = ["cover", "contain"] as const;

const BACKGROUND_POSITION_OPTIONS = ["center", "top", "bottom"] as const;

const S = {
  wrap: {
    border: "1px solid var(--puck-color-grey-09, #e2e8f0)",
    borderRadius: 8,
    overflow: "hidden",
  },
  trigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 12px",
    background: "var(--puck-color-grey-12, #f9fafb)",
    cursor: "pointer",
    border: "none",
    width: "100%",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    color: "var(--puck-color-grey-05, #737373)",
  },
  body: {
    padding: "12px",
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
    borderTop: "1px solid var(--puck-color-grey-09, #e2e8f0)",
    background: "var(--puck-color-white, #fff)",
  },
  row: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 4,
  },
  label: {
    fontSize: 11,
    color: "var(--puck-color-grey-06, #737373)",
    fontWeight: 500,
  },
  select: {
    padding: "5px 8px",
    fontSize: 12,
    border: "1px solid var(--puck-color-grey-09, #e2e8f0)",
    borderRadius: 5,
    background: "var(--puck-color-white, #fff)",
    color: "var(--puck-color-black, #000)",
    width: "100%",
    outline: "none",
    cursor: "pointer",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
};

const dummyColorField = { type: "custom" as const, render: ColorPickerField };
const dummyGapField = {
  type: "custom" as const,
  min: 0,
  max: 120,
  render: GapSliderField,
};
const dummyMediaField = { type: "custom" as const, render: MediaPickerField };

const SectionStyleField: CustomFieldRender<SectionStyleValue> = ({
  value,
  onChange,
  readOnly,
}) => {
  const t = useTranslations("pageBuilder.builder");
  const [open, setOpen] = useState(false);
  const v: SectionStyleValue = useMemo(
    () => ({ ...DEFAULT_SECTION_STYLE, ...value }),
    [value],
  );

  const update = useCallback(
    (patch: Partial<SectionStyleValue>) => onChange({ ...v, ...patch }),
    [v, onChange],
  );

  const hasStyle =
    v.backgroundColor ||
    v.backgroundImage ||
    v.paddingVertical > 0 ||
    v.maxWidth !== "none";

  return (
    <div style={S.wrap}>
      <button
        type="button"
        aria-expanded={open}
        disabled={readOnly}
        onClick={() => setOpen((o) => !o)}
        style={S.trigger}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {t("sectionStyle")}
          {hasStyle && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--puck-color-azure-05, #4d8fc9)",
                display: "inline-block",
              }}
            />
          )}
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div style={S.body}>
          <div style={S.row}>
            <span style={S.label}>{t("backgroundColor")}</span>
            <ColorPickerField
              field={dummyColorField}
              name="backgroundColor"
              id="bg-color"
              value={v.backgroundColor}
              onChange={(val) => update({ backgroundColor: val })}
              readOnly={readOnly}
            />
          </div>

          <div style={S.row}>
            <span style={S.label}>{t("backgroundImage")}</span>
            <MediaPickerField
              field={dummyMediaField}
              name="backgroundImage"
              id="bg-image"
              value={v.backgroundImage}
              onChange={(val) => update({ backgroundImage: val })}
              readOnly={readOnly}
            />
          </div>

          {v.backgroundImage ? (
            <div style={S.twoCol}>
              <div style={S.row}>
                <span style={S.label}>{t("backgroundSize")}</span>
                <select
                  value={v.backgroundSize}
                  onChange={(e) => update({ backgroundSize: e.target.value })}
                  disabled={readOnly}
                  style={S.select}
                >
                  {BACKGROUND_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {t(opt)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={S.row}>
                <span style={S.label}>{t("backgroundPosition")}</span>
                <select
                  value={v.backgroundPosition}
                  onChange={(e) =>
                    update({ backgroundPosition: e.target.value })
                  }
                  disabled={readOnly}
                  style={S.select}
                >
                  {BACKGROUND_POSITION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {t(opt)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}

          <div style={S.row}>
            <span style={S.label}>
              {t("paddingVertical")} ({v.paddingVertical}px)
            </span>
            <GapSliderField
              field={dummyGapField}
              name="paddingVertical"
              id="pv"
              value={v.paddingVertical}
              onChange={(val) => update({ paddingVertical: val })}
              readOnly={readOnly}
            />
          </div>

          <div style={S.row}>
            <span style={S.label}>{t("maxWidth")}</span>
            <select
              value={v.maxWidth}
              onChange={(e) => update({ maxWidth: e.target.value })}
              disabled={readOnly}
              style={S.select}
            >
              {MAX_WIDTH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value === "none" ? t("fullWidth") : opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export const sectionStyleFieldDef = {
  type: "custom" as const,
  render: SectionStyleField,
};
