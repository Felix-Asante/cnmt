import { useState, useTransition } from "react";
import { useRouter } from "@tanstack/react-router";
import type { AdminCountry, PaymentAccount } from "@repo/types";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { formatDateTime } from "@/utils/format";
import { getErrorMessage } from "@/utils/request";
import {
  activatePaymentAccount,
  createPaymentAccount,
  deactivatePaymentAccount,
  deletePaymentAccount,
  updatePaymentAccount,
} from "./api";
import { PaymentAccountForm } from "./form";
import {
  paymentMethodLabel,
  toCreatePayload,
  toUpdatePayload,
  type PaymentAccountFormValues,
} from "./schema";
import {
  PaymentAccountSheet,
  useClosePaymentAccountSheet,
} from "./sheet";

export function PaymentAccountDetail({
  account,
  countries,
}: {
  account: PaymentAccount;
  countries: AdminCountry[];
}) {
  const router = useRouter();
  const close = useClosePaymentAccountSheet();
  const [editing, setEditing] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  const country = countries.find((item) => item.id === account.country_id);

  function run(name: string, task: () => Promise<unknown>, success: string) {
    if (isPending) return;
    setPendingAction(name);
    startTransition(async () => {
      try {
        await task();
        toast.success(success);
        setConfirmDelete(false);
        setConfirmDeactivate(false);
        setEditing(false);
        await router.invalidate();
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    });
  }

  function onSave(values: PaymentAccountFormValues) {
    run(
      "save",
      () => updatePaymentAccount(account.id, toUpdatePayload(values)),
      "Payment account updated.",
    );
  }

  function onActivate() {
    run(
      "activate",
      () => activatePaymentAccount(account.id),
      "Payment account activated.",
    );
  }

  function onDeactivate() {
    run(
      "deactivate",
      () => deactivatePaymentAccount(account.id),
      "Payment account deactivated.",
    );
  }

  function onDelete() {
    if (isPending) return;
    setPendingAction("delete");
    startTransition(async () => {
      try {
        await deletePaymentAccount(account.id);
        toast.success("Payment account removed.");
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
    <PaymentAccountSheet
      title={account.name}
      description={
        country
          ? `${country.flag} ${country.name} · ${paymentMethodLabel(account.payment_method)}`
          : paymentMethodLabel(account.payment_method)
      }
    >
      {editing ? (
        <div className="px-5 py-5">
          <PaymentAccountForm
            countries={countries}
            lockCountry
            lockMethod
            channelNameHint={account.channel_name}
            pending={pendingAction === "save"}
            submitLabel="Save changes"
            defaultValues={{
              country_id: String(account.country_id),
              payment_method: account.payment_method,
              name: account.name,
              account_name: account.account_name,
              account_number: account.account_number ?? "",
              phone_number: account.phone_number ?? "",
              sort_code: account.sort_code ?? "",
              iban: account.iban ?? "",
              payment_channel_id: account.payment_channel_id ?? "",
              currency_code: account.currency_code,
            }}
            onSubmit={onSave}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <div className="space-y-5 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-navy">Status</p>
            <Badge variant={account.is_active ? "success" : "neutral"}>
              {account.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <section>
            <h3 className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
              Account
            </h3>
            <dl className="mt-2 border border-border">
              <Row label="Account name" value={account.account_name} />
              <Row
                label="Method"
                value={paymentMethodLabel(account.payment_method)}
              />
              {account.channel_name ? (
                <Row label="Channel" value={account.channel_name} />
              ) : null}
              {account.account_number ? (
                <Row label="Account number" value={account.account_number} />
              ) : null}
              {account.phone_number ? (
                <Row label="Phone number" value={account.phone_number} />
              ) : null}
              {account.sort_code ? (
                <Row label="Sort code" value={account.sort_code} />
              ) : null}
              {account.iban ? <Row label="IBAN" value={account.iban} /> : null}
              <Row label="Currency" value={account.currency_code} />
              {country ? (
                <Row
                  label="Country"
                  value={`${country.flag} ${country.name}`}
                />
              ) : null}
              {account.created_at &&
              !account.created_at.startsWith("0001-01-01") ? (
                <Row
                  label="Created"
                  value={formatDateTime(account.created_at)}
                />
              ) : null}
            </dl>
          </section>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => setEditing(true)}
            >
              Edit
            </Button>
            {account.is_active ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => setConfirmDeactivate(true)}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending || pendingAction === "activate"}
                onClick={onActivate}
              >
                {pendingAction === "activate" ? "Activating…" : "Activate"}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {confirmDeactivate ? (
        <ConfirmDialog
          title="Deactivate payment account"
          description="Customers will no longer see this account on new transfers. Existing transfer snapshots are unchanged."
          confirmLabel="Deactivate"
          pending={pendingAction === "deactivate"}
          onClose={() => setConfirmDeactivate(false)}
          onConfirm={onDeactivate}
        />
      ) : null}

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete payment account"
          description="This account will be soft-deleted and hidden from customers. Historical transfer references are kept."
          confirmLabel="Delete account"
          pending={pendingAction === "delete"}
          onClose={() => setConfirmDelete(false)}
          onConfirm={onDelete}
        />
      ) : null}
    </PaymentAccountSheet>
  );
}

export function PaymentAccountCreate({
  countries,
  countryId,
}: {
  countries: AdminCountry[];
  countryId: number | null;
}) {
  const router = useRouter();
  const close = useClosePaymentAccountSheet();
  const [isPending, startTransition] = useTransition();
  const activeCountries = countries.filter((country) => country.is_active);
  const selected = countryId
    ? activeCountries.find((country) => country.id === countryId)
    : activeCountries[0];

  function handleCreate(values: PaymentAccountFormValues) {
    startTransition(async () => {
      try {
        await createPaymentAccount(toCreatePayload(values));
        toast.success("Payment account created.");
        await router.invalidate();
        close();
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    });
  }

  return (
    <PaymentAccountSheet
      title="Add payment account"
      description="Customers pay into this account during the transfer flow."
    >
      <div className="px-5 py-5">
        {activeCountries.length === 0 ? (
          <p className="text-sm text-muted">
            Add an active country with payment channels first.
          </p>
        ) : (
          <PaymentAccountForm
            countries={activeCountries}
            lockCountry={Boolean(countryId)}
            pending={isPending}
            submitLabel="Create account"
            defaultValues={{
              country_id: selected ? String(selected.id) : "",
              currency_code: selected?.currency_code ?? "",
            }}
            onCancel={close}
            onSubmit={handleCreate}
          />
        )}
      </div>
    </PaymentAccountSheet>
  );
}

export function PaymentAccountNotFound() {
  const close = useClosePaymentAccountSheet();

  return (
    <PaymentAccountSheet title="Payment account">
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-muted">
          This payment account could not be found.
        </p>
        <Button type="button" size="sm" className="mt-4" onClick={close}>
          Close
        </Button>
      </div>
    </PaymentAccountSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-border px-3 py-2.5 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium break-words text-navy">{value}</dd>
    </div>
  );
}
