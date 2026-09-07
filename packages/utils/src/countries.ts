import worldCountries from "world-countries/countries.json" with { type: "json" };

export type CountryCatalogEntry = {
  iso_code: string;
  name: string;
  flag: string;
  currency_code: string;
  currency_name: string;
  currency_symbol: string;
  calling_code?: string;
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
  idd?: {
    root?: string;
    suffixes?: string[];
  };
};

const EXTRA: CountryCatalogEntry[] = [
  {
    iso_code: "EU",
    name: "Europe",
    flag: "🇪🇺",
    currency_code: "EUR",
    currency_name: "Euro",
    currency_symbol: "€",
    calling_code: "",
  },
];

function getCallingCode(idd?: { root?: string; suffixes?: string[] }): string {
  if (!idd || !idd.root) return "";
  if (idd.root === "+1") return "+1";
  if (idd.suffixes && idd.suffixes.length === 1) {
    return `${idd.root}${idd.suffixes[0]}`;
  }
  return idd.root;
}

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
    calling_code: getCallingCode(country.idd),
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

export function getCallingCodeByIso(isoCode?: string): string {
  if (!isoCode) return "";
  const match = getCountryByIso(isoCode);
  return match?.calling_code ?? "";
}

export type PhoneCountryOption = {
  iso_code: string;
  name: string;
  flag: string;
  calling_code: string;
};

const DEFAULT_PRIORITY_PHONE_ISOS = [
  "MA", // Morocco (+212)
  "GB", // United Kingdom (+44)
  "FR", // France (+33)
  "ES", // Spain (+34)
  "GH", // Ghana (+233)
  "NG", // Nigeria (+234)
  "KE", // Kenya (+254)
  "UG", // Uganda (+256)
  "SL", // Sierra Leone (+232)
  "LR", // Liberia (+231)
  "US", // United States (+1)
  "CA", // Canada (+1)
];

export function getPhoneCountryOptions(
  priorityIsoCodes: string[] = DEFAULT_PRIORITY_PHONE_ISOS,
): PhoneCountryOption[] {
  const all = getCountryCatalog()
    .filter((entry): entry is CountryCatalogEntry & { calling_code: string } =>
      Boolean(entry.calling_code),
    )
    .map((entry) => ({
      iso_code: entry.iso_code,
      name: entry.name,
      flag: entry.flag,
      calling_code: entry.calling_code,
    }));

  const prioritySet = new Set(priorityIsoCodes.map((c) => c.toUpperCase()));
  const priorityList = priorityIsoCodes
    .map((code) => all.find((c) => c.iso_code === code.toUpperCase()))
    .filter((c): c is PhoneCountryOption => Boolean(c));

  const rest = all.filter((c) => !prioritySet.has(c.iso_code));
  return [...priorityList, ...rest];
}

export function normalizePhoneToE164(
  phone: string,
  defaultCallingCode = "+212",
): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";

  // Replace leading 00 with +
  const cleaned = trimmed.replace(/^00/, "+");
  if (cleaned.startsWith("+")) {
    const digits = cleaned.slice(1).replace(/\D/g, "");
    return digits ? `+${digits}` : "";
  }

  const digits = cleaned.replace(/\D/g, "");
  if (!digits) return "";

  const callingCode = defaultCallingCode.startsWith("+")
    ? defaultCallingCode
    : `+${defaultCallingCode}`;
  const codeDigits = callingCode.replace(/\D/g, "");

  // If already starts with the calling code digits without '+', e.g. "212638118002"
  if (codeDigits && digits.startsWith(codeDigits)) {
    return `+${digits}`;
  }

  // Strip leading zero(s) (e.g. "0638118002" -> "638118002")
  const nationalDigits = digits.replace(/^0+/, "");
  return `${callingCode}${nationalDigits}`;
}

