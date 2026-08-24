export const FEE_TYPES = ["fixed", "percentage"] as const;

export type FeeType = (typeof FEE_TYPES)[number];

export type TransferRoute = {
  id: string;
  source_country_id: number;
  destination_country_id: number;
  is_active: boolean;
  default_exchange_rate: string | number;
  fee: string | number;
  fee_type: FeeType;
  min_transfer_amount: string | number;
  max_transfer_amount: string | number;
  created_at: string;
  updated_at: string;
};

export type CreateRoutePayload = {
  source_country_id: number;
  dest_country_id: number;
  exchange_rate: string;
  fee_type: FeeType;
  fee: string;
  min_transfer_amount: string;
  max_transfer_amount: string;
};

export type UpdateRoutePayload = {
  exchange_rate: string;
  fee_type: FeeType;
  fee: string;
  min_transfer_amount: string;
  max_transfer_amount: string;
};
