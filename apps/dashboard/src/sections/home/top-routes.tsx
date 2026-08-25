import { Link } from "@tanstack/react-router";
import type { DashboardTopRoute } from "@repo/types";
import { formatAmount } from "@/utils/format";
import { EmptyCopy, SectionCard } from "./shared";

export function TopRoutes({ routes }: { routes: DashboardTopRoute[] }) {
  const maxCount = Math.max(...routes.map((route) => route.transfer_count), 0);

  return (
    <SectionCard
      title="Top routes"
      description="Most active corridors in the selected period."
      action={
        <Link
          to="/dashboard/routes"
          className="text-sm font-medium text-navy no-underline hover:underline"
        >
          View routes
        </Link>
      }
    >
      {routes.length === 0 ? (
        <EmptyCopy>No route activity for this period.</EmptyCopy>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {routes.map((route, index) => {
            const width =
              maxCount === 0
                ? 0
                : Math.max((route.transfer_count / maxCount) * 100, 6);
            return (
              <li key={route.route_id} className="px-4 py-3.5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 w-4 shrink-0 text-xs tabular-nums text-subtle">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="inline-flex flex-wrap items-center gap-2 text-sm font-medium text-navy">
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden>{route.source_flag}</span>
                          <span>{route.source_country}</span>
                        </span>
                        <span className="text-subtle" aria-hidden>
                          →
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden>{route.destination_flag}</span>
                          <span>{route.destination_country}</span>
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {route.source_currency} → {route.destination_currency}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium tabular-nums text-navy">
                      {route.transfer_count}{" "}
                      {route.transfer_count === 1 ? "transfer" : "transfers"}
                    </p>
                    <p className="mt-0.5 text-xs tabular-nums text-muted">
                      {formatAmount(
                        route.transfer_volume,
                        route.source_currency,
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-3 h-1 bg-surface">
                  <div
                    className="h-full bg-navy/70"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