export function splitPhoneNumber(
  phone: string,
  defaultIsoCode = "MA",
): {
  callingCode: string;
  nationalNumber: string;
  isoCode: string;
} {
  const trimmed = phone.trim();
  const defaultEntry = getCountryByIso(defaultIsoCode);
  const defaultCode = defaultEntry?.calling_code || "+212";

  if (!trimmed) {
    return {
      callingCode: defaultCode,
      nationalNumber: "",
      isoCode: defaultEntry?.iso_code ?? "MA",
    };
  }

  const cleaned = trimmed.replace(/^00/, "+");
  if (cleaned.startsWith("+")) {
    const all = getPhoneCountryOptions();
    // Sort descending by calling code length so longer codes match first (e.g. +212 before +2)
    const sorted = [...all].sort(
      (a, b) => b.calling_code.length - a.calling_code.length,
    );
    for (const opt of sorted) {
      if (cleaned.startsWith(opt.calling_code)) {
        return {
          callingCode: opt.calling_code,
          nationalNumber: cleaned.slice(opt.calling_code.length).replace(/\D/g, ""),
          isoCode: opt.iso_code,
        };
      }
    }
  }

  // Raw number without leading '+'
  const digits = cleaned.replace(/\D/g, "");
  const defaultCodeDigits = defaultCode.replace(/\D/g, "");
  if (defaultCodeDigits && digits.startsWith(defaultCodeDigits)) {
    return {
      callingCode: defaultCode,
      nationalNumber: digits.slice(defaultCodeDigits.length),
      isoCode: defaultEntry?.iso_code ?? "MA",
    };
  }

  return {
    callingCode: defaultCode,
    nationalNumber: digits.replace(/^0+/, ""),
    isoCode: defaultEntry?.iso_code ?? "MA",
  };
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

export type CountryPhoneRule = {
  iso: string;
  name: string;
  callingCode: string;
  nationalLengths: number[];
  mobilePrefixes?: string[];
  validFirstDigits?: string[];
  example: string;
  placeholder: string;
  format?: (national: string) => string;
};

export const COUNTRY_PHONE_RULES: Record<string, CountryPhoneRule> = {
  MA: {
    iso: "MA",
    name: "Morocco",
    callingCode: "+212",
    nationalLengths: [9],
    mobilePrefixes: ["6", "7"],
    validFirstDigits: ["5", "6", "7", "8"],
    example: "+212638118002",
    placeholder: "638 118 002",
    format: (nat) =>
      [nat.slice(0, 3), nat.slice(3, 6), nat.slice(6)].filter(Boolean).join(" "),
  },
  GH: {
    iso: "GH",
    name: "Ghana",
    callingCode: "+233",
    nationalLengths: [9],
    mobilePrefixes: ["2", "5"],
    validFirstDigits: ["2", "3", "5"],
    example: "+233240000000",
    placeholder: "24 000 0000",
    format: (nat) =>
      [nat.slice(0, 2), nat.slice(2, 5), nat.slice(5)].filter(Boolean).join(" "),
  },
  NG: {
    iso: "NG",
    name: "Nigeria",
    callingCode: "+234",
    nationalLengths: [10],
    mobilePrefixes: ["7", "8", "9"],
    validFirstDigits: ["1", "2", "7", "8", "9"],
    example: "+2348012345678",
    placeholder: "801 234 5678",
    format: (nat) =>
      [nat.slice(0, 3), nat.slice(3, 6), nat.slice(6)].filter(Boolean).join(" "),
  },
  GB: {
    iso: "GB",
    name: "United Kingdom",
    callingCode: "+44",
    nationalLengths: [10],
    mobilePrefixes: ["7"],
    validFirstDigits: ["1", "2", "3", "7", "8"],
    example: "+447700900123",
    placeholder: "7700 900123",
    format: (nat) =>
      [nat.slice(0, 4), nat.slice(4)].filter(Boolean).join(" "),
  },
  FR: {
    iso: "FR",
    name: "France",
    callingCode: "+33",
    nationalLengths: [9],
    mobilePrefixes: ["6", "7"],
    validFirstDigits: ["1", "2", "3", "4", "5", "6", "7", "9"],
    example: "+33612345678",
    placeholder: "6 12 34 56 78",
    format: (nat) =>
      [
        nat.slice(0, 1),
        nat.slice(1, 3),
        nat.slice(3, 5),
        nat.slice(5, 7),
        nat.slice(7),
      ]
        .filter(Boolean)
        .join(" "),
  },
  ES: {
    iso: "ES",
    name: "Spain",
    callingCode: "+34",
    nationalLengths: [9],
    mobilePrefixes: ["6", "7"],
    validFirstDigits: ["6", "7", "8", "9"],
    example: "+34612345678",
    placeholder: "612 34 56 78",
    format: (nat) =>
      [nat.slice(0, 3), nat.slice(3, 5), nat.slice(5, 7), nat.slice(7)]
        .filter(Boolean)
        .join(" "),
  },
  KE: {
    iso: "KE",
    name: "Kenya",
    callingCode: "+254",
    nationalLengths: [9],
    mobilePrefixes: ["7", "1"],
    validFirstDigits: ["1", "2", "7"],
    example: "+254712345678",
    placeholder: "712 345 678",
    format: (nat) =>
      [nat.slice(0, 3), nat.slice(3, 6), nat.slice(6)].filter(Boolean).join(" "),
  },
  UG: {
    iso: "UG",
    name: "Uganda",
    callingCode: "+256",
    nationalLengths: [9],
    mobilePrefixes: ["7"],
    validFirstDigits: ["3", "4", "7"],
    example: "+256712345678",
    placeholder: "712 345 678",
    format: (nat) =>
      [nat.slice(0, 3), nat.slice(3, 6), nat.slice(6)].filter(Boolean).join(" "),
  },
  SL: {
    iso: "SL",
    name: "Sierra Leone",
    callingCode: "+232",
    nationalLengths: [8],
    mobilePrefixes: ["2", "3", "7", "8", "9"],
    validFirstDigits: ["2", "3", "7", "8", "9"],
    example: "+23276123456",
    placeholder: "76 123 456",
    format: (nat) =>
      [nat.slice(0, 2), nat.slice(2, 5), nat.slice(5)].filter(Boolean).join(" "),
  },
  LR: {
    iso: "LR",
    name: "Liberia",
    callingCode: "+231",
    nationalLengths: [7, 8],
    mobilePrefixes: ["5", "7", "8"],
    validFirstDigits: ["2", "4", "5", "7", "8"],
    example: "+231770123456",
    placeholder: "770 123 456",
    format: (nat) =>
      [nat.slice(0, 3), nat.slice(3, 6), nat.slice(6)].filter(Boolean).join(" "),
  },
  US: {
    iso: "US",
    name: "United States",
    callingCode: "+1",
    nationalLengths: [10],
    validFirstDigits: ["2", "3", "4", "5", "6", "7", "8", "9"],
    example: "+12025550123",
    placeholder: "202 555 0123",
    format: (nat) =>
      `(${nat.slice(0, 3)}) ${nat.slice(3, 6)}-${nat.slice(6)}`,
  },
  CA: {
    iso: "CA",
    name: "Canada",
    callingCode: "+1",
    nationalLengths: [10],
    validFirstDigits: ["2", "3", "4", "5", "6", "7", "8", "9"],
    example: "+14165550123",
    placeholder: "416 555 0123",
    format: (nat) =>
      `(${nat.slice(0, 3)}) ${nat.slice(3, 6)}-${nat.slice(6)}`,
  },
};

export type PhoneValidationOptions = {
  countryIso?: string;
  required?: boolean;
  mobileOnly?: boolean;
  label?: string;
  defaultCallingCode?: string;
};

export type PhoneValidationResult = {
  isValid: boolean;
  error?: string;
  normalized?: string;
  countryIso?: string;
  callingCode?: string;
  nationalNumber?: string;
};

export function isE164(phone: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phone.trim());
}

