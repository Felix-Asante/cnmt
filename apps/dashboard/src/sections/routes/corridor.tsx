import type { AdminCountry } from "@repo/types";
import { cn } from "@/lib/utils";

export function RouteCorridor({
  source,
  destination,
  layout = "inline",
}: {
  source?: AdminCountry;
  destination?: AdminCountry;
  layout?: "inline" | "stack";
}) {
  if (layout === "stack") {
    return (
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <CountryBlock label="Source" country={source} />
        <span className="text-subtle" aria-hidden>
          →
        </span>
        <CountryBlock label="Destination" country={destination} />
      </div>
    );
  }

  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-2">
      <CountryName country={source} />
      <span className="text-subtle" aria-hidden>
        →
      </span>
      <CountryName country={destination} />
    </span>
  );
}

function CountryBlock({
  label,
  country,
}: {
  label: string;
  country?: AdminCountry;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-navy">
        <CountryName country={country} />
      </p>
    </div>
  );
}

function CountryName({ country }: { country?: AdminCountry }) {
  if (!country) return <span className="text-muted">Unknown country</span>;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("text-base leading-none")} aria-hidden>
        {country.flag}
      </span>
      <span>{country.name}</span>
    </span>
  );
}
