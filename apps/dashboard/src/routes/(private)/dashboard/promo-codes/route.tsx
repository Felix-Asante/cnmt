import { Outlet, createFileRoute } from "@tanstack/react-router";
import { loadPromoCodesPage } from "@/sections/promo-codes/api";
import {
  PromoCodesError,
  PromoCodesList,
  PromoCodesPending,
} from "@/sections/promo-codes/list";
import { parsePromoCodesSearch } from "@/sections/promo-codes/search";

export const Route = createFileRoute("/(private)/dashboard/promo-codes")({
  validateSearch: parsePromoCodesSearch,
  loaderDeps: ({ search }) => search,
  loader: () => loadPromoCodesPage(),
  component: Layout,
  pendingComponent: PromoCodesPending,
  errorComponent: PromoCodesError,
  pendingMs: 0,
});

function Layout() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();

  return (
    <>
      <PromoCodesList promoCodes={data.promoCodes} search={search} />
      <Outlet />
    </>
  );
}
