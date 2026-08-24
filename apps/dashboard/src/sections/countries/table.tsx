import { Link, useNavigate } from "@tanstack/react-router";
import type { AdminCountry } from "@repo/types";
import { Badge } from "@repo/ui/badge";

export function CountryTable({ countries }: { countries: AdminCountry[] }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-xl border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-surface">
            <HeaderCell>Country</HeaderCell>
            <HeaderCell>ISO code</HeaderCell>
            <HeaderCell>Currency</HeaderCell>
            <HeaderCell>Status</HeaderCell>
          </tr>
        </thead>
        <tbody>
          {countries.map((country) => {
            const id = String(country.id);

            return (
              <tr
                key={country.id}
                className="cursor-pointer border-b border-border last:border-b-0 hover:bg-surface"
                onClick={() =>
                  void navigate({
                    to: "/dashboard/countries/$id",
                    params: { id },
                  })
                }
              >
                <td className="px-4 py-3.5">
                  <Link
                    to="/dashboard/countries/$id"
                    params={{ id }}
                    onClick={(event) => event.stopPropagation()}
                    className="inline-flex items-center gap-2.5 font-medium text-navy no-underline hover:underline"
                  >
                    <span className="text-lg leading-none" aria-hidden>
                      {country.flag}
                    </span>
                    <span>{country.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs tracking-wider text-foreground">
                  {country.iso_code}
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-foreground">
                    {country.currency_code}
                  </span>
                  <span className="ml-1.5 text-muted">
                    ({country.currency_symbol})
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <Badge variant={country.is_active ? "success" : "neutral"}>
                    {country.is_active ? "Active" : "Inactive"}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function HeaderCell({ children }: { children: string }) {
  return (
    <th className="px-4 py-3 text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
      {children}
    </th>
  );
}
