import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale, locale: override }) => {
  // Prefer `requestLocale` from the middleware/`[locale]` segment.
  // Avoid `next/root-params` in this file — it is a compiler placeholder and is
  // not rewritten when loaded through the next-intl plugin, so `locale()` fails.
  const requested = override ?? (await requestLocale);
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
