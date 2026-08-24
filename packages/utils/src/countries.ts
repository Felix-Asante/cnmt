import worldCountries from "world-countries/countries.json" with { type: "json" };

export type CountryCatalogEntry = {
  iso_code: string;
  name: string;
  flag: string;
  currency_code: string;
  currency_name: string;
  currency_symbol: string;
};

type WorldCurrency = {
  name?: string;
  symbol?: string;
};

type WorldCountry = {
  cca2?: string;
  flag?: string;
  name?: { common?: string };
  currencies?: Record<string, WorldCurrency | undefined>;
};

const EXTRA: CountryCatalogEntry[] = [
  {
    iso_code: "EU",
    name: "Europe",
    flag: "🇪🇺",
    currency_code: "EUR",
    currency_name: "Euro",
    currency_symbol: "€",
  },
];

function fromWorldCountry(country: WorldCountry): CountryCatalogEntry | null {
  const currencyEntries = Object.entries(country.currencies ?? {}).filter(
    (entry): entry is [string, WorldCurrency] => Boolean(entry[1]?.name),
  );
  if (!country.cca2 || !country.flag || !country.name?.common) return null;
  if (currencyEntries.length === 0) return null;

  const [currencyCode, currency] = currencyEntries[0]!;
  const symbol = (currency.symbol || currencyCode).trim();

  return {
    iso_code: country.cca2.toUpperCase(),
    name: country.name.common,
    flag: country.flag,
    currency_code: currencyCode.toUpperCase(),
    currency_name: currency.name!,
    // API currently validates currency_symbol max=3.
    currency_symbol: symbol.slice(0, 3),
  };
}

let catalog: CountryCatalogEntry[] | null = null;

export function getCountryCatalog(): CountryCatalogEntry[] {
  if (catalog) return catalog;

  const byIso = new Map<string, CountryCatalogEntry>();

  for (const country of worldCountries as unknown as WorldCountry[]) {
    const entry = fromWorldCountry(country);
    if (!entry) continue;
    byIso.set(entry.iso_code, entry);
  }

  for (const entry of EXTRA) {
    byIso.set(entry.iso_code, entry);
  }

  catalog = [...byIso.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "en"),
  );
  return catalog;
}

export function getCountryByIso(isoCode: string) {
  const code = isoCode.trim().toUpperCase();
  if (!code) return undefined;
  return getCountryCatalog().find((entry) => entry.iso_code === code);
}

export type CountryPickerOption = {
  code: string;
  name: string;
  flag: string;
  meta: string;
};

export function getCountryPickerOptions(
  excludeIsoCodes?: Iterable<string>,
): CountryPickerOption[] {
  const excluded = new Set(
    [...(excludeIsoCodes ?? [])].map((code) => code.trim().toUpperCase()),
  );

  return getCountryCatalog()
    .filter((entry) => !excluded.has(entry.iso_code))
    .map((entry) => ({
      code: entry.iso_code,
      name: entry.name,
      flag: entry.flag,
      meta: `${entry.iso_code} · ${entry.currency_code}`,
    }));
}

