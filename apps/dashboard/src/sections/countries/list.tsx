import { useDeferredValue, useState } from "react";
import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import type { AdminCountry } from "@repo/types";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { DashboardPage } from "@/components/dashboard-page";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/utils/request";
import { CountryTable } from "./table";

function filterCountries(countries: AdminCountry[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return countries;

  return countries.filter(
    (country) =>
      country.name.toLowerCase().includes(normalized) ||
      country.iso_code.toLowerCase().includes(normalized) ||
      country.currency_code.toLowerCase().includes(normalized),
  );
}

export function CountriesList({ countries }: { countries: AdminCountry[] }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filtered = filterCountries(countries, deferredQuery);
  const hasSearch = deferredQuery.trim().length > 0;
  const isStale = query !== deferredQuery;

  return (
    <DashboardPage
      title="Countries"
      description={`${countries.length} supported ${countries.length === 1 ? "country" : "countries"}.`}
      actions={
        <Button size="sm" asChild>
          <Link to="/dashboard/countries/new">Add country</Link>
        </Button>
      }
    >
      {countries.length > 0 ? (
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search countries…"
          aria-label="Search countries"
          className="h-9 max-w-xs"
        />
      ) : null}

      <div
        className={cn(
          "border border-border bg-background transition-opacity duration-150",
          isStale && "opacity-60",
        )}
      >
        {filtered.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-muted">
              {hasSearch
                ? "No countries match your search."
                : "No countries available."}
            </p>
            {!hasSearch ? (
              <Button size="sm" className="mt-4" asChild>
                <Link to="/dashboard/countries/new">Add country</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <CountryTable countries={filtered} />
        )}
      </div>
    </DashboardPage>
  );
}

export function CountriesPending() {
  return (
    <DashboardPage title="Countries">
      <div className="border border-border bg-background p-4">
        <div className="space-y-3" aria-hidden>
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="h-10 bg-surface" />
          ))}
        </div>
        <p className="sr-only">Loading countries</p>
      </div>
    </DashboardPage>
  );
}

export function CountriesError({ error, reset }: ErrorComponentProps) {
  return (
    <DashboardPage title="Countries">
      <div className="border border-border bg-background px-4 py-10 text-center">
        <p className="text-sm text-muted">{getErrorMessage(error)}</p>
        <Button type="button" size="sm" className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </DashboardPage>
  );
}
