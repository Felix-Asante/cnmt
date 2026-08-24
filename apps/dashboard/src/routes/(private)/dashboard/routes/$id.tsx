import { createFileRoute } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";
import { RouteDetail, RouteNotFound } from "@/sections/routes/detail";

const parentRoute = getRouteApi("/(private)/dashboard/routes");

export const Route = createFileRoute("/(private)/dashboard/routes/$id")({
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { routes, countries } = parentRoute.useLoaderData();
  const route = routes.find((item) => item.id === id);

  if (!route) return <RouteNotFound />;

  return <RouteDetail route={route} countries={countries} />;
}
