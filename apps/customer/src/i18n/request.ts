import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import en from "../../messages/en.json";
import fr from "../../messages/fr.json";

const catalogs = { en, fr } as const;

export default getRequestConfig(async ({ requestLocale, locale: override }) => {
  const requested = override ?? (await requestLocale);
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: catalogs[locale],
  };
});
