import { formatMoney } from "@repo/utils/money";

export function parseAmount(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return Number.NaN;
}

export function formatAmount(
  value: string | number | null | undefined,
  currencyCode?: string,
  currencySymbol?: string,
) {
  const amount = parseAmount(value);
  if (!Number.isFinite(amount)) return "—";

  const code = currencyCode?.trim();
  if (code) return formatMoney(amount, code);

  const formatted = new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  const symbol = currencySymbol?.trim();
  return symbol ? `${symbol}${formatted}` : formatted;
}

export function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = date.getTime() - Date.now();
  const absSeconds = Math.round(Math.abs(diffMs) / 1000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 60) return rtf.format(Math.round(diffMs / 1000), "second");
  const absMinutes = Math.round(absSeconds / 60);
  if (absMinutes < 60) return rtf.format(Math.round(diffMs / 60000), "minute");
  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) return rtf.format(Math.round(diffMs / 3600000), "hour");
  const absDays = Math.round(absHours / 24);
  if (absDays < 30) return rtf.format(Math.round(diffMs / 86400000), "day");
  return formatDateTime(value);
}

export function formatFee(
  fee: string | number,
  feeType: string,
  currencyCode?: string,
  currencySymbol?: string,
) {
  if (feeType === "percentage") {
    const amount = parseAmount(fee);
    if (!Number.isFinite(amount)) return "—";
    return `${amount}%`;
  }
  return formatAmount(fee, currencyCode, currencySymbol);
}

export function formatExchangeRate(
  rate: string | number,
  sourceCode?: string,
  destCode?: string,
) {
  const amount = parseAmount(rate);
  if (!Number.isFinite(amount)) return "—";

  const formatted = new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 6,
  }).format(amount);
  const source = sourceCode?.trim() || "source";
  const dest = destCode?.trim() || "destination";
  return `1 ${source} = ${formatted} ${dest}`;
}
