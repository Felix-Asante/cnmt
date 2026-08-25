import type {
  ReceivingMethod,
  TransferStatus,
} from "./transfer";

export type DashboardMoneyByCurrency = {
  currency: string;
  amount: string;
};

export type DashboardOverview = {
  total_transfers: number;
  pending_payment: number;
  payment_verification: number;
  processing: number;
  completed: number;
  cancelled: number;
  failed: number;
  total_transfer_volume: DashboardMoneyByCurrency[];
  total_fees: DashboardMoneyByCurrency[];
};

export type DashboardTransferSummary = {
  id: string;
  reference: string;
  status: TransferStatus;
  source_country: string;
  destination_country: string;
  amount_sent: string;
  currency_code: string;
  currency_symbol: string;
  sender_phone: string;
  receiving_account_name: string;
  receiving_method: ReceivingMethod;
  expires_at?: string;
  created_at: string;
};

export type DashboardActionRequired = {
  payment_verification_count: number;
  processing_count: number;
  expiring_count: number;
  transfers: DashboardTransferSummary[];
};

export type DashboardVolumePoint = {
  date: string;
  currency: string;
  transfer_count: number;
  volume: string;
};

export type DashboardStatusCount = {
  status: TransferStatus;
  count: number;
};

export type DashboardTopRoute = {
  route_id: string;
  source_country: string;
  source_iso_code: string;
  source_flag: string;
  source_currency: string;
  destination_country: string;
  destination_iso_code: string;
  destination_flag: string;
  destination_currency: string;
  transfer_count: number;
  transfer_volume: string;
};

export type DashboardActivityItem = {
  status: TransferStatus;
  reference: string;
  actor: string;
  note?: string | null;
  created_at: string;
};

export type DashboardPeriod = {
  from: string;
  to: string;
};

export type DashboardResponse = {
  period: DashboardPeriod;
  overview: DashboardOverview;
  action_required: DashboardActionRequired;
  volume: DashboardVolumePoint[];
  status_distribution: DashboardStatusCount[];
  recent_transfers: DashboardTransferSummary[];
  top_routes: DashboardTopRoute[];
  recent_activity: DashboardActivityItem[];
};
