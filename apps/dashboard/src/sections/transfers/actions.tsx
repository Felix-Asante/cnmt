import { useState, useTransition } from "react";
import { useRouter } from "@tanstack/react-router";
import type { Transfer } from "@repo/types";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/toast";
import { getErrorMessage } from "@/utils/request";
import {
  cancelTransfer,
  completeTransfer,
  processTransfer,
  rejectPayment,
  verifyPayment,
} from "./api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { workflowForStatus } from "./constants";

type DialogKind = "reject" | "cancel" | "complete";

export function TransferWorkflow({ transfer }: { transfer: Transfer }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const workflow = workflowForStatus(transfer.status);

  function run(
    name: string,
    task: () => Promise<unknown>,
    success: string,
  ) {
    if (isPending) return;
    setPendingAction(name);
    startTransition(async () => {
      try {
        await task();
        toast.success(success);
        setDialog(null);
        await router.invalidate();
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    });
  }

  function onNext() {
    if (!workflow.next) return;
    if (workflow.next.key === "verify") {
      run("verify", () => verifyPayment(transfer.id), "Payment verified.");
      return;
    }
    if (workflow.next.key === "process") {
      run("process", () => processTransfer(transfer.id), "Payout started.");
      return;
    }
    setDialog("complete");
  }

  return (
    <section className="space-y-3">
      <p className="text-sm leading-relaxed text-muted">{workflow.summary}</p>

      {workflow.next ? (
        <Button
          type="button"
          className="w-full"
          loading={pendingAction === workflow.next.key}
          disabled={isPending}
          onClick={onNext}
        >
          {workflow.next.label}
        </Button>
      ) : null}

      {workflow.reject || workflow.cancel ? (
        <div className="flex flex-wrap gap-2">
          {workflow.reject ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => setDialog("reject")}
            >
              Reject payment
            </Button>
          ) : null}
          {workflow.cancel ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => setDialog("cancel")}
            >
              Cancel transfer
            </Button>
          ) : null}
        </div>
      ) : null}

      {dialog === "complete" ? (
        <ConfirmDialog
          title="Mark as paid"
          description="Confirm that the recipient has received the funds. This cannot be undone."
          confirmLabel="Mark as paid"
          pending={pendingAction === "complete"}
          onClose={() => setDialog(null)}
          onConfirm={() =>
            run(
              "complete",
              () => completeTransfer(transfer.id),
              "Transfer completed.",
            )
          }
        />
      ) : null}

      {dialog === "reject" ? (
        <ConfirmDialog
          title="Reject payment"
          description="The transfer goes back to pending payment so the sender can pay again."
          confirmLabel="Reject payment"
          requireReason
          pending={pendingAction === "reject"}
          onClose={() => setDialog(null)}
          onConfirm={(reason) =>
            run(
              "reject",
              () => rejectPayment(transfer.id, reason ?? ""),
              "Payment rejected.",
            )
          }
        />
      ) : null}

      {dialog === "cancel" ? (
        <ConfirmDialog
          title="Cancel transfer"
          description="The transfer will stop here and cannot continue."
          confirmLabel="Cancel transfer"
          requireReason
          pending={pendingAction === "cancel"}
          onClose={() => setDialog(null)}
          onConfirm={(reason) =>
            run(
              "cancel",
              () => cancelTransfer(transfer.id, reason ?? ""),
              "Transfer cancelled.",
            )
          }
        />
      ) : null}
    </section>
  );
}
