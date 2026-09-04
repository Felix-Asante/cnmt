import type { ReceivingMethod } from "./transfer";

export type PaymentAccount = {
  id: string;
  country_id: number;
  payment_method: ReceivingMethod;
  name: string;
  account_name: string;
  account_number?: string;
  phone_number?: string;
  sort_code?: string;
  iban?: string;
  payment_channel_id?: string;
  channel_name?: string;
  currency_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreatePaymentAccountPayload = {
  country_id: number;
  payment_method: ReceivingMethod;
  name: string;
  account_name: string;
  account_number?: string;
  phone_number?: string;
  sort_code?: string;
  iban?: string;
  payment_channel_id: string;
  currency_code: string;
};

export type UpdatePaymentAccountPayload = {
  name: string;
  account_name: string;
  account_number?: string;
  phone_number?: string;
  sort_code?: string;
  iban?: string;
  payment_channel_id: string;
  currency_code: string;
};
