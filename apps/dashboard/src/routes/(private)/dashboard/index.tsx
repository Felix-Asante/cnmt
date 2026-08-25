import { createFileRoute } from "@tanstack/react-router";
import { getDashboard } from "@/sections/home/api";
import {
  HomeDashboard,
  HomeError,
  HomePending,
} from "@/sections/home";
import { parseDashboardSearch } from "@/sections/home/search";

export const Route = createFileRoute("/(private)/dashboard/")({
  validateSearch: parseDashboardSearch,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) => getDashboard(deps),
  component: Page,
  pendingComponent: HomePending,
  errorComponent: HomeError,
  pendingMs: 0,
});

function Page() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  return <HomeDashboard data={data} search={search} />;
}
