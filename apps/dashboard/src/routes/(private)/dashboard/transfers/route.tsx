import { Outlet, createFileRoute } from "@tanstack/react-router";
import { listTransfers } from "@/sections/transfers/api";
import {
  TransfersError,
  TransfersList,
  TransfersPending,
} from "@/sections/transfers/list";
import { parseTransfersSearch } from "@/sections/transfers/search";

export const Route = createFileRoute("/(private)/dashboard/transfers")({
  validateSearch: parseTransfersSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => listTransfers(deps),
  component: Layout,
  pendingComponent: TransfersPending,
  errorComponent: TransfersError,
  pendingMs: 0,
});

function Layout() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();

  return (
    <>
      <TransfersList data={data} search={search} />
      <Outlet />
    </>
  );
}
