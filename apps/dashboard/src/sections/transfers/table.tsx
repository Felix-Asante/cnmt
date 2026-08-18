import { Link, useNavigate, useParams } from "@tanstack/react-router";
import type { Transfer } from "@repo/types";
import { cn } from "@/lib/utils";
import { formatAmount, formatDateTime } from "@/utils/format";
import { TransferStatusBadge } from "./status-badge";

export function TransferTable({ transfers }: { transfers: Transfer[] }) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const selected =
    typeof params.reference === "string" ? params.reference : undefined;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <HeaderCell>Reference</HeaderCell>
            <HeaderCell>Corridor</HeaderCell>
            <HeaderCell>Recipient</HeaderCell>
            <HeaderCell>Sent</HeaderCell>
            <HeaderCell>Received</HeaderCell>
            <HeaderCell>Status</HeaderCell>
            <HeaderCell>Created</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {transfers.map((transfer) => {
            const source = transfer.route.source_country;
            const destination = transfer.route.destination_country;
            const active = selected === transfer.reference;

            return (
              <tr
                key={transfer.id}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "cursor-pointer border-b border-border last:border-b-0",
                  active ? "bg-navy-soft" : "hover:bg-surface",
                )}
                onClick={() =>
                  void navigate({
                    to: "/dashboard/transfers/$reference",
                    params: { reference: transfer.reference },
                    search: (prev) => prev,
                  })
                }
              >
                <td className="px-4 py-3.5">
                  <Link
                    to="/dashboard/transfers/$reference"
                    params={{ reference: transfer.reference }}
                    search={(prev) => prev}
                    onClick={(event) => event.stopPropagation()}
                    className="font-medium text-navy no-underline hover:underline"
                  >
                    {transfer.reference}
                  </Link>
                </td>
                <td className="px-4 py-3.5 text-foreground">
                  <CorridorCell
                    from={source.name}
                    fromFlag={source.flag}
                    to={destination.name}
                    toFlag={destination.flag}
                  />
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-foreground">{transfer.recipient.name}</p>
                  {transfer.recipient.phone ? (
                    <p className="mt-0.5 text-xs text-muted">
                      {transfer.recipient.phone}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 tabular-nums text-foreground">
                  {formatAmount(
                    transfer.amount_sent,
                    source.currency_code,
                    source.currency_symbol,
                  )}
                </td>
                <td className="px-4 py-3.5 tabular-nums text-foreground">
                  {formatAmount(
                    transfer.amount_received,
                    destination.currency_code,
                    destination.currency_symbol,
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <TransferStatusBadge status={transfer.status} />
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-muted">
                  {formatDateTime(transfer.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCell({ children }: { children: string }) {
  return (
    <th className="px-4 py-3 text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
      {children}
    </th>
  );
}

function CorridorCell({
  from,
  fromFlag,
  to,
  toFlag,
}: {
  from: string;
  fromFlag?: string;
  to: string;
  toFlag?: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-foreground">
      <span>
        {fromFlag ? `${fromFlag} ` : null}
        {from}
      </span>
      <span className="text-subtle" aria-hidden>
        →
      </span>
      <span>
        {toFlag ? `${toFlag} ` : null}
        {to}
      </span>
    </span>
  );
}