function isDummySequence(national: string): boolean {
  if (/^0+$/.test(national)) return true;
  if (/^(\d)\1+$/.test(national) && national.length >= 7) return true;
  return false;
}

export function validatePhoneNumber(
  input: string | null | undefined,
  options: PhoneValidationOptions = {},
): PhoneValidationResult {
  const {
    countryIso,
    required = true,
    mobileOnly = false,
    label,
    defaultCallingCode = "+212",
  } = options;

  const fieldLabel = label ? label.toLowerCase() : "phone number";
  const raw = (input ?? "").trim();

  if (!raw) {
    if (!required) {
      return { isValid: true, normalized: "" };
    }
    return {
      isValid: false,
      error: label ? `Please enter your ${fieldLabel}.` : "Please enter a phone number.",
    };
  }

  // Check for disallowed characters (only +, digits, spaces, hyphens, parentheses allowed)
  if (/[a-zA-Z]/.test(raw)) {
    return {
      isValid: false,
      error: "Phone number cannot contain letters.",
    };
  }

  if (/[^+\d\s()-]/.test(raw)) {
    return {
      isValid: false,
      error: "Phone number contains invalid characters.",
    };
  }

  // Normalize to E.164
  const normalized = normalizePhoneToE164(raw, defaultCallingCode);
  if (!normalized || normalized === "+" || normalized === defaultCallingCode) {
    return {
      isValid: false,
      error: `Please enter a valid ${fieldLabel}.`,
    };
  }

  if (!normalized.startsWith("+")) {
    return {
      isValid: false,
      error: "Phone number must include country code (e.g. +212638118002).",
    };
  }

  const parsed = splitPhoneNumber(normalized, countryIso || "MA");
  const callingCode = parsed.callingCode;
  const nationalNumber = parsed.nationalNumber;
  const resolvedIso = countryIso?.toUpperCase() || parsed.isoCode;

  // Total digits check (ITU E.164: 8 to 15 digits including country code)
  const allDigits = normalized.slice(1);
  if (allDigits.length < 8) {
    return {
      isValid: false,
      error: "Phone number is too short.",
      normalized,
      countryIso: resolvedIso,
      callingCode,
      nationalNumber,
    };
  }

  if (allDigits.length > 15) {
    return {
      isValid: false,
      error: "Phone number is too long (maximum 15 digits).",
      normalized,
      countryIso: resolvedIso,
      callingCode,
      nationalNumber,
    };
  }

  // Dummy digits check
  if (isDummySequence(nationalNumber)) {
    return {
      isValid: false,
      error: "Please enter a valid, active phone number.",
      normalized,
      countryIso: resolvedIso,
      callingCode,
      nationalNumber,
    };
  }

  // Country-specific rule validation
  const rule =
    COUNTRY_PHONE_RULES[resolvedIso] ??
    Object.values(COUNTRY_PHONE_RULES).find((r) => r.callingCode === callingCode);

  if (rule) {
    const minLength = Math.min(...rule.nationalLengths);
    const maxLength = Math.max(...rule.nationalLengths);

    if (rule.nationalLengths.length === 1) {
      const expected = rule.nationalLengths[0]!;
      if (nationalNumber.length < expected) {
        return {
          isValid: false,
          error: `${rule.name} phone number must be ${expected} digits (e.g. ${rule.example}).`,
          normalized,
          countryIso: rule.iso,
          callingCode: rule.callingCode,
          nationalNumber,
        };
      }
      if (nationalNumber.length > expected) {
        return {
          isValid: false,
          error: `${rule.name} phone number must be ${expected} digits (currently ${nationalNumber.length}).`,
          normalized,
          countryIso: rule.iso,
          callingCode: rule.callingCode,
          nationalNumber,
        };
      }
    } else {
      if (nationalNumber.length < minLength) {
        return {
          isValid: false,
          error: `${rule.name} phone number must be at least ${minLength} digits (e.g. ${rule.example}).`,
          normalized,
          countryIso: rule.iso,
          callingCode: rule.callingCode,
          nationalNumber,
        };
      }
      if (nationalNumber.length > maxLength) {
        return {
          isValid: false,
          error: `${rule.name} phone number cannot exceed ${maxLength} digits.`,
          normalized,
          countryIso: rule.iso,
          callingCode: rule.callingCode,
          nationalNumber,
        };
      }
    }

    if (mobileOnly && rule.mobilePrefixes && rule.mobilePrefixes.length > 0) {
      const firstDigit = nationalNumber[0] ?? "";
      if (!rule.mobilePrefixes.includes(firstDigit)) {
        return {
          isValid: false,
          error: `Enter a valid ${rule.name} mobile number (starts with ${rule.mobilePrefixes.join(" or ")}, e.g. ${rule.example}).`,
          normalized,
          countryIso: rule.iso,
          callingCode: rule.callingCode,
          nationalNumber,
        };
      }
    } else if (rule.validFirstDigits && rule.validFirstDigits.length > 0) {
      const firstDigit = nationalNumber[0] ?? "";
      if (!rule.validFirstDigits.includes(firstDigit)) {
        return {
          isValid: false,
          error: `Enter a valid ${rule.name} phone number (e.g. ${rule.example}).`,
          normalized,
          countryIso: rule.iso,
          callingCode: rule.callingCode,
          nationalNumber,
        };
      }
    }
  } else {
    // Generic fallback for any country in the catalog
    if (nationalNumber.length < 5) {
      return {
        isValid: false,
        error: "Phone number is too short.",
        normalized,
        countryIso: resolvedIso,
        callingCode,
        nationalNumber,
      };
    }
    if (nationalNumber.length > 14) {
      return {
        isValid: false,
        error: "Phone number is too long.",
        normalized,
        countryIso: resolvedIso,
        callingCode,
        nationalNumber,
      };
    }
  }

  return {
    isValid: true,
    normalized,
    countryIso: resolvedIso,
    callingCode,
    nationalNumber,
  };
}

export function isValidPhoneNumber(
  input: string | null | undefined,
  options?: PhoneValidationOptions,
): boolean {
  return validatePhoneNumber(input, options).isValid;
}

export function formatPhoneDisplay(
  phone: string,
  countryIso?: string,
): string {
  const normalized = normalizePhoneToE164(phone);
  if (!normalized) return phone;

  const parsed = splitPhoneNumber(normalized, countryIso || "MA");
  const iso = countryIso?.toUpperCase() || parsed.isoCode;
  const rule = COUNTRY_PHONE_RULES[iso];

  if (rule?.format) {
    const formattedNational = rule.format(parsed.nationalNumber);
    return `${parsed.callingCode} ${formattedNational}`.trim();
  }

  if (parsed.nationalNumber) {
    return `${parsed.callingCode} ${parsed.nationalNumber}`;
  }

  return normalized;
}

