import { type ErrorComponentProps } from "@tanstack/react-router";
import type { DashboardResponse } from "@repo/types";
import { Button } from "@repo/ui/button";
import { DashboardPage } from "@/components/dashboard-page";
import { getErrorMessage } from "@/utils/request";
import { ActionRequired } from "./action-required";
import { DateRangeFilter } from "./date-range";
import { OverviewStats } from "./overview-stats";
import { RecentActivity } from "./recent-activity";
import { RecentTransfers } from "./recent-transfers";
import { StatusDistribution } from "./status-distribution";
import { TopRoutes } from "./top-routes";
import { TransferVolume } from "./volume";
import type { DashboardSearch } from "./search";

export function HomeDashboard({
  data,
  search,
}: {
  data: DashboardResponse;
  search: DashboardSearch;
}) {
  return (
    <DashboardPage
      title="Dashboard"
      description="Overview of your transfer operations."
      actions={
        <DateRangeFilter
          search={search}
          periodFrom={data.period.from}
          periodTo={data.period.to}
        />
      }
    >
      <div className="space-y-6">
        <OverviewStats overview={data.overview} />
        <ActionRequired action={data.action_required} />

        <div className="grid gap-6 lg:grid-cols-2">
          <TransferVolume volume={data.volume} />
          <StatusDistribution distribution={data.status_distribution} />
        </div>

        <RecentTransfers transfers={data.recent_transfers} />

        <div className="grid gap-6 lg:grid-cols-2">
          <TopRoutes routes={data.top_routes} />
          <RecentActivity activity={data.recent_activity} />
        </div>
      </div>
    </DashboardPage>
  );
}

export function HomePending() {
  return (
    <DashboardPage
      title="Dashboard"
      description="Overview of your transfer operations."
    >
      <div className="space-y-6" aria-busy="true">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="h-24 border border-border bg-surface" />
          ))}
        </div>
        <div className="h-36 border border-border bg-surface" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 border border-border bg-surface" />
          <div className="h-64 border border-border bg-surface" />
        </div>
        <div className="h-72 border border-border bg-surface" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-56 border border-border bg-surface" />
          <div className="h-56 border border-border bg-surface" />
        </div>
        <p className="sr-only">Loading dashboard</p>
      </div>
    </DashboardPage>
  );
}

export function HomeError({ error, reset }: ErrorComponentProps) {
  return (
    <DashboardPage
      title="Dashboard"
      description="Overview of your transfer operations."
    >
      <div className="border border-border bg-background px-4 py-10 text-center">
        <p className="text-sm text-muted">
          Dashboard data could not be loaded. {getErrorMessage(error)}
        </p>
        <Button type="button" size="sm" className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </DashboardPage>
  );
}
