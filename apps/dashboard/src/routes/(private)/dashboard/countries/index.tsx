import { createFileRoute } from "@tanstack/react-router";
import { listCountries } from "@/sections/countries/api";
import {
  CountriesError,
  CountriesList,
  CountriesPending,
} from "@/sections/countries/list";

export const Route = createFileRoute("/(private)/dashboard/countries/")({
  loader: () => listCountries(),
  component: Page,
  pendingComponent: CountriesPending,
  errorComponent: CountriesError,
  pendingMs: 0,
});

function Page() {
  const countries = Route.useLoaderData();
  return <CountriesList countries={countries} />;
}
