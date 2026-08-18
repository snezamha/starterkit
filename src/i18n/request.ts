import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

const namespaces = ["common", "dashboard", "media", "pageBuilder"] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const modules = await Promise.all(
    namespaces.map(
      (namespace) => import(`../messages/${locale}/${namespace}.json`),
    ),
  );

  const messages = Object.fromEntries(
    namespaces.map((namespace, index) => [namespace, modules[index].default]),
  );

  return {
    locale,
    messages,
  };
});
