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

export const TRANSFER_STATUS_FILTERS: Array<{
  value?: TransferStatus;
  label: string;
}> = [
  { label: "All" },
  { value: "PENDING_PAYMENT", label: "Pending" },
  { value: "PAYMENT_RECEIVED", label: "Received" },
  { value: "VERIFYING", label: "Verifying" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const TRANSFER_PIPELINE = [
  "PENDING_PAYMENT",
  "PAYMENT_RECEIVED",
  "VERIFYING",
  "PROCESSING",
  "COMPLETED",
] as const;

export const TRANSFER_PIPELINE_SHORT: Record<
  (typeof TRANSFER_PIPELINE)[number],
  string
> = {
  PENDING_PAYMENT: "Pending",
  PAYMENT_RECEIVED: "Received",
  VERIFYING: "Verify",
  PROCESSING: "Payout",
  COMPLETED: "Done",
};

export type TransferNextAction = {
  key: "verify" | "process" | "complete";
  label: string;
};

export type TransferWorkflow = {
  summary: string;
  next: TransferNextAction | null;
  reject: boolean;
  cancel: boolean;
};

export function workflowForStatus(status: TransferStatus): TransferWorkflow {
  switch (status) {
    case "PENDING_PAYMENT":
      return {
        summary: "Waiting for the sender to pay. No payout action yet.",
        next: null,
        reject: false,
        cancel: true,
      };
    case "PAYMENT_RECEIVED":
      return {
        summary: "Proof is on file. Confirm the amount before paying out.",
        next: { key: "verify", label: "Verify payment" },
        reject: true,
        cancel: true,
      };
    case "VERIFYING":
      return {
        summary: "Payment is verified. Send the funds to the recipient.",
        next: { key: "process", label: "Start payout" },
        reject: false,
        cancel: true,
      };
    case "PROCESSING":
      return {
        summary: "Payout is in progress. Confirm the recipient has been paid.",
        next: { key: "complete", label: "Mark as paid" },
        reject: false,
        cancel: true,
      };
    case "COMPLETED":
      return {
        summary: "This transfer is finished. No further action.",
        next: null,
        reject: false,
        cancel: false,
      };
    case "FAILED":
      return {
        summary: "This transfer failed and cannot continue.",
        next: null,
        reject: false,
        cancel: false,
      };
    case "CANCELLED":
      return {
        summary: "This transfer was cancelled.",
        next: null,
        reject: false,
        cancel: false,
      };
  }
}

export function receivingMethodLabel(method: ReceivingMethod) {
  return method === "MOBILE_MONEY" ? "Mobile money" : "Bank";
}

export function isPipelineStatus(
  status: TransferStatus,
): status is (typeof TRANSFER_PIPELINE)[number] {
  return (TRANSFER_PIPELINE as readonly string[]).includes(status);
}
