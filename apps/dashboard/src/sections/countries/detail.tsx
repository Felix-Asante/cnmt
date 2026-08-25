import { useState, useTransition } from "react";
import { Link, useNavigate, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import type { AdminCountry, AdminCountryDetail } from "@repo/types";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { DashboardPage } from "@/components/dashboard-page";
import { formatDateTime } from "@/utils/format";
import { getErrorMessage } from "@/utils/request";
import { deleteCountry, updateCountry } from "./api";
import { CountryChannels } from "./channels";
import { EditCountryForm } from "./edit-form";
import {
  toUpdateCountryPayload,
  type UpdateCountryValues,
} from "./schema";

export function CountryDetail({
  country,
  countries,
}: {
  country: AdminCountryDetail;
  countries: AdminCountry[];
}) {
  const router = useRouter();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const existingIsoCodes = countries.map((item) => item.iso_code);

  function refresh() {
    return router.invalidate();
  }

  function goBack() {
    void navigate({ to: "/dashboard/countries" });
  }

  function run(name: string, task: () => Promise<unknown>, success: string) {
    if (isPending) return;
    setPendingAction(name);
    startTransition(async () => {
      try {
        await task();
        toast.success(success);
        setEditing(false);
        setConfirmDelete(false);
        await refresh();
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    });
  }

  function onSave(values: UpdateCountryValues) {
    run(
      "save",
      () => updateCountry(country.id, toUpdateCountryPayload(values)),
      "Country updated.",
    );
  }

  function onDelete() {
    if (isPending) return;
    setPendingAction("delete");
    startTransition(async () => {
      try {
        await deleteCountry(country.id);
        toast.success("Country deleted.");
        setConfirmDelete(false);
        await refresh();
        goBack();
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <DashboardPage
      title={`${country.flag} ${country.name}`}
      description={`${country.iso_code} · ${country.currency_code} (${country.currency_symbol})`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link to="/dashboard/countries">Back</Link>
          </Button>
          {!editing ? (
            <>
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
            </>
          ) : null}
        </div>
      }
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="border border-border bg-background p-5">
          {editing ? (
            <EditCountryForm
              country={country}
              existingIsoCodes={existingIsoCodes}
              pending={pendingAction === "save"}
              onSubmit={onSave}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-navy">Details</p>
                <Badge variant={country.is_active ? "success" : "neutral"}>
                  {country.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <dl className="border border-border">
                <MetaRow label="Name" value={country.name} />
                <MetaRow label="ISO code" value={country.iso_code} />
                <MetaRow label="Flag" value={country.flag} />
                <MetaRow
                  label="Currency"
                  value={`${country.currency_name} (${country.currency_code} · ${country.currency_symbol})`}
                />
                <MetaRow
                  label="Created"
                  value={formatDateTime(country.created_at)}
                />
                <MetaRow
                  label="Updated"
                  value={formatDateTime(country.updated_at)}
                />
              </dl>
            </div>
          )}
        </section>

        <CountryChannels
          countryId={country.id}
          channels={country.payment_channels}
          onChanged={refresh}
        />
      </div>

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete country"
          description="This country and its payment channels will no longer be available for new transfers. Existing transfers are not changed."
          confirmLabel="Delete country"
          pending={pendingAction === "delete"}
          onClose={() => setConfirmDelete(false)}
          onConfirm={onDelete}
        />
      ) : null}
    </DashboardPage>
  );
}

export function CountryDetailPending() {
  return (
    <DashboardPage title="Country">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="border border-border bg-background p-5">
          <div className="space-y-3" aria-hidden>
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-10 bg-surface" />
            ))}
          </div>
          <p className="sr-only">Loading country</p>
        </div>
      </div>
    </DashboardPage>
  );
}

export function CountryDetailError({ error, reset }: ErrorComponentProps) {
  return (
    <DashboardPage title="Country">
      <div className="mx-auto max-w-3xl border border-border bg-background px-5 py-10 text-center">
        <p className="text-sm text-muted">{getErrorMessage(error)}</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button type="button" size="sm" onClick={reset}>
            Try again
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to="/dashboard/countries">Back to countries</Link>
          </Button>
        </div>
      </div>
    </DashboardPage>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-border px-3 py-2.5 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium wrap-break-word text-navy">{value}</dd>
    </div>
  );
}
