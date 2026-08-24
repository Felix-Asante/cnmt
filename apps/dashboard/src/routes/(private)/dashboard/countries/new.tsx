import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { CountryCreate, CountryCreateError } from "@/sections/countries/create";

const parentRoute = getRouteApi("/(private)/dashboard/countries");

export const Route = createFileRoute("/(private)/dashboard/countries/new")({
  component: Page,
  errorComponent: CountryCreateError,
});

function Page() {
  const countries = parentRoute.useLoaderData();
  return <CountryCreate countries={countries} />;
}
