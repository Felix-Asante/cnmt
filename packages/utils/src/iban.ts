export const IBAN_CHANNEL_NAME = "IBAN";

export function isIbanChannelName(name: string | null | undefined) {
  return (name ?? "").trim().toUpperCase() === IBAN_CHANNEL_NAME;
}

export function normalizeIban(raw: string) {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export function formatIbanDisplay(raw: string) {
  const normalized = normalizeIban(raw);
  return normalized.replace(/(.{4})(?=.)/g, "$1 ").trim();
}

export function maskIban(raw: string) {
  const normalized = normalizeIban(raw);
  if (normalized.length < 8) return normalized;
  return `${normalized.slice(0, 4)} •••• ${normalized.slice(-4)}`;
}

/** ISO 13616 mod-97 checksum (same rules as the API). */
export function isValidIban(raw: string) {
  const iban = normalizeIban(raw);
  if (iban.length < 15 || iban.length > 34) return false;
  if (!/^[A-Z]{2}[0-9A-Z]+$/.test(iban)) return false;

  const rearranged = iban.slice(4) + iban.slice(0, 4);
  let expanded = "";
  for (const char of rearranged) {
    const code = char.charCodeAt(0);
    if (code >= 48 && code <= 57) {
      expanded += char;
    } else if (code >= 65 && code <= 90) {
      expanded += String(code - 55);
    } else {
      return false;
    }
  }

  let remainder = 0;
  for (const digit of expanded) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder === 1;
}

export function getIbanChannel<T extends { name: string }>(
  banks: T[] | null | undefined,
) {
  return banks?.find((bank) => isIbanChannelName(bank.name)) ?? null;
}

export function destinationSupportsIban(
  banks: Array<{ name: string }> | null | undefined,
) {
  return Boolean(getIbanChannel(banks));
}

export function localBankChannels<T extends { name: string }>(
  banks: T[] | null | undefined,
) {
  return (banks ?? []).filter((bank) => !isIbanChannelName(bank.name));
}
