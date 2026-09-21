import {
  TransferStatus,
  type ReceivingMethod,
  type Transfer,
  type TransferStatus as TransferStatusValue,
} from "@repo/types";

export const TRANSFER_STATUS_LABELS: Record<TransferStatusValue, string> = {
  [TransferStatus.PENDING_PAYMENT]: "Pending payment",
  [TransferStatus.PAYMENT_RECEIVED]: "Payment received",
  [TransferStatus.VERIFYING]: "Verifying",
  [TransferStatus.PROCESSING]: "Processing",
  [TransferStatus.COMPLETED]: "Completed",
  [TransferStatus.FAILED]: "Failed",
  [TransferStatus.CANCELLED]: "Cancelled",
};

export const TRANSFER_PIPELINE = [
  TransferStatus.PENDING_PAYMENT,
  TransferStatus.PAYMENT_RECEIVED,
  TransferStatus.VERIFYING,
  TransferStatus.PROCESSING,
  TransferStatus.COMPLETED,
] as const;

export type TransferTimelineItem = {
  id: string;
  title: string;
  description: string;
  status: "complete" | "current" | "upcoming";
};

const TIMELINE_STEPS = [
  {
    id: "submitted",
    title: "Request submitted",
    description: "Transfer details saved securely.",
  },
  {
    id: "payment",
    title: "Payment",
    description: "Send the exact amount with your reference.",
  },
  {
    id: "verification",
    title: "Verification",
    description: "We confirm your payment before payout.",
  },
  {
    id: "payout",
    title: "Payout complete",
    description: "Recipient receives the funds.",
  },
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

export function transferStatusHeadline(status: TransferStatusValue) {
  switch (status) {
    case TransferStatus.PENDING_PAYMENT:
      return "Awaiting your payment";
    case TransferStatus.PAYMENT_RECEIVED:
      return "Payment received";
    case TransferStatus.VERIFYING:
      return "Verifying your payment";
    case TransferStatus.PROCESSING:
      return "Sending to recipient";
    case TransferStatus.COMPLETED:
      return "Transfer complete";
    case TransferStatus.FAILED:
      return "Transfer failed";
    case TransferStatus.CANCELLED:
      return "Transfer cancelled";
  }
}

export function transferStatusDescription(status: TransferStatusValue) {
  switch (status) {
    case TransferStatus.PENDING_PAYMENT:
      return "Send the payment using the details from your confirmation. Include your reference so we can match it quickly.";
    case TransferStatus.PAYMENT_RECEIVED:
      return "We’ve received your payment and will verify it before sending funds to the recipient.";
    case TransferStatus.VERIFYING:
      return "Our team is confirming your payment. Most transfers move to payout within 30 minutes.";
    case TransferStatus.PROCESSING:
      return "Your transfer is being paid out to the recipient now.";
    case TransferStatus.COMPLETED:
      return "The recipient has received the funds. No further action is needed.";
    case TransferStatus.FAILED:
      return "This transfer could not be completed. Contact support if you need help.";
    case TransferStatus.CANCELLED:
      return "This transfer was cancelled and will not be processed.";
  }
}

export function transferTimelineItems(
  status: TransferStatusValue,
): TransferTimelineItem[] {
  if (!isPipelineStatus(status)) {
    return [];
  }

  const currentStep = CURRENT_TIMELINE_STEP[status];

  return TIMELINE_STEPS.map((step, index) => {
    const complete =
      currentStep > index || status === TransferStatus.COMPLETED;
    const current = !complete && currentStep === index;

    return {
      ...step,
      status: complete ? "complete" : current ? "current" : "upcoming",
    };
  });
}

export function receivingMethodLabel(method: ReceivingMethod) {
  return method === "MOBILE_MONEY" ? "Mobile money" : "Bank transfer";
}

export function formatPromoDiscount(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${amount}%`;
}

export function transferEstimatedArrival(status: TransferStatusValue) {
  switch (status) {
    case TransferStatus.PENDING_PAYMENT:
      return "After payment is verified";
    case TransferStatus.PAYMENT_RECEIVED:
    case TransferStatus.VERIFYING:
      return "Usually within 30 minutes";
    case TransferStatus.PROCESSING:
      return "In progress now";
    case TransferStatus.COMPLETED:
      return "Delivered";
    case TransferStatus.FAILED:
    case TransferStatus.CANCELLED:
      return "Not applicable";
  }
}

/** True when the customer can still pay and upload proof. */
export function canContinuePayment(transfer: Transfer) {
  if (transfer.status !== TransferStatus.PENDING_PAYMENT) return false;
  const expires = new Date(transfer.expires_at).getTime();
  return !Number.isNaN(expires) && expires > Date.now();
}
