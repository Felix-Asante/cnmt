import { Outlet, createFileRoute } from "@tanstack/react-router";
import { loadRoutesPage } from "@/sections/routes/api";
import {
  RoutesError,
  RoutesList,
  RoutesPending,
} from "@/sections/routes/list";
import { parseRoutesSearch } from "@/sections/routes/search";

export const Route = createFileRoute("/(private)/dashboard/routes")({
  validateSearch: parseRoutesSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => loadRoutesPage(deps),
  component: Layout,
  pendingComponent: RoutesPending,
  errorComponent: RoutesError,
  pendingMs: 0,
});

function Layout() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();

  return (
    <>
      <RoutesList
        routes={data.routes}
        countries={data.countries}
        search={search}
      />
      <Outlet />
    </>
  );
}
