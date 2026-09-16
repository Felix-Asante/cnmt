import type {
  TransferDestinationCountry,
  TransferSourceCountry,
} from "./countries";

export type TransferOptions = {
  sources: TransferSourceCountry[];

  destinations: TransferDestinationCountry[];
};

export const TransferStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  PAYMENT_RECEIVED: "PAYMENT_RECEIVED",
  VERIFYING: "VERIFYING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
} as const;

export type TransferStatus =
  (typeof TransferStatus)[keyof typeof TransferStatus];

export const TRANSFER_STATUSES = [
  TransferStatus.PENDING_PAYMENT,
  TransferStatus.PAYMENT_RECEIVED,
  TransferStatus.VERIFYING,
  TransferStatus.PROCESSING,
  TransferStatus.COMPLETED,
  TransferStatus.FAILED,
  TransferStatus.CANCELLED,
] as const;

export type ReceivingMethod = "BANK" | "MOBILE_MONEY";

export type TransferCountry = {
  id: number;
  name: string;
  flag?: string;
  currency_code?: string;
  currency_symbol?: string;
};

export type TransferRecipient = {
  name: string;
  phone?: string;
  receiving_method: ReceivingMethod;
  network_name?: string;
  bank_name?: string;
  account_number?: string;
};

export type TransferPaymentInstructions = {
  payment_account_id?: string;
  payment_method?: ReceivingMethod;
  account_name?: string;
  account_number?: string;
  channel_name?: string;
  currency_code?: string;
};

export type Transfer = {
  id: string;
  reference: string;
  status: TransferStatus;
  route: {
    source_country: TransferCountry;
    destination_country: TransferCountry;
  };
  amount_sent: string | number;
  amount_received: string | number;
  exchange_rate: string | number;
  fee: string | number;
  sender_phone: string;
  payment_proof_key?: string;
  payment_proof_url?: string;
  payment_instructions?: TransferPaymentInstructions;
  recipient: TransferRecipient;
  notes?: string;
  expires_at: string;
  created_at: string;
};

export type TransferListResponse = {
  transfers: Transfer[];
  total: number;
  page: number;
  limit: number;
};

export type TransferAdminActionResponse = {
  reference: string;
  status: TransferStatus;
};
