export const ALL_TIME = "all";

export const RANGE_OPTIONS = [7, 14, 30, 90, ALL_TIME] as const;

export type RangeValue = (typeof RANGE_OPTIONS)[number];

export function normalizeRange(range: unknown): RangeValue {
  return RANGE_OPTIONS.includes(range as RangeValue)
    ? (range as RangeValue)
    : RANGE_OPTIONS[0];
}
