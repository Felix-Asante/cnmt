import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import type { PromoCode } from "@repo/types";
import { Button } from "@repo/ui/button";
import { DashboardPage } from "@/components/dashboard-page";
import { getErrorMessage } from "@/utils/request";
import { PromoCodeFilters } from "./filters";
import { hasPromoCodeFilters, type PromoCodesSearch } from "./search";
import { PromoCodeTable } from "./table";

function matchesQuery(promo: PromoCode, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return promo.code.toLowerCase().includes(normalized);
}

export function PromoCodesList({
  promoCodes,
  search,
}: {
  promoCodes: PromoCode[];
  search: PromoCodesSearch;
}) {
  const visible = promoCodes.filter((promo) =>
    matchesQuery(promo, search.q ?? ""),
  );
  const filtered = hasPromoCodeFilters(search);

  return (
    <DashboardPage
      title="Promo codes"
      description="Percentage discounts customers can apply during a transfer."
      actions={
        <Button size="sm" asChild>
          <Link to="/dashboard/promo-codes/new" search={(prev) => prev}>
            Add promo code
          </Link>
        </Button>
      }
    >
      <PromoCodeFilters search={search} />

      <div className="border border-border bg-background">
        {visible.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm text-muted">
              {filtered
                ? "No promo codes match this search."
                : "No promo codes configured."}
            </p>
            {!filtered ? (
              <Button size="sm" className="mt-4" asChild>
                <Link to="/dashboard/promo-codes/new">Add promo code</Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <PromoCodeTable promoCodes={visible} />
        )}
      </div>
    </DashboardPage>
  );
}

export function PromoCodesPending() {
  return (
    <DashboardPage title="Promo codes" description="Loading promo codes…">
      <div className="space-y-3" aria-hidden>
        <div className="h-9 bg-surface" />
        <div className="border border-border bg-background p-4">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="mb-3 h-12 bg-surface last:mb-0" />
          ))}
        </div>
      </div>
    </DashboardPage>
  );
}

export function PromoCodesError({ error, reset }: ErrorComponentProps) {
  return (
    <DashboardPage title="Promo codes">
      <div className="border border-border bg-background px-4 py-16 text-center">
        <p className="text-sm text-muted">{getErrorMessage(error)}</p>
        <Button type="button" size="sm" className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </DashboardPage>
  );
}
