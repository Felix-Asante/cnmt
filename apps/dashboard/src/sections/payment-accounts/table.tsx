import { Link, useNavigate, useParams } from "@tanstack/react-router";
import type { AdminCountry, PaymentAccount } from "@repo/types";
import { Badge } from "@repo/ui/badge";
import { cn } from "@/lib/utils";
import { paymentMethodLabel } from "./schema";

export function PaymentAccountTable({
  accounts,
  countries,
}: {
  accounts: PaymentAccount[];
  countries: Map<number, AdminCountry>;
}) {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const selected = typeof params.id === "string" ? params.id : undefined;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <HeaderCell>Account</HeaderCell>
            <HeaderCell>Method</HeaderCell>
            <HeaderCell>Details</HeaderCell>
            <HeaderCell>Currency</HeaderCell>
            <HeaderCell>Status</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => {
            const country = countries.get(account.country_id);
            const active = selected === account.id;
            const details =
              account.payment_method === "BANK"
                ? [account.account_number, account.sort_code]
                    .filter(Boolean)
                    .join(" · ")
                : account.phone_number;

            return (
              <tr
                key={account.id}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "cursor-pointer border-b border-border last:border-b-0",
                  active ? "bg-navy-soft" : "hover:bg-surface",
                )}
                onClick={() =>
                  void navigate({
                    to: "/dashboard/payment-accounts/$id",
                    params: { id: account.id },
                    search: (prev) => prev,
                  })
                }
              >
                <td className="px-4 py-3.5">
                  <Link
                    to="/dashboard/payment-accounts/$id"
                    params={{ id: account.id }}
                    search={(prev) => prev}
                    onClick={(event) => event.stopPropagation()}
                    className="font-medium text-navy no-underline hover:underline"
                  >
                    {account.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-muted">
                    {account.account_name}
                    {account.channel_name
                      ? ` · ${account.channel_name}`
                      : ""}
                    {country ? ` · ${country.flag} ${country.name}` : ""}
                  </p>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-foreground">
                  {paymentMethodLabel(account.payment_method)}
                </td>
                <td className="px-4 py-3.5 font-mono text-xs tracking-wide text-foreground">
                  {details || "—"}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-foreground">
                  {account.currency_code}
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={account.is_active ? "success" : "neutral"}>
                    {account.is_active ? "Active" : "Inactive"}
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
