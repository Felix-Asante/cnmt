export function formatMoney(amount: number, currency: string) {
  const code = currency.trim().toUpperCase();
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${code || currency}`;
  }
}

export function amountOutOfRangeMessage(
  amount: number,
  min: number,
  max: number,
  currency: string,
  entity = "amount",
) {
  if (!Number.isFinite(amount)) return "Enter a valid amount.";
  if (Number.isFinite(min) && min > 0 && amount < min) {
    return `Minimum ${entity} is ${formatMoney(min, currency)}.`;
  }
  if (Number.isFinite(max) && max > 0 && amount > max) {
    return `Maximum ${entity} is ${formatMoney(max, currency)}.`;
  }
  return null;
}
