import { Link, useNavigate, useParams } from "@tanstack/react-router";
import type { AdminCountry, TransferRoute } from "@repo/types";
import { Badge } from "@repo/ui/badge";
import { cn } from "@/lib/utils";
import { formatAmount, formatFee } from "@/utils/format";
import { RouteCorridor } from "./corridor";

export function RouteTable({
  routes,
  countries,
}: {
  routes: TransferRoute[];
  countries: Map<number, AdminCountry>;
}) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const selected = typeof params.id === "string" ? params.id : undefined;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <HeaderCell>Route</HeaderCell>
            <HeaderCell>Currencies</HeaderCell>
            <HeaderCell>Limits</HeaderCell>
            <HeaderCell>Fee</HeaderCell>
            <HeaderCell>Status</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {routes.map((route) => {
            const source = countries.get(route.source_country_id);
            const destination = countries.get(route.destination_country_id);
            const active = selected === route.id;

            return (
              <tr
                key={route.id}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "cursor-pointer border-b border-border last:border-b-0",
                  active ? "bg-navy-soft" : "hover:bg-surface",
                )}
                onClick={() =>
                  void navigate({
                    to: "/dashboard/routes/$id",
                    params: { id: route.id },
                    search: (prev) => prev,
                  })
                }
              >
                <td className="px-4 py-3.5">
                  <Link
                    to="/dashboard/routes/$id"
                    params={{ id: route.id }}
                    search={(prev) => prev}
                    onClick={(event) => event.stopPropagation()}
                    className="font-medium text-navy no-underline hover:underline"
                  >
                    <RouteCorridor
                      source={source}
                      destination={destination}
                    />
                  </Link>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-foreground">
                  {source?.currency_code ?? "—"} /{" "}
                  {destination?.currency_code ?? "—"}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap tabular-nums text-foreground">
                  {formatAmount(
                    route.min_transfer_amount,
                    source?.currency_code,
                    source?.currency_symbol,
                  )}
                  <span className="text-subtle"> – </span>
                  {formatAmount(
                    route.max_transfer_amount,
                    source?.currency_code,
                    source?.currency_symbol,
                  )}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-foreground">
                  {formatFee(
                    route.fee,
                    route.fee_type,
                    source?.currency_code,
                    source?.currency_symbol,
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={route.is_active ? "success" : "neutral"}>
                    {route.is_active ? "Active" : "Inactive"}
                  </Badge>
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
