import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { CountriesList } from "@/sections/countries/list";

const parentRoute = getRouteApi("/(private)/dashboard/countries");

export const Route = createFileRoute("/(private)/dashboard/countries/")({
  component: Page,
});

function Page() {
  const countries = parentRoute.useLoaderData();
  return <CountriesList countries={countries} />;
}
