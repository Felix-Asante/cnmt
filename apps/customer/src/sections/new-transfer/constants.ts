import type {
  TransferCountryPaymentChannel,
  TransferDestinationCountry,
  TransferSourceCountry,
} from "@repo/types";
import { formatMoney } from "@repo/utils/money";

export type ReceivingMethod = "mobile_money" | "bank";

export const REQUEST_STEPS = [
  { id: "transfer", label: "Transfer" },
  { id: "recipient", label: "Recipient" },
] as const;

export const FULFILLMENT_STEPS = [
  { id: "payment", label: "Pay" },
  { id: "upload", label: "Proof" },
  { id: "done", label: "Done" },
] as const;

export const STATIC_QUOTE = {
  estimatedCompletion: "Within 30 minutes after payment verification",
} as const;

export function getSenderCountry(
  code: string,
  sources: TransferSourceCountry[],
) {
  return sources.find((country) => country.id === Number(code));
}

export function firstDestinationForSource(
  sourceId: string,
  destinations: TransferDestinationCountry[],
) {
  return destinations.find(
    (country) => country.source_country_id.toString() === sourceId,
  );
}

export function getRecipientCountry(
  destinationCountryCode: string,
  sourceCountryCode: string,
  destinations: TransferDestinationCountry[],
) {
  return destinations.find(
    (country) =>
      country.id === Number(destinationCountryCode) &&
      country.source_country_id === Number(sourceCountryCode),
  );
}

export type TransferQuote = {
  fee: number;
  feeLabel: string;
  receiveAmount: number;
  receiveLabel: string;
  sendLabel: string;
  hasAmount: boolean;
};

export function getTransferQuote(
  sendAmount: string,
  sendCurrency: string,
  receiveCurrency: string,
  rate: number,
  fee: number,
): TransferQuote {
  const amount = Number(sendAmount);
  const hasAmount =
    Boolean(sendAmount) && Number.isFinite(amount) && amount > 0;
  const receiveAmount = hasAmount ? Math.max(amount * rate - fee, 0) : 0;

  return {
    fee,
    feeLabel: formatMoney(fee, sendCurrency),
    receiveAmount,
    receiveLabel: hasAmount
      ? formatMoney(receiveAmount, receiveCurrency)
      : `— ${receiveCurrency}`,
    sendLabel: hasAmount
      ? formatMoney(amount, sendCurrency)
      : `— ${sendCurrency}`,
    hasAmount,
  };
}

export function calculateFee(
  amount: number,
  feeType: "fixed" | "percentage",
  fee: number,
) {
  if (feeType === "fixed") {
    return fee;
  }
  return Math.floor((amount * fee) / 100) ?? 0;
}

/** Mirrors backend promo fee discount (percentage off the route fee only). */
export function applyPromoDiscount(
  fee: number,
  discountPercentage: string | number,
) {
  const pct = Number(discountPercentage);
  if (!Number.isFinite(fee) || !Number.isFinite(pct) || pct <= 0) return fee;
  const discount = Math.round(((fee * pct) / 100) * 100) / 100;
  return Math.max(Math.round((fee - discount) * 100) / 100, 0);
}

/** Channel extra fee from transfer options (0 when unset / invalid). */
export function getChannelExtraFee(
  channels: TransferCountryPaymentChannel[] | undefined,
  channelId: string | undefined,
) {
  if (!channels?.length || !channelId) return 0;
  const channel = channels.find((item) => item.id === channelId);
  const extra = Number(channel?.extra_fee ?? 0);
  return Number.isFinite(extra) && extra > 0 ? extra : 0;
}

/**
 * Mirrors create-transfer fee math:
 * route fee → promo discount (route fee only) → + channel extra_fee.
 */
export function resolveTransferFee(input: {
  amount: number;
  feeType: "fixed" | "percentage";
  fee: number;
  extraFee?: number;
  promoDiscountPercentage?: string | number | null;
}) {
  let total = calculateFee(input.amount, input.feeType, input.fee);
  if (
    input.promoDiscountPercentage !== undefined &&
    input.promoDiscountPercentage !== null &&
    input.promoDiscountPercentage !== ""
  ) {
    total = applyPromoDiscount(total, input.promoDiscountPercentage);
  }
  const extra = Number(input.extraFee ?? 0);
  if (Number.isFinite(extra) && extra > 0) {
    total = Math.round((total + extra) * 100) / 100;
  }
  return Math.max(total, 0);
}

export function channelOptionLabel(
  channel: TransferCountryPaymentChannel,
  currencyCode: string,
) {
  const extra = getChannelExtraFee([channel], channel.id);
  if (!extra) return channel.name;
  return `${channel.name} · +${formatMoney(extra, currencyCode)}`;
}
