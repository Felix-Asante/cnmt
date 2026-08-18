import { type ErrorComponentProps } from "@tanstack/react-router";
import type { TransferListResponse } from "@repo/types";
import { Button } from "@repo/ui/button";
import { DashboardPage } from "@/components/dashboard-page";
import { getErrorMessage } from "@/utils/request";
import { TransferFilters } from "./filters";
import { TransferPagination } from "./pagination";
import { hasTransferFilters, type TransfersSearch } from "./search";
import { TransferTable } from "./table";

export function TransfersList({
  data,
  search,
}: {
  data: TransferListResponse;
  search: TransfersSearch;
}) {
  const filtered = hasTransferFilters(search);

  return (
    <DashboardPage
      title="Transfers"
      description="Review, verify, and complete customer transfers."
    >
      <TransferFilters search={search} />

      <div className="border border-border bg-background">
        {data.transfers.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted">
            {filtered
              ? "No transfers match these filters."
              : "No transfers yet."}
          </p>
        ) : (
          <TransferTable transfers={data.transfers} />
        )}
        {data.total > 0 ? (
          <div className="border-t border-border">
            <TransferPagination
              search={search}
              page={data.page}
              limit={data.limit}
              total={data.total}
            />
          </div>
        ) : null}
      </div>
    </DashboardPage>
  );
}

export function TransfersPending() {
  return (
    <DashboardPage
      title="Transfers"
      description="Review, verify, and complete customer transfers."
    >
      <div className="border border-border bg-background p-4">
        <div className="space-y-3" aria-hidden>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="h-10 bg-surface" />
          ))}
        </div>
        <p className="sr-only">Loading transfers</p>
      </div>
    </DashboardPage>
  );
}

export function TransfersError({ error, reset }: ErrorComponentProps) {
  return (
    <DashboardPage title="Transfers">
      <div className="border border-border bg-background px-4 py-10 text-center">
        <p className="text-sm text-muted">{getErrorMessage(error)}</p>
        <Button type="button" size="sm" className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </DashboardPage>
  );
}
