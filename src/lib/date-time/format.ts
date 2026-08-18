import type { Locale } from "@/i18n/config";

export type DateStyle = "short" | "medium" | "long" | "full";
export type TimeStyle = "short" | "medium";
export type HourCycle = "auto" | "h12" | "h23";
export type Timezone = string;
export type CalendarSystem = "auto" | "gregory" | "persian";
export type NumberingSystem = "auto" | "latn" | "arabext";
export type FirstDayOfWeek = "auto" | "saturday" | "sunday" | "monday";

export type DateTimePreferences = {
  locale: Locale;
  timezone: Timezone;
  calendar: CalendarSystem;
  numberingSystem: NumberingSystem;
  dateStyle: DateStyle;
  timeStyle: TimeStyle;
  hourCycle: HourCycle;
  firstDayOfWeek: FirstDayOfWeek;
};

function resolveLocale(prefs: DateTimePreferences): string {
  return new Intl.Locale(prefs.locale, {
    ...(prefs.calendar !== "auto" ? { calendar: prefs.calendar } : {}),
    ...(prefs.numberingSystem !== "auto"
      ? { numberingSystem: prefs.numberingSystem }
      : {}),
    ...(prefs.hourCycle !== "auto" ? { hourCycle: prefs.hourCycle } : {}),
  }).toString();
}

export function formatSiteDate(date: Date, prefs: DateTimePreferences): string {
  return new Intl.DateTimeFormat(resolveLocale(prefs), {
    timeZone: prefs.timezone,
    dateStyle: prefs.dateStyle,
  }).format(date);
}

export function formatSiteTime(date: Date, prefs: DateTimePreferences): string {
  return new Intl.DateTimeFormat(resolveLocale(prefs), {
    timeZone: prefs.timezone,
    timeStyle: prefs.timeStyle,
  }).format(date);
}

export function formatSiteDateTime(
  date: Date,
  prefs: DateTimePreferences,
): string {
  return new Intl.DateTimeFormat(resolveLocale(prefs), {
    timeZone: prefs.timezone,
    dateStyle: prefs.dateStyle,
    timeStyle: prefs.timeStyle,
  }).format(date);
}

const relativeDivisions: Array<{
  amount: number;
  unit: Intl.RelativeTimeFormatUnit;
}> = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

export function formatSiteRelativeTime(
  date: Date,
  prefs: DateTimePreferences,
  now: Date = new Date(),
): string {
  const formatter = new Intl.RelativeTimeFormat(resolveLocale(prefs), {
    numeric: "auto",
  });

  let duration = (date.getTime() - now.getTime()) / 1000;
  for (const division of relativeDivisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return formatter.format(Math.round(duration), "year");
}

export function getSupportedTimezones(): Timezone[] {
  return Array.from(new Set(["UTC", ...Intl.supportedValuesOf("timeZone")]));
}

export function getTimezoneOffsetLabel(timezone: Timezone): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  }).formatToParts(new Date());
  return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
}
