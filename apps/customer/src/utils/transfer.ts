import {
  TransferStatus,
  type Transfer,
  type TransferStatus as TransferStatusValue,
} from "@repo/types";

export const TRANSFER_PIPELINE = [
  TransferStatus.PENDING_PAYMENT,
  TransferStatus.PAYMENT_RECEIVED,
  TransferStatus.VERIFYING,
  TransferStatus.PROCESSING,
  TransferStatus.COMPLETED,
] as const;

export type TransferTimelineItem = {
  id: "submitted" | "payment" | "verification" | "payout";
  status: "complete" | "current" | "upcoming";
};

const TIMELINE_STEP_IDS = [
  "submitted",
  "payment",
  "verification",
  "payout",
] as const;

const CURRENT_TIMELINE_STEP: Record<
  (typeof TRANSFER_PIPELINE)[number],
  number
> = {
  [TransferStatus.PENDING_PAYMENT]: 1,
  [TransferStatus.PAYMENT_RECEIVED]: 2,
  [TransferStatus.VERIFYING]: 2,
  [TransferStatus.PROCESSING]: 3,
  [TransferStatus.COMPLETED]: 4,
};

export function isPipelineStatus(
  status: TransferStatusValue,
): status is (typeof TRANSFER_PIPELINE)[number] {
  return (TRANSFER_PIPELINE as readonly string[]).includes(status);
}

export function transferStatusBadgeVariant(status: TransferStatusValue) {
  switch (status) {
    case TransferStatus.PENDING_PAYMENT:
      return "gold" as const;
    case TransferStatus.PAYMENT_RECEIVED:
    case TransferStatus.VERIFYING:
    case TransferStatus.PROCESSING:
      return "navy" as const;
    case TransferStatus.COMPLETED:
      return "success" as const;
    case TransferStatus.FAILED:
      return "brand" as const;
    case TransferStatus.CANCELLED:
      return "neutral" as const;
  }
}

export function transferTimelineItems(
  status: TransferStatusValue,
): TransferTimelineItem[] {
  if (!isPipelineStatus(status)) {
    return [];
  }

  const currentStep = CURRENT_TIMELINE_STEP[status];

  return TIMELINE_STEP_IDS.map((id, index) => {
    const complete =
      currentStep > index || status === TransferStatus.COMPLETED;
    const current = !complete && currentStep === index;

    return {
      id,
      status: complete ? "complete" : current ? "current" : "upcoming",
    };
  });
}

export function formatPromoDiscount(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${amount}%`;
}

/** True when the customer can still pay and upload proof. */
export function canContinuePayment(transfer: Transfer) {
  if (transfer.status !== TransferStatus.PENDING_PAYMENT) return false;
  const expires = new Date(transfer.expires_at).getTime();
  return !Number.isNaN(expires) && expires > Date.now();
}
