import { Outlet, createFileRoute } from "@tanstack/react-router";
import { listCountries } from "@/sections/countries/api";
import { CountriesError, CountriesPending } from "@/sections/countries/list";

export const Route = createFileRoute("/(private)/dashboard/countries")({
  loader: () => listCountries(),
  component: Outlet,
  pendingComponent: CountriesPending,
  errorComponent: CountriesError,
  pendingMs: 0,
});
