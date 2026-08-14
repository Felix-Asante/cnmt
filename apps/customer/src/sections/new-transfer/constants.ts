import type {
  TransferDestinationCountry,
  TransferSourceCountry,
} from "@repo/types";
import { formatMoney } from "@repo/utils/money";

export type ReceivingMethod = "mobile_money" | "bank";

/** Steps before the request is submitted */
export const REQUEST_STEPS = [
  { id: "transfer", label: "Transfer" },
  { id: "recipient", label: "Recipient" },
] as const;

/** Steps after the request exists — pay & prove */
export const FULFILLMENT_STEPS = [
  { id: "payment", label: "Pay" },
  { id: "upload", label: "Proof" },
  { id: "done", label: "Done" },
] as const;

export const STATIC_QUOTE = {
  estimatedCompletion: "Within 30 minutes after payment verification",
  paymentMethod: "Bank transfer",
  accountName: "C.N International Money Transfer Ltd",
  accountNumber: "40928471",
  sortCode: "23-14-70",
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
  code: string,
  destinations: TransferDestinationCountry[],
) {
  return destinations.find((country) => country.id === Number(code));
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
