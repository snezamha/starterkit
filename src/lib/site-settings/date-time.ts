import {
  getSupportedTimezones,
  type CalendarSystem,
  type DateStyle,
  type FirstDayOfWeek,
  type HourCycle,
  type NumberingSystem,
  type TimeStyle,
  type Timezone,
} from "@/lib/date-time/format";

export type DateTimeSettings = {
  timezone: Timezone;
  calendar: CalendarSystem;
  numberingSystem: NumberingSystem;
  dateStyle: DateStyle;
  timeStyle: TimeStyle;
  hourCycle: HourCycle;
  firstDayOfWeek: FirstDayOfWeek;
};

let supportedTimezones: Set<string> | undefined;

function getTimezoneSet(): Set<string> {
  supportedTimezones ??= new Set(getSupportedTimezones());
  return supportedTimezones;
}

export const calendarOptions: CalendarSystem[] = ["auto", "gregory", "persian"];

export const numberingSystemOptions: NumberingSystem[] = [
  "auto",
  "latn",
  "arabext",
];

export const dateStyleOptions: DateStyle[] = [
  "short",
  "medium",
  "long",
  "full",
];

export const timeStyleOptions: TimeStyle[] = ["short", "medium"];

export const hourCycleOptions: HourCycle[] = ["auto", "h12", "h23"];

export const firstDayOfWeekOptions: FirstDayOfWeek[] = [
  "auto",
  "saturday",
  "sunday",
  "monday",
];

export const defaultDateTimeSettings: DateTimeSettings = {
  timezone: "UTC",
  calendar: "auto",
  numberingSystem: "auto",
  dateStyle: "medium",
  timeStyle: "short",
  hourCycle: "auto",
  firstDayOfWeek: "auto",
};

function sanitizeTimezone(value: unknown): Timezone | undefined {
  return typeof value === "string" && getTimezoneSet().has(value)
    ? value
    : undefined;
}

function sanitizeOption<T extends string>(
  value: unknown,
  options: readonly T[],
): T | undefined {
  return typeof value === "string" && options.includes(value as T)
    ? (value as T)
    : undefined;
}

export function sanitizeDateTimeSettings(
  data: Partial<DateTimeSettings>,
): Partial<DateTimeSettings> {
  const timezone = sanitizeTimezone(data.timezone);
  const calendar = sanitizeOption(data.calendar, calendarOptions);
  const numberingSystem = sanitizeOption(
    data.numberingSystem,
    numberingSystemOptions,
  );
  const dateStyle = sanitizeOption(data.dateStyle, dateStyleOptions);
  const timeStyle = sanitizeOption(data.timeStyle, timeStyleOptions);
  const hourCycle = sanitizeOption(data.hourCycle, hourCycleOptions);
  const firstDayOfWeek = sanitizeOption(
    data.firstDayOfWeek,
    firstDayOfWeekOptions,
  );

  return {
    ...(timezone && { timezone }),
    ...(calendar && { calendar }),
    ...(numberingSystem && { numberingSystem }),
    ...(dateStyle && { dateStyle }),
    ...(timeStyle && { timeStyle }),
    ...(hourCycle && { hourCycle }),
    ...(firstDayOfWeek && { firstDayOfWeek }),
  };
}

export function parseDateTimeSettings(value: unknown): DateTimeSettings {
  const record =
    value && typeof value === "object"
      ? (value as Partial<DateTimeSettings>)
      : {};

  return { ...defaultDateTimeSettings, ...sanitizeDateTimeSettings(record) };
}
