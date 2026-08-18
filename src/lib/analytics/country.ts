import { UNKNOWN_COUNTRY } from "./sessions";

const GEO_HEADERS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
] as const;

function normalize(value: string | null | undefined): string | null {
  if (!value) return null;

  const code = value.trim().toUpperCase();

  return /^[A-Z]{2}$/.test(code) ? code : null;
}

export function resolveCountry(headers: Headers): string {
  for (const header of GEO_HEADERS) {
    const code = normalize(headers.get(header));
    if (code) return code;
  }

  return UNKNOWN_COUNTRY;
}
