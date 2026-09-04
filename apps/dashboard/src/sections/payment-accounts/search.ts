export type PaymentAccountsSearch = {
  country?: number;
  method?: "BANK" | "MOBILE_MONEY";
  active?: "true" | "false";
  q?: string;
};

function optionalString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function optionalId(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(n) || n <= 0) return undefined;
  return n;
}

function optionalMethod(
  value: unknown,
): "BANK" | "MOBILE_MONEY" | undefined {
  if (value === "BANK" || value === "MOBILE_MONEY") return value;
  return undefined;
}

function optionalActive(value: unknown): "true" | "false" | undefined {
  if (value === "true" || value === "false") return value;
  return undefined;
}

export function parsePaymentAccountsSearch(
  search: Record<string, unknown>,
): PaymentAccountsSearch {
  return compactPaymentAccountsSearch({
    country: optionalId(search.country),
    method: optionalMethod(search.method),
    active: optionalActive(search.active),
    q: optionalString(search.q),
  });
}

export function compactPaymentAccountsSearch(
  search: PaymentAccountsSearch,
): PaymentAccountsSearch {
  return {
    ...(search.country ? { country: search.country } : {}),
    ...(search.method ? { method: search.method } : {}),
    ...(search.active ? { active: search.active } : {}),
    ...(search.q ? { q: search.q } : {}),
  };
}

export function hasPaymentAccountFilters(search: PaymentAccountsSearch) {
  return Boolean(search.country || search.method || search.active || search.q);
}
