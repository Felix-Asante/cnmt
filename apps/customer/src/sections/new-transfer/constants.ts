import type {
  TransferDestinationCountry,
  TransferSourceCountry,
} from "@repo/types";
export type ReceivingMethod = "mobile_money" | "bank";

export type SendCurrency = "GBP" | "EUR" | "MAD";

export type SenderCountry = {
  code: string;
  name: string;
  flag: string;
  currency: SendCurrency;
};

export type RecipientCountry = {
  code: string;
  name: string;
  flag: string;
  methods: ReceivingMethod[];
  methodLabels: string[];
  networks: string[];
  banks: string[];
  receiveCurrency: string;
};

export type Country = RecipientCountry;

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

export const STEPS = [...REQUEST_STEPS, ...FULFILLMENT_STEPS] as const;

export const CURRENCIES = [
  { code: "GBP", label: "British Pound" },
  { code: "EUR", label: "Euro" },
  { code: "MAD", label: "Moroccan Dirham" },
] as const;

/** Send-from markets from the C.N Connect flyer */
export const SENDER_COUNTRIES: SenderCountry[] = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR" },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", currency: "MAD" },
];

/** Receive markets from the C.N Connect flyer */
export const RECIPIENT_COUNTRIES: RecipientCountry[] = [
  {
    code: "GH",
    name: "Ghana",
    flag: "🇬🇭",
    methods: ["mobile_money", "bank"],
    methodLabels: ["Mobile Money", "Bank"],
    networks: ["MTN MoMo", "Vodafone Cash", "AirtelTigo Money"],
    banks: ["GCB Bank", "Ecobank Ghana", "Absa Bank Ghana", "Stanbic Bank"],
    receiveCurrency: "GHS",
  },
  {
    code: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    methods: ["mobile_money", "bank"],
    methodLabels: ["Mobile Money", "Bank"],
    networks: ["Opay", "PalmPay", "MTN MoMo"],
    banks: ["GTBank", "Access Bank", "Zenith Bank", "UBA"],
    receiveCurrency: "NGN",
  },
  {
    code: "SL",
    name: "Sierra Leone",
    flag: "🇸🇱",
    methods: ["mobile_money", "bank"],
    methodLabels: ["Mobile Money", "Bank"],
    networks: ["Orange Money", "Africell Money"],
    banks: ["Rokel Commercial Bank", "Ecobank Sierra Leone", "Zenith Bank SL"],
    receiveCurrency: "SLE",
  },
  {
    code: "LR",
    name: "Liberia",
    flag: "🇱🇷",
    methods: ["mobile_money", "bank"],
    methodLabels: ["Mobile Money", "Bank"],
    networks: ["Orange Money", "Lonestar MTN MoMo"],
    banks: ["Ecobank Liberia", "GTBank Liberia", "LBDI"],
    receiveCurrency: "LRD",
  },
  {
    code: "KE",
    name: "Kenya",
    flag: "🇰🇪",
    methods: ["mobile_money", "bank"],
    methodLabels: ["Mobile Money", "Bank"],
    networks: ["M-Pesa", "Airtel Money"],
    banks: ["Equity Bank", "KCB", "Co-operative Bank", "Absa Bank Kenya"],
    receiveCurrency: "KES",
  },
  {
    code: "UG",
    name: "Uganda",
    flag: "🇺🇬",
    methods: ["mobile_money", "bank"],
    methodLabels: ["Mobile Money", "Bank"],
    networks: ["MTN MoMo", "Airtel Money"],
    banks: ["Stanbic Bank Uganda", "Centenary Bank", "Equity Bank Uganda"],
    receiveCurrency: "UGX",
  },
  {
    code: "MA",
    name: "Morocco",
    flag: "🇲🇦",
    methods: ["bank"],
    methodLabels: ["Bank"],
    networks: [],
    banks: ["Attijariwafa Bank", "Banque Populaire", "Bank of Africa"],
    receiveCurrency: "MAD",
  },
];

export const COUNTRIES = RECIPIENT_COUNTRIES;

const STATIC_RATES: Record<string, number> = {
  "GBP-GHS": 16.42,
  "GBP-NGN": 1650,
  "GBP-SLE": 28.5,
  "GBP-LRD": 230,
  "GBP-KES": 165,
  "GBP-UGX": 4700,
  "GBP-MAD": 12.8,
  "EUR-GHS": 14.1,
  "EUR-NGN": 1415,
  "EUR-SLE": 24.5,
  "EUR-LRD": 198,
  "EUR-KES": 142,
  "EUR-UGX": 4050,
  "EUR-MAD": 10.9,
  "MAD-GHS": 1.28,
  "MAD-NGN": 129,
  "MAD-SLE": 2.25,
  "MAD-LRD": 18,
  "MAD-KES": 12.9,
  "MAD-UGX": 368,
  "MAD-MAD": 1,
};

const STATIC_FEES: Record<string, number> = {
  GBP: 2.99,
  EUR: 3.49,
  MAD: 29,
};

export const STATIC_QUOTE = {
  estimatedCompletion: "Within 30 minutes after payment verification",
  paymentMethod: "Bank transfer",
  accountName: "C.N International Money Transfer Ltd",
  accountNumber: "40928471",
  sortCode: "23-14-70",
  referencePrefix: "CN",
} as const;

export function getSenderCountry(
  code: string,
  sources: TransferSourceCountry[],
) {
  return sources.find((country) => country.id === Number(code));
}

export function getRecipientCountry(
  code: string,
  destinations: TransferDestinationCountry[],
) {
  return destinations.find((country) => country.id === Number(code));
}

export function getCountry(
  code: string,
  destinations: TransferDestinationCountry[],
) {
  return getRecipientCountry(code, destinations);
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
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

export function createReferenceNumber() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const random = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${STATIC_QUOTE.referencePrefix}-${stamp}${random}`;
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
