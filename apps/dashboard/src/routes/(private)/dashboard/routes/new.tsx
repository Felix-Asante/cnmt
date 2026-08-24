import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { RouteCreate } from "@/sections/routes/detail";

const parentRoute = getRouteApi("/(private)/dashboard/routes");

export const Route = createFileRoute("/(private)/dashboard/routes/new")({
  component: Page,
});

function Page() {
  const { countries } = parentRoute.useLoaderData();
  return <RouteCreate countries={countries} />;
}
