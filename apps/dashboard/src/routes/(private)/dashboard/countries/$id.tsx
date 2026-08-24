import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { ApiError } from "@/utils/request";
import { getCountry } from "@/sections/countries/api";
import {
  CountryDetail,
  CountryDetailError,
  CountryDetailPending,
} from "@/sections/countries/detail";

const parentRoute = getRouteApi("/(private)/dashboard/countries");

export const Route = createFileRoute("/(private)/dashboard/countries/$id")({
  loader: async ({ params }) => {
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApiError("Invalid country id.", 400);
    }
    return getCountry(id);
  },
  component: Page,
  pendingComponent: CountryDetailPending,
  errorComponent: CountryDetailError,
  pendingMs: 0,
});

function Page() {
  const country = Route.useLoaderData();
  const countries = parentRoute.useLoaderData();
  return <CountryDetail country={country} countries={countries} />;
}
