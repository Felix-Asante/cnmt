export type Country = {
  code: string;
  name: string;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
};

export type CountryPaymentChannel = {
  id: number;
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
