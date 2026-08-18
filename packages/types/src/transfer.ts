import type {
  TransferDestinationCountry,
  TransferSourceCountry,
} from "./countries";

export type TransferOptions = {
  sources: TransferSourceCountry[];

  destinations: TransferDestinationCountry[];
};

export const TRANSFER_STATUSES = [
  "PENDING_PAYMENT",
  "PAYMENT_RECEIVED",
  "VERIFYING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
] as const;

export type TransferStatus = (typeof TRANSFER_STATUSES)[number];

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
