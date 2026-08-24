import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import type { AdminCountry, TransferRoute } from "@repo/types";
import { Button } from "@repo/ui/button";
import { DashboardPage } from "@/components/dashboard-page";
import { getErrorMessage } from "@/utils/request";
import { RouteFilters } from "./filters";
import { hasRouteFilters, type RoutesSearch } from "./search";
import { RouteTable } from "./table";

function matchesQuery(
  route: TransferRoute,
  countries: Map<number, AdminCountry>,
  query: string,
) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  const source = countries.get(route.source_country_id);
  const destination = countries.get(route.destination_country_id);
  const haystack = [
    source?.name,
    source?.iso_code,
    destination?.name,
    destination?.iso_code,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function RoutesList({
  routes,
  countries,
  search,
}: {
  routes: TransferRoute[];
  countries: AdminCountry[];
  search: RoutesSearch;
}) {
  const countryMap = new Map(countries.map((country) => [country.id, country]));
  const visible = routes.filter((route) =>
    matchesQuery(route, countryMap, search.q ?? ""),
  );
  const filtered = hasRouteFilters(search);

  return (
    <DashboardPage
      title="Routes"
      description="Where money can move. Each corridor is one direction."
      actions={
        <Button size="sm" asChild>
          <Link to="/dashboard/routes/new" search={(prev) => prev}>
            Add route
          </Link>
        </Button>
      }
    >
      <RouteFilters search={search} countries={countries} />

      <div className="border border-border bg-background">
        {visible.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-muted">
              {filtered
                ? "No routes match these filters."
                : "No transfer routes configured."}
            </p>
            {!filtered ? (
              <Button size="sm" className="mt-4" asChild>
                <Link to="/dashboard/routes/new">Add route</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <RouteTable routes={visible} countries={countryMap} />
        )}
      </div>
    </DashboardPage>
  );
}

export function RoutesPending() {
  return (
    <DashboardPage title="Routes">
      <div className="border border-border bg-background p-4">
        <div className="space-y-3" aria-hidden>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-10 bg-surface" />
          ))}
        </div>
        <p className="sr-only">Loading routes</p>
      </div>
    </DashboardPage>
  );
}

export function RoutesError({ error, reset }: ErrorComponentProps) {
  return (
    <DashboardPage title="Routes">
      <div className="border border-border bg-background px-4 py-10 text-center">
        <p className="text-sm text-muted">{getErrorMessage(error)}</p>
        <Button type="button" size="sm" className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </DashboardPage>
  );
}
