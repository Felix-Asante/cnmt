import {
  getCountryCallingCode,
  getExampleNumber,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";

function asCountryCode(iso?: string): CountryCode | undefined {
  const code = iso?.trim().toUpperCase();
  if (!code || code.length !== 2) return undefined;
  try {
    getCountryCallingCode(code as CountryCode);
    return code as CountryCode;
  } catch {
    return undefined;
  }
}

function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const input = trimmed.startsWith("00") ? `+${trimmed.slice(2)}` : trimmed;
  const parsed = parsePhoneNumberFromString(input);
  if (!parsed?.isValid()) return null;
  return parsed.format("E.164");
}

export type PhoneValidationResult = {
  isValid: boolean;
  error?: string;
  normalized?: string;
};

export function validatePhoneNumber(
  input: string | null | undefined,
): PhoneValidationResult {
  const raw = (input ?? "").trim();

  if (!raw) {
    return { isValid: false, error: "Please enter a phone number." };
  }

  const normalized = normalizePhone(raw);
  if (!normalized) {
    return { isValid: false, error: "Please enter a valid phone number." };
  }

  return { isValid: true, normalized };
}

export function normalizePhoneToE164(
  phone: string,
  defaultCountry = "MA",
): string {
  const trimmed = phone.trim();
  if (!trimmed) return "";

  if (trimmed.startsWith("+") || trimmed.startsWith("00")) {
    return normalizePhone(trimmed) ?? "";
  }

  const country = asCountryCode(defaultCountry) ?? "MA";
  const parsed = parsePhoneNumberFromString(trimmed, country);
  return parsed?.isValid() ? parsed.format("E.164") : (parsed?.number ?? "");
}

export function splitPhoneNumber(
  phone: string,
  defaultCountry = "MA",
): {
  callingCode: string;
  nationalNumber: string;
  isoCode: string;
} {
  const country = asCountryCode(defaultCountry) ?? "MA";
  const fallback = {
    callingCode: `+${getCountryCallingCode(country)}`,
    nationalNumber: "",
    isoCode: country,
  };

  if (!phone.trim()) return fallback;

  const parsed =
    parsePhoneNumberFromString(phone.trim()) ??
    parsePhoneNumberFromString(phone.trim(), country);

  if (!parsed) {
    return {
      ...fallback,
      nationalNumber: phone.replace(/\D/g, "").replace(/^0+/, ""),
    };
  }

  return {
    callingCode: `+${parsed.countryCallingCode}`,
    nationalNumber: parsed.nationalNumber,
    isoCode: parsed.country ?? country,
  };
}

export function getPhonePlaceholder(countryIso: string): string {
  const country = asCountryCode(countryIso);
  if (!country) return "Phone number";
  const example = getExampleNumber(country, examples);
  if (!example) return "Phone number";
  return example
    .formatNational()
    .replace(/^0[\s\-.]?/, "")
    .trim();
}
