import { Outlet, createFileRoute } from "@tanstack/react-router";
import { loadPaymentAccountsPage } from "@/sections/payment-accounts/api";
import {
  PaymentAccountsError,
  PaymentAccountsList,
  PaymentAccountsPending,
} from "@/sections/payment-accounts/list";
import { parsePaymentAccountsSearch } from "@/sections/payment-accounts/search";

export const Route = createFileRoute("/(private)/dashboard/payment-accounts")({
  validateSearch: parsePaymentAccountsSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => loadPaymentAccountsPage(deps),
  component: Layout,
  pendingComponent: PaymentAccountsPending,
  errorComponent: PaymentAccountsError,
  pendingMs: 0,
});

function Layout() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();

  return (
    <>
      <PaymentAccountsList
        accounts={data.accounts}
        countries={data.countries}
        countryId={data.countryId}
        search={search}
      />
      <Outlet />
    </>
  );
}
