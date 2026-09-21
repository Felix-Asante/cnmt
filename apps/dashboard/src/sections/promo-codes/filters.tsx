import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Input } from "@repo/ui/input";
import {
  compactPromoCodesSearch,
  type PromoCodesSearch,
} from "./search";

export function PromoCodeFilters({ search }: { search: PromoCodesSearch }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(search.q ?? "");

  useEffect(() => {
    setQuery(search.q ?? "");
  }, [search.q]);

  function go(next: PromoCodesSearch) {
    void navigate({
      to: "/dashboard/promo-codes",
      search: compactPromoCodesSearch(next),
    });
  }

  return (
    <form
      className="grid gap-3 md:grid-cols-[minmax(0,1fr)]"
      onSubmit={(event) => {
        event.preventDefault();
        go({ q: query.trim() || undefined });
      }}
    >
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        name="q"
        placeholder="Search codes…"
        aria-label="Search promo codes"
        className="h-9"
      />
    </form>
  );
}
