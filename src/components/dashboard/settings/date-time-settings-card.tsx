"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";

import { DashboardSelectField } from "@/components/dashboard/select-field";
import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/i18n/config";
import {
  formatSiteDate,
  formatSiteDateTime,
  formatSiteRelativeTime,
  formatSiteTime,
  getSupportedTimezones,
  getTimezoneOffsetLabel,
  type CalendarSystem,
  type DateStyle,
  type DateTimePreferences,
  type FirstDayOfWeek,
  type HourCycle,
  type NumberingSystem,
  type TimeStyle,
  type Timezone,
} from "@/lib/date-time/format";
import {
  calendarOptions,
  dateStyleOptions,
  firstDayOfWeekOptions,
  hourCycleOptions,
  numberingSystemOptions,
  timeStyleOptions,
} from "@/lib/site-settings/date-time";

import type { SettingsSectionProps } from "./section";

const RELATIVE_SAMPLE_OFFSET_MS = 3 * 60 * 60 * 1000;

function timezoneLabel(timezone: Timezone) {
  return `${timezone.replaceAll("_", " ")} (${getTimezoneOffsetLabel(timezone)})`;
}

export function DateTimeSettingsCard({
  value,
  onChange,
}: SettingsSectionProps<"dateTime">) {
  const t = useTranslations("dashboard.settings");
  const locale = useLocale() as Locale;

  const now = useMemo(() => new Date(), []);
  const timezones = useMemo(() => getSupportedTimezones(), []);

  const prefs: DateTimePreferences = useMemo(
    () => ({ locale, ...value }),
    [locale, value],
  );

  const relativeSample = useMemo(
    () =>
      formatSiteRelativeTime(
        new Date(now.getTime() - RELATIVE_SAMPLE_OFFSET_MS),
        prefs,
        now,
      ),
    [now, prefs],
  );

  function sampleItem(sample: string, description: string) {
    return (
      <>
        <span dir="auto">{sample}</span>
        <span className="text-muted-foreground">{description}</span>
      </>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardSelectField
            id="dateTimeTimezone"
            label={t("dateTime.timezone")}
            value={value.timezone}
            options={timezones}
            onChange={(timezone) => onChange({ timezone })}
            getLabel={timezoneLabel}
            triggerClassName="w-full"
          />

          <DashboardSelectField
            id="dateTimeCalendar"
            label={t("dateTime.calendar")}
            value={value.calendar}
            options={calendarOptions}
            onChange={(calendar: CalendarSystem) => onChange({ calendar })}
            getLabel={(calendar) => t(`dateTime.calendars.${calendar}`)}
            triggerClassName="w-full"
          />

          <DashboardSelectField
            id="dateTimeNumberingSystem"
            label={t("dateTime.numberingSystem")}
            value={value.numberingSystem}
            options={numberingSystemOptions}
            onChange={(numberingSystem: NumberingSystem) =>
              onChange({ numberingSystem })
            }
            getLabel={(numberingSystem) =>
              t(`dateTime.numberingSystems.${numberingSystem}`)
            }
            triggerClassName="w-full"
          />

          <DashboardSelectField
            id="dateTimeDateStyle"
            label={t("dateTime.dateFormat")}
            value={value.dateStyle}
            options={dateStyleOptions}
            onChange={(dateStyle: DateStyle) => onChange({ dateStyle })}
            getLabel={(dateStyle) => t(`dateTime.dateStyles.${dateStyle}`)}
            renderItem={(dateStyle) =>
              sampleItem(
                formatSiteDate(now, { ...prefs, dateStyle }),
                t(`dateTime.dateStyles.${dateStyle}`),
              )
            }
            triggerClassName="w-full"
          />

          <DashboardSelectField
            id="dateTimeTimeStyle"
            label={t("dateTime.timeFormat")}
            value={value.timeStyle}
            options={timeStyleOptions}
            onChange={(timeStyle: TimeStyle) => onChange({ timeStyle })}
            getLabel={(timeStyle) => t(`dateTime.timeStyles.${timeStyle}`)}
            renderItem={(timeStyle) =>
              sampleItem(
                formatSiteTime(now, { ...prefs, timeStyle }),
                t(`dateTime.timeStyles.${timeStyle}`),
              )
            }
            triggerClassName="w-full"
          />

          <DashboardSelectField
            id="dateTimeHourCycle"
            label={t("dateTime.hourCycle")}
            value={value.hourCycle}
            options={hourCycleOptions}
            onChange={(hourCycle: HourCycle) => onChange({ hourCycle })}
            getLabel={(hourCycle) => t(`dateTime.hourCycles.${hourCycle}`)}
            triggerClassName="w-full"
          />

          <DashboardSelectField
            id="dateTimeFirstDayOfWeek"
            label={t("dateTime.firstDayOfWeek")}
            value={value.firstDayOfWeek}
            options={firstDayOfWeekOptions}
            onChange={(firstDayOfWeek: FirstDayOfWeek) =>
              onChange({ firstDayOfWeek })
            }
            getLabel={(day) => t(`dateTime.weekDays.${day}`)}
            triggerClassName="w-full"
          />
        </div>

        <div className="rounded-lg border bg-muted/40 px-4 py-3">
          <p className="text-sm font-medium">{t("dateTime.preview")}</p>
          <p className="text-sm text-muted-foreground" dir="auto">
            {formatSiteDateTime(now, prefs)} · {relativeSample}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
