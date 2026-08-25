import { Link } from "@tanstack/react-router";
import type { DashboardTransferSummary } from "@repo/types";
import { Button } from "@repo/ui/button";
import { receivingMethodLabel } from "@/sections/transfers/constants";
import { TransferStatusBadge } from "@/sections/transfers/status-badge";
import { formatAmount, formatDateTime } from "@/utils/format";
import { EmptyCopy, SectionCard } from "./shared";

export function RecentTransfers({
  transfers,
}: {
  transfers: DashboardTransferSummary[];
}) {
  return (
    <SectionCard
      title="Recent transfers"
      description="Latest transfers in the selected period."
      action={
        <Button size="sm" variant="outline" asChild>
          <Link to="/dashboard/transfers">View all</Link>
        </Button>
      }
    >
      {transfers.length === 0 ? (
        <EmptyCopy>No transfers yet for this period.</EmptyCopy>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <HeaderCell>Reference</HeaderCell>
                <HeaderCell>Route</HeaderCell>
                <HeaderCell>Amount</HeaderCell>
                <HeaderCell>Method</HeaderCell>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell>Created</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {transfers.map((transfer) => (
                <tr
                  key={transfer.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface"
                >
                  <td className="px-3 py-3">
                    <Link
                      to="/dashboard/transfers/$reference"
                      params={{ reference: transfer.reference }}
                      className="font-medium text-navy no-underline hover:underline"
                    >
                      {transfer.reference}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-foreground">
                    <span className="inline-flex flex-wrap items-center gap-1.5">
                      <span>{transfer.source_country}</span>
                      <span className="text-subtle" aria-hidden>
                        →
                      </span>
                      <span>{transfer.destination_country}</span>
                    </span>
                  </td>
                  <td className="px-3 py-3 tabular-nums text-navy">
                    {formatAmount(
                      transfer.amount_sent,
                      transfer.currency_code,
                      transfer.currency_symbol,
                    )}
                  </td>
                  <td className="px-3 py-3 text-muted">
                    {receivingMethodLabel(transfer.receiving_method)}
                  </td>
                  <td className="px-3 py-3">
                    <TransferStatusBadge status={transfer.status} />
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-muted">
                    {formatDateTime(transfer.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}

function HeaderCell({ children }: { children: string }) {
  return (
    <th className="px-3 py-2.5 text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
      {children}
    </th>
  );
}
