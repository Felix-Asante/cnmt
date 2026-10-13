import type {
  TransferCountryPaymentChannel,
  TransferDestinationCountry,
  TransferSourceCountry,
} from "@repo/types";
import { formatMoney } from "@repo/utils/money";

export type ReceivingMethod = "mobile_money" | "bank";

export const REQUEST_STEP_IDS = ["transfer", "recipient"] as const;
export const FULFILLMENT_STEP_IDS = ["payment", "upload", "done"] as const;

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
  promoDiscountPercentage?: string | number | null,
): TransferQuote {
  const amount = Number(sendAmount);
  const hasAmount =
    Boolean(sendAmount) && Number.isFinite(amount) && amount > 0;
  const receiveAmount = hasAmount ? Math.max(amount * rate - fee, 0) : 0;
  const payAmount = hasAmount
    ? applyPromoDiscount(amount, promoDiscountPercentage)
    : 0;

  return {
    fee,
    feeLabel: formatMoney(fee, sendCurrency),
    receiveAmount,
    receiveLabel: hasAmount
      ? formatMoney(receiveAmount, receiveCurrency)
      : `— ${receiveCurrency}`,
    sendLabel: hasAmount
      ? formatMoney(payAmount, sendCurrency)
      : `— ${sendCurrency}`,
    hasAmount,
  };
}

export function toAmountInputValue(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "";
  return (Math.round(value * 100) / 100).toFixed(2);
}

export function sendAmountFromReceive(
  receiveAmount: number,
  rate: number,
  feeType: "fixed" | "percentage",
  fee: number,
) {
  if (!(receiveAmount > 0) || !(rate > 0)) return 0;

  if (feeType === "fixed") {
    return Math.max((receiveAmount + fee) / rate, 0);
  }

  const factor = rate - fee / 100;
  let send = receiveAmount / Math.max(factor, Number.EPSILON);
  for (let i = 0; i < 4; i++) {
    const computedFee = Math.floor((send * fee) / 100);
    send = (receiveAmount + computedFee) / rate;
  }
  return Math.max(send, 0);
}

export function receiveAmountFromSend(
  sendAmount: number,
  rate: number,
  feeType: "fixed" | "percentage",
  fee: number,
) {
  if (!(sendAmount > 0) || !(rate > 0)) return 0;
  const resolvedFee = calculateFee(sendAmount, feeType, fee);
  return Math.max(sendAmount * rate - resolvedFee, 0);
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

export function applyPromoDiscount(
  amount: number,
  discountPercentage?: string | number | null,
) {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (
    discountPercentage === undefined ||
    discountPercentage === null ||
    discountPercentage === ""
  ) {
    return Math.round(amount * 100) / 100;
  }
  const pct = Number(discountPercentage);
  if (!Number.isFinite(pct) || pct <= 0) {
    return Math.round(amount * 100) / 100;
  }
  const discount = Math.round(((amount * pct) / 100) * 100) / 100;
  return Math.max(Math.round((amount - discount) * 100) / 100, 0);
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

export function resolveTransferFee(input: {
  amount: number;
  feeType: "fixed" | "percentage";
  fee: number;
  extraFee?: number;
}) {
  let total = calculateFee(input.amount, input.feeType, input.fee);
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
