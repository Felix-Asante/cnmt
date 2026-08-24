import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { AdminCountry } from "@repo/types";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import {
  compactRoutesSearch,
  type RoutesSearch,
} from "./search";

export function RouteFilters({
  search,
  countries,
}: {
  search: RoutesSearch;
  countries: AdminCountry[];
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(search.q ?? "");

  useEffect(() => {
    setQuery(search.q ?? "");
  }, [search.q]);

  function go(next: RoutesSearch) {
    void navigate({
      to: "/dashboard/routes",
      search: compactRoutesSearch(next),
    });
  }

  return (
    <form
      className="grid gap-3 md:grid-cols-[minmax(0,1fr)_10rem_10rem_9rem]"
      onSubmit={(event) => {
        event.preventDefault();
        go({ ...search, q: query.trim() || undefined });
      }}
    >
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        name="q"
        placeholder="Search routes…"
        aria-label="Search routes"
        className="h-9"
      />
      <CountrySelect
        label="Source"
        value={search.source}
        countries={countries}
        onChange={(source) => go({ ...search, source, q: query.trim() || undefined })}
      />
      <CountrySelect
        label="Destination"
        value={search.dest}
        countries={countries}
        onChange={(dest) => go({ ...search, dest, q: query.trim() || undefined })}
      />
      <Select
        value={search.active ?? "all"}
        onValueChange={(value) =>
          go({
            ...search,
            active: value === "all" ? undefined : (value as "true" | "false"),
            q: query.trim() || undefined,
          })
        }
      >
        <SelectTrigger className="h-9" aria-label="Status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="true">Active</SelectItem>
          <SelectItem value="false">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
}

function CountrySelect({
  label,
  value,
  countries,
  onChange,
}: {
  label: string;
  value?: number;
  countries: AdminCountry[];
  onChange: (id: number | undefined) => void;
}) {
  return (
    <Select
      value={value ? String(value) : "all"}
      onValueChange={(next) =>
        onChange(next === "all" ? undefined : Number(next))
      }
    >
      <SelectTrigger className="h-9" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}s</SelectItem>
        {countries.map((country) => (
          <SelectItem key={country.id} value={String(country.id)}>
            {country.flag} {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
