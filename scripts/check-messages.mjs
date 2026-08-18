import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const messagesDir = join(process.cwd(), "src", "messages");
const referenceLocale = "en";

function flatten(value, prefix) {
  if (typeof value !== "object" || value === null) return [prefix];

  return Object.entries(value).flatMap(([key, child]) =>
    flatten(child, prefix ? `${prefix}.${key}` : key),
  );
}

function readLocale(locale) {
  const dir = join(messagesDir, locale);

  return new Set(
    readdirSync(dir)
      .filter((file) => file.endsWith(".json"))
      .flatMap((file) =>
        flatten(JSON.parse(readFileSync(join(dir, file), "utf8")), file),
      ),
  );
}

const locales = readdirSync(messagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

if (!locales.includes(referenceLocale)) {
  console.error(
    `Missing reference locale "${referenceLocale}" in ${messagesDir}`,
  );
  process.exit(1);
}

const reference = readLocale(referenceLocale);
let failed = false;

for (const locale of locales.filter((item) => item !== referenceLocale)) {
  const keys = readLocale(locale);
  const missing = [...reference].filter((key) => !keys.has(key)).sort();
  const extra = [...keys].filter((key) => !reference.has(key)).sort();

  if (missing.length === 0 && extra.length === 0) continue;

  failed = true;
  console.error(`\n${locale}:`);
  for (const key of missing) console.error(`  missing: ${key}`);
  for (const key of extra) console.error(`  unknown: ${key}`);
}

if (failed) {
  console.error(
    `\nMessage catalogs are out of sync with "${referenceLocale}".`,
  );
  process.exit(1);
}

console.log(
  `Message catalogs match "${referenceLocale}" (${reference.size} keys).`,
);
