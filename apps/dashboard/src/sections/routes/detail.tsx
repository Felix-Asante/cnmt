import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import type { AdminCountry, TransferRoute } from "@repo/types";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { toast } from "@repo/ui/toast";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  formatAmount,
  formatDateTime,
  formatExchangeRate,
  formatFee,
} from "@/utils/format";
import { getErrorMessage } from "@/utils/request";
import { createRoute, deleteRoute, toggleRouteActive, updateRoute } from "./api";
import { RouteCorridor } from "./corridor";
import { RouteForm } from "./form";
import {
  toCreatePayload,
  toUpdatePayload,
  type RouteFormValues,
} from "./schema";
import { RouteSheet, useCloseRouteSheet } from "./sheet";

export function RouteDetail({
  route,
  countries,
}: {
  route: TransferRoute;
  countries: AdminCountry[];
}) {
  const router = useRouter();
  const close = useCloseRouteSheet();
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const countryMap = new Map(countries.map((country) => [country.id, country]));
  const source = countryMap.get(route.source_country_id);
  const destination = countryMap.get(route.destination_country_id);

  async function run(name: string, task: () => Promise<unknown>, success: string) {
    if (pending) return;
    setPending(name);
    try {
      await task();
      toast.success(success);
      setConfirmDelete(false);
      setEditing(false);
      await router.invalidate();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setPending(null);
    }
  }

  async function onSave(values: RouteFormValues) {
    await run("save", () => updateRoute(route.id, toUpdatePayload(values)), "Route updated.");
  }

  async function onDelete() {
    if (pending) return;
    setPending("delete");
    try {
      await deleteRoute(route.id);
      toast.success("Route removed.");
      setConfirmDelete(false);
      await router.invalidate();
      close();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setPending(null);
    }
  }

  return (
    <RouteSheet
      title={
        source && destination
          ? `${source.name} → ${destination.name}`
          : "Route"
      }
      description="One-way corridor. The reverse direction is a separate route."
    >
      <div className="border-b border-border px-5 py-5">
        <RouteCorridor
          source={source}
          destination={destination}
          layout="stack"
        />
      </div>

      {editing ? (
        <div className="px-5 py-5">
          <RouteForm
            countries={countries}
            lockCountries
            pending={pending === "save"}
            submitLabel="Save changes"
            defaultValues={{
              source_country_id: String(route.source_country_id),
              dest_country_id: String(route.destination_country_id),
              exchange_rate: String(route.default_exchange_rate),
              fee_type: route.fee_type,
              fee: String(route.fee),
              min_transfer_amount: String(route.min_transfer_amount),
              max_transfer_amount: String(route.max_transfer_amount),
            }}
            onSubmit={(values) => void onSave(values)}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <div className="space-y-5 px-5 py-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-navy">Status</p>
            <Badge variant={route.is_active ? "success" : "neutral"}>
              {route.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <dl className="border border-border">
            <Row
              label="Rate"
              value={formatExchangeRate(
                route.default_exchange_rate,
                source?.currency_code,
                destination?.currency_code,
              )}
            />
            <Row
              label="Fee"
              value={`${formatFee(
                route.fee,
                route.fee_type,
                source?.currency_code,
                source?.currency_symbol,
              )} (${route.fee_type})`}
            />
            <Row
              label="Minimum"
              value={formatAmount(
                route.min_transfer_amount,
                source?.currency_code,
                source?.currency_symbol,
              )}
            />
            <Row
              label="Maximum"
              value={formatAmount(
                route.max_transfer_amount,
                source?.currency_code,
                source?.currency_symbol,
              )}
            />
            <Row label="Created" value={formatDateTime(route.created_at)} />
            <Row label="Updated" value={formatDateTime(route.updated_at)} />
          </dl>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={pending !== null}
              onClick={() => setEditing(true)}
            >
              Edit pricing
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              loading={pending === "toggle"}
              disabled={pending !== null}
              onClick={() =>
                void run(
                  "toggle",
                  () => toggleRouteActive(route.id),
                  route.is_active ? "Route deactivated." : "Route activated.",
                )
              }
            >
              {route.is_active ? "Deactivate" : "Activate"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending !== null}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}

      {confirmDelete ? (
        <ConfirmDialog
          title="Delete route"
          description="This corridor will no longer be available for new transfers. Existing transfers are not changed."
          confirmLabel="Delete route"
          pending={pending === "delete"}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => void onDelete()}
        />
      ) : null}
    </RouteSheet>
  );
}

export function RouteCreate({ countries }: { countries: AdminCountry[] }) {
  const router = useRouter();
  const close = useCloseRouteSheet();
  const [pending, setPending] = useState(false);
  const activeCountries = countries.filter((country) => country.is_active);

  return (
    <RouteSheet
      title="Add route"
      description="Creates one direction only. Morocco → Ghana does not enable Ghana → Morocco."
    >
      <div className="px-5 py-5">
        <RouteForm
          countries={activeCountries}
          pending={pending}
          submitLabel="Create route"
          onCancel={close}
          onSubmit={async (values) => {
            setPending(true);
            try {
              await createRoute(toCreatePayload(values));
              toast.success("Route created.");
              await router.invalidate();
              close();
            } catch (error) {
              toast.error(getErrorMessage(error));
            } finally {
              setPending(false);
            }
          }}
        />
      </div>
    </RouteSheet>
  );
}

export function RouteNotFound() {
  const close = useCloseRouteSheet();

  return (
    <RouteSheet title="Route">
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-muted">This route could not be found.</p>
        <Button type="button" size="sm" className="mt-4" onClick={close}>
          Close
        </Button>
      </div>
    </RouteSheet>
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
