import type { ReceivingMethod, TransferStatus } from "@repo/types";

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  PAYMENT_RECEIVED: "Payment received",
  VERIFYING: "Verifying",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export const TRANSFER_PIPELINE = [
  "PENDING_PAYMENT",
  "PAYMENT_RECEIVED",
  "VERIFYING",
  "PROCESSING",
  "COMPLETED",
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
  PENDING_PAYMENT: 1,
  PAYMENT_RECEIVED: 2,
  VERIFYING: 2,
  PROCESSING: 3,
  COMPLETED: 4,
};

export function isPipelineStatus(
  status: TransferStatus,
): status is (typeof TRANSFER_PIPELINE)[number] {
  return (TRANSFER_PIPELINE as readonly string[]).includes(status);
}

export function transferStatusBadgeVariant(status: TransferStatus) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "gold" as const;
    case "PAYMENT_RECEIVED":
    case "VERIFYING":
    case "PROCESSING":
      return "navy" as const;
    case "COMPLETED":
      return "success" as const;
    case "FAILED":
      return "brand" as const;
    case "CANCELLED":
      return "neutral" as const;
  }
}

export function transferStatusHeadline(status: TransferStatus) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Awaiting your payment";
    case "PAYMENT_RECEIVED":
      return "Payment received";
    case "VERIFYING":
      return "Verifying your payment";
    case "PROCESSING":
      return "Sending to recipient";
    case "COMPLETED":
      return "Transfer complete";
    case "FAILED":
      return "Transfer failed";
    case "CANCELLED":
      return "Transfer cancelled";
  }
}

export function transferStatusDescription(status: TransferStatus) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Send the payment using the details from your confirmation. Include your reference so we can match it quickly.";
    case "PAYMENT_RECEIVED":
      return "We’ve received your payment and will verify it before sending funds to the recipient.";
    case "VERIFYING":
      return "Our team is confirming your payment. Most transfers move to payout within 30 minutes.";
    case "PROCESSING":
      return "Your transfer is being paid out to the recipient now.";
    case "COMPLETED":
      return "The recipient has received the funds. No further action is needed.";
    case "FAILED":
      return "This transfer could not be completed. Contact support if you need help.";
    case "CANCELLED":
      return "This transfer was cancelled and will not be processed.";
  }
}

export function transferTimelineItems(
  status: TransferStatus,
): TransferTimelineItem[] {
  if (!isPipelineStatus(status)) {
    return [];
  }

  const currentStep = CURRENT_TIMELINE_STEP[status];

  return TIMELINE_STEPS.map((step, index) => {
    const complete = currentStep > index || status === "COMPLETED";
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

export function transferEstimatedArrival(status: TransferStatus) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "After payment is verified";
    case "PAYMENT_RECEIVED":
    case "VERIFYING":
      return "Usually within 30 minutes";
    case "PROCESSING":
      return "In progress now";
    case "COMPLETED":
      return "Delivered";
    case "FAILED":
    case "CANCELLED":
      return "Not applicable";
  }
}
