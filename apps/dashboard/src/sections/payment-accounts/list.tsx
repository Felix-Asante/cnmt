import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import type { AdminCountry, PaymentAccount } from "@repo/types";
import { Button } from "@repo/ui/button";
import { DashboardPage } from "@/components/dashboard-page";
import { getErrorMessage } from "@/utils/request";
import { PaymentAccountFilters } from "./filters";
import {
  hasPaymentAccountFilters,
  type PaymentAccountsSearch,
} from "./search";
import { PaymentAccountTable } from "./table";

function matchesQuery(account: PaymentAccount, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const haystack = [
    account.name,
    account.account_name,
    account.account_number,
    account.phone_number,
    account.channel_name,
    account.currency_code,
    account.sort_code,
    account.iban,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function PaymentAccountsList({
  accounts,
  countries,
  countryId,
  search,
}: {
  accounts: PaymentAccount[];
  countries: AdminCountry[];
  countryId: number | null;
  search: PaymentAccountsSearch;
}) {
  const countryMap = new Map(countries.map((country) => [country.id, country]));
  const visible = accounts.filter((account) =>
    matchesQuery(account, search.q ?? ""),
  );
  const filtered = hasPaymentAccountFilters(search);
  const selectedCountry = countryId ? countryMap.get(countryId) : undefined;

  return (
    <DashboardPage
      title="Payment accounts"
      description="Accounts customers pay into. Shown on transfer payment instructions by country."
      actions={
        <Button size="sm" asChild>
          <Link to="/dashboard/payment-accounts/new" search={(prev) => prev}>
            Add account
          </Link>
        </Button>
      }
    >
      {countries.length === 0 ? (
        <div className="border border-border bg-background px-4 py-16 text-center">
          <p className="text-sm text-muted">
            Add a country before creating payment accounts.
          </p>
          <Button size="sm" className="mt-4" asChild>
            <Link to="/dashboard/countries/new">Add country</Link>
          </Button>
        </div>
      ) : (
        <>
          <PaymentAccountFilters search={search} countries={countries} />

          <div className="border border-border bg-background">
            {visible.length === 0 ? (
              <div className="px-4 py-16 text-center">
                <p className="text-sm text-muted">
                  {filtered
                    ? selectedCountry &&
                      !search.method &&
                      !search.active &&
                      !search.q
                      ? `No payment accounts for ${selectedCountry.name}.`
                      : "No payment accounts match these filters."
                    : "No payment accounts configured."}
                </p>
                {!search.method && !search.active && !search.q ? (
                  <Button size="sm" className="mt-4" asChild>
                    <Link
                      to="/dashboard/payment-accounts/new"
                      search={(prev) => prev}
                    >
                      Add account
                    </Link>
                  </Button>
                ) : null}
              </div>
            ) : (
              <PaymentAccountTable
                accounts={visible}
                countries={countryMap}
              />
            )}
          </div>
        </>
      )}
    </DashboardPage>
  );
}

export function PaymentAccountsPending() {
  return (
    <DashboardPage title="Payment accounts" description="Loading accounts…">
      <div className="space-y-3" aria-hidden>
        <div className="h-9 bg-surface" />
        <div className="border border-border bg-background p-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="mb-3 h-12 bg-surface last:mb-0" />
          ))}
        </div>
      </div>
    </DashboardPage>
  );
}

export function PaymentAccountsError({ error, reset }: ErrorComponentProps) {
  return (
    <DashboardPage title="Payment accounts">
      <div className="border border-border bg-background px-4 py-16 text-center">
        <p className="text-sm text-muted">{getErrorMessage(error)}</p>
        <Button type="button" size="sm" className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </DashboardPage>
  );
}
