const REGIONAL_INDICATOR_OFFSET = 0x1f1a5;

export function countryFlag(countryCode: string): string {
  if (!/^[A-Za-z]{2}$/.test(countryCode)) return "🏳️";

  return String.fromCodePoint(
    ...[...countryCode.toUpperCase()].map(
      (char) => REGIONAL_INDICATOR_OFFSET + char.charCodeAt(0),
    ),
  );
}
