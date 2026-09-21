import { useState, useTransition } from "react";
import { useRouter } from "@tanstack/react-router";
import type { PromoCode } from "@repo/types";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatDate, formatDateTime } from "@/utils/format";
import { getErrorMessage } from "@/utils/request";
import { createPromoCode, deletePromoCode, updatePromoCode } from "./api";
import { PromoCodeForm } from "./form";
import {
  formatDiscountPercent,
  promoWindowBadgeVariant,
  promoWindowLabel,
  promoWindowStatus,
  toCreatePayload,
  toUpdatePayload,
  valuesFromPromoCode,
  type PromoCodeFormValues,
} from "./schema";
import { PromoCodeSheet, useClosePromoCodeSheet } from "./sheet";

export function PromoCodeDetail({ promoCode }: { promoCode: PromoCode }) {
  const router = useRouter();
  const close = useClosePromoCodeSheet();
  const [editing, setEditing] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = promoWindowStatus(promoCode.start_date, promoCode.end_date);

  function onSave(values: PromoCodeFormValues) {
    if (isPending) return;
    setPendingAction("save");
    startTransition(async () => {
      try {
        await updatePromoCode(promoCode.id, toUpdatePayload(values));
        toast.success("Promo code updated.");
        setEditing(false);
        await router.invalidate();
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    });
  }

  function onDelete() {
    if (isPending) return;
    setPendingAction("delete");
    startTransition(async () => {
      try {
        await deletePromoCode(promoCode.id);
        toast.success("Promo code deleted.");
        setConfirmDelete(false);
        await router.invalidate();
        close();
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <PromoCodeSheet
      title={promoCode.code}
      description={`${formatDiscountPercent(promoCode.discount_percentage)} off`}
    >
      {editing ? (
        <div className="px-5 py-5">
          <PromoCodeForm
            lockCode
            pending={pendingAction === "save"}
            submitLabel="Save changes"
            defaultValues={valuesFromPromoCode(promoCode)}
            onSubmit={onSave}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <div className="space-y-5 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-navy">Status</p>
            <Badge variant={promoWindowBadgeVariant(status)}>
              {promoWindowLabel(status)}
            </Badge>
          </div>

          <dl className="border border-border">
            <Row
              label="Discount"
              value={formatDiscountPercent(promoCode.discount_percentage)}
            />
            <Row label="Starts" value={formatDate(promoCode.start_date)} />
            <Row label="Ends" value={formatDate(promoCode.end_date)} />
            <Row label="Max uses" value={String(promoCode.max_uses)} />
            <Row label="Per user" value={String(promoCode.max_uses_per_user)} />
            <Row label="Created" value={formatDateTime(promoCode.created_at)} />
            <Row label="Updated" value={formatDateTime(promoCode.updated_at)} />
          </dl>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={isPending}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete promo code"
          description="This code will no longer be available for new transfers. Existing redemptions are kept."
          confirmLabel="Delete code"
          pending={pendingAction === "delete"}
          onClose={() => setConfirmDelete(false)}
          onConfirm={onDelete}
        />
      ) : null}
    </PromoCodeSheet>
  );
}

export function PromoCodeCreate() {
  const router = useRouter();
  const close = useClosePromoCodeSheet();
  const [isPending, startTransition] = useTransition();

  function handleCreate(values: PromoCodeFormValues) {
    startTransition(async () => {
      try {
        await createPromoCode(toCreatePayload(values));
        toast.success("Promo code created.");
        await router.invalidate();
        close();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  return (
    <PromoCodeSheet
      title="Add promo code"
      description="Customers enter this code to receive a percentage discount."
    >
      <div className="px-5 py-5">
        <PromoCodeForm
          pending={isPending}
          submitLabel="Create promo code"
          onCancel={close}
          onSubmit={handleCreate}
        />
      </div>
    </PromoCodeSheet>
  );
}

export function PromoCodeNotFound() {
  const close = useClosePromoCodeSheet();

  return (
    <PromoCodeSheet title="Promo code">
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-muted">
          This promo code could not be found.
        </p>
        <Button type="button" size="sm" className="mt-4" onClick={close}>
          Close
        </Button>
      </div>
    </PromoCodeSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-border px-3 py-2.5 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium wrap-break-word text-navy">{value}</dd>
    </div>
  );
}
