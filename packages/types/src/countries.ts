export type Country = {
  code: string;
  name: string;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
};

export type AdminCountry = {
  id: number;
  name: string;
  iso_code: string;
  flag: string;
  is_active: boolean;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  created_at: string;
  updated_at: string;
};

export type PaymentChannelType = "BANK" | "MOBILE_MONEY";

export type CreatePaymentChannelPayload = {
  name: string;
  channel_type: PaymentChannelType;
};

export type CreateCountryPayload = {
  name: string;
  iso_code: string;
  flag: string;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  payment_channels: CreatePaymentChannelPayload[];
};

export type CountryPaymentChannel = {
  id: string;
  name: string;
};

export type TransferCountryPaymentChannel = Pick<
  CountryPaymentChannel,
  "id" | "name"
>;

export type TransferSourceCountry = {
  id: number;
  name: string;
  iso_code: string;
  flag: string;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  banks: TransferCountryPaymentChannel[];
  mobile_networks: TransferCountryPaymentChannel[];
};

export type TransferDestinationCountry = {
  source_country_id: number;
  id: number;
  name: string;
  iso_code: string;
  flag: string;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  min_transfer_amount: string;
  max_transfer_amount: string;
  default_exchange_rate: string;
  fee_type: "fixed" | "percentage";
  fee: string;
  banks: TransferCountryPaymentChannel[];
  mobile_networks: TransferCountryPaymentChannel[];
};
