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
  compactPaymentAccountsSearch,
  type PaymentAccountsSearch,
} from "./search";

export function PaymentAccountFilters({
  search,
  countries,
}: {
  search: PaymentAccountsSearch;
  countries: AdminCountry[];
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(search.q ?? "");

  useEffect(() => {
    setQuery(search.q ?? "");
  }, [search.q]);

  function go(next: PaymentAccountsSearch) {
    void navigate({
      to: "/dashboard/payment-accounts",
      search: compactPaymentAccountsSearch(next),
    });
  }

  return (
    <form
      className="grid gap-3 md:grid-cols-[minmax(0,1fr)_11rem_10rem_9rem]"
      onSubmit={(event) => {
        event.preventDefault();
        go({
          ...search,
          q: query.trim() || undefined,
        });
      }}
    >
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        name="q"
        placeholder="Search accounts…"
        aria-label="Search payment accounts"
        className="h-9"
      />

      <Select
        value={search.country ? String(search.country) : "all"}
        onValueChange={(value) =>
          go({
            ...search,
            country: value === "all" ? undefined : Number(value),
            q: query.trim() || undefined,
          })
        }
      >
        <SelectTrigger className="h-9" aria-label="Country">
          <SelectValue placeholder="Country" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All countries</SelectItem>
          {countries.map((country) => (
            <SelectItem key={country.id} value={String(country.id)}>
              {country.flag} {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={search.method ?? "all"}
        onValueChange={(value) =>
          go({
            ...search,
            method:
              value === "all"
                ? undefined
                : (value as "BANK" | "MOBILE_MONEY"),
            q: query.trim() || undefined,
          })
        }
      >
        <SelectTrigger className="h-9" aria-label="Method">
          <SelectValue placeholder="Method" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All methods</SelectItem>
          <SelectItem value="BANK">Bank</SelectItem>
          <SelectItem value="MOBILE_MONEY">Mobile money</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={search.active ?? "all"}
        onValueChange={(value) =>
          go({
            ...search,
            active:
              value === "all" ? undefined : (value as "true" | "false"),
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
