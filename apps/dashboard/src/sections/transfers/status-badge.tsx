import type { TransferStatus } from "@repo/types";
import { Badge } from "@repo/ui/badge";
import { TRANSFER_STATUS_LABELS } from "./constants";

const STATUS_VARIANT = {
  PENDING_PAYMENT: "gold",
  PAYMENT_RECEIVED: "navy",
  VERIFYING: "navy",
  PROCESSING: "navy",
  COMPLETED: "success",
  FAILED: "brand",
  CANCELLED: "neutral",
} as const;

export function TransferStatusBadge({ status }: { status: TransferStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {TRANSFER_STATUS_LABELS[status]}
    </Badge>
  );
}
