export type ReceivingMethod = "mobile_money" | "bank";

export type SenderCountry = {
  code: string;
  name: string;
  flag: string;
  currency: "GBP" | "EUR" | "USD";
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
  { code: "USD", label: "US Dollar" },
] as const;

export const SENDER_COUNTRIES: SenderCountry[] = [
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR" },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR" },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD" },
];

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
    code: "SN",
    name: "Senegal",
    flag: "🇸🇳",
    methods: ["mobile_money", "bank"],
    methodLabels: ["Mobile Money", "Bank"],
    networks: ["Orange Money", "Wave", "Free Money"],
    banks: ["SGBS", "Ecobank Senegal", "Banque Atlantique"],
    receiveCurrency: "XOF",
  },
  {
    code: "CI",
    name: "Ivory Coast",
    flag: "🇨🇮",
    methods: ["mobile_money", "bank"],
    methodLabels: ["Mobile Money", "Bank"],
    networks: ["Orange Money", "MTN MoMo", "Wave"],
    banks: ["SGBCI", "Ecobank Côte d'Ivoire", "NSIA Banque"],
    receiveCurrency: "XOF",
  },
  {
    code: "CM",
    name: "Cameroon",
    flag: "🇨🇲",
    methods: ["mobile_money", "bank"],
    methodLabels: ["Mobile Money", "Bank"],
    networks: ["MTN MoMo", "Orange Money"],
    banks: ["Afriland First Bank", "Ecobank Cameroon", "UBA Cameroon"],
    receiveCurrency: "XAF",
  },
  {
    code: "CG",
    name: "Congo",
    flag: "🇨🇬",
    methods: ["mobile_money", "bank"],
    methodLabels: ["Mobile Money", "Bank"],
    networks: ["Airtel Money", "MTN MoMo"],
    banks: ["BGFI Bank", "Ecobank Congo", "Crédit du Congo"],
    receiveCurrency: "XAF",
  },
  {
    code: "MA",
    name: "Morocco",
    flag: "🇲🇦",
    methods: ["bank"],
    methodLabels: ["Bank"],
    networks: [],
    banks: ["Attijariwafa Bank", "Banque Populaire", "BMCE Bank"],
    receiveCurrency: "MAD",
  },
];

export const COUNTRIES = RECIPIENT_COUNTRIES;

const STATIC_RATES: Record<string, number> = {
  "GBP-GHS": 16.42,
  "GBP-NGN": 1650,
  "GBP-XOF": 790,
  "GBP-XAF": 790,
  "GBP-MAD": 12.8,
  "EUR-GHS": 14.1,
  "EUR-NGN": 1415,
  "EUR-XOF": 655.957,
  "EUR-XAF": 655.957,
  "EUR-MAD": 10.9,
  "USD-GHS": 12.95,
  "USD-NGN": 1300,
  "USD-XOF": 600,
  "USD-XAF": 600,
  "USD-MAD": 10.05,
};

const STATIC_FEES: Record<string, number> = {
  GBP: 2.99,
  EUR: 3.49,
  USD: 3.99,
};

export const STATIC_QUOTE = {
  estimatedCompletion: "Within 30 minutes after payment verification",
  paymentMethod: "Bank transfer",
  accountName: "C.N International Money Transfer Ltd",
  accountNumber: "40928471",
  sortCode: "23-14-70",
  referencePrefix: "CN",
} as const;

export function getSenderCountry(code: string) {
  return SENDER_COUNTRIES.find((country) => country.code === code);
}

export function getRecipientCountry(code: string) {
  return RECIPIENT_COUNTRIES.find((country) => country.code === code);
}

export function getCountry(code: string) {
  return getRecipientCountry(code);
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
  rate: number;
  rateLabel: string;
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
): TransferQuote {
  const rateKey = `${sendCurrency}-${receiveCurrency}`;
  const rate = STATIC_RATES[rateKey] ?? 1;
  const fee = STATIC_FEES[sendCurrency] ?? 2.99;
  const amount = Number(sendAmount);
  const hasAmount = Boolean(sendAmount) && Number.isFinite(amount) && amount > 0;
  const receiveAmount = hasAmount ? amount * rate : 0;

  return {
    rate,
    rateLabel: `1 ${sendCurrency} = ${rate.toLocaleString("en-GB", {
      maximumFractionDigits: 3,
    })} ${receiveCurrency}`,
    fee,
    feeLabel: formatMoney(fee, sendCurrency),
    receiveAmount,
    receiveLabel: hasAmount
      ? formatMoney(receiveAmount, receiveCurrency)
      : `— ${receiveCurrency}`,
    sendLabel: hasAmount ? formatMoney(amount, sendCurrency) : `— ${sendCurrency}`,
    hasAmount,
  };
}

export function createReferenceNumber() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  const random = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${STATIC_QUOTE.referencePrefix}-${stamp}${random}`;
}
