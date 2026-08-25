import type { DashboardStatusCount } from "@repo/types";
import { TRANSFER_STATUS_LABELS } from "@/sections/transfers/constants";
import { EmptyCopy, SectionCard } from "./shared";

const STATUS_COLOR: Record<string, string> = {
  PENDING_PAYMENT: "bg-gold",
  PAYMENT_RECEIVED: "bg-navy",
  VERIFYING: "bg-navy/80",
  PROCESSING: "bg-navy/60",
  COMPLETED: "bg-success",
  FAILED: "bg-brand",
  CANCELLED: "bg-border-strong",
};

export function StatusDistribution({
  distribution,
}: {
  distribution: DashboardStatusCount[];
}) {
  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <SectionCard
      title="Status distribution"
      description="How transfers in this period are split by status."
    >
      {distribution.length === 0 || total === 0 ? (
        <EmptyCopy>No status data for this period.</EmptyCopy>
      ) : (
        <div className="space-y-4">
          <div
            className="flex h-2.5 overflow-hidden bg-surface"
            role="img"
            aria-label="Status distribution"
          >
            {distribution.map((item) => (
              <div
                key={item.status}
                className={STATUS_COLOR[item.status] ?? "bg-muted"}
                style={{ width: `${(item.count / total) * 100}%` }}
                title={`${TRANSFER_STATUS_LABELS[item.status]}: ${item.count}`}
              />
            ))}
          </div>

          <ul className="space-y-3">
            {distribution.map((item) => {
              const percent = Math.round((item.count / total) * 100);
              return (
                <li key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="inline-flex items-center gap-2 text-navy">
                      <span
                        className={`size-2 shrink-0 ${STATUS_COLOR[item.status] ?? "bg-muted"}`}
                        aria-hidden
                      />
                      {TRANSFER_STATUS_LABELS[item.status]}
                    </span>
                    <span className="tabular-nums text-muted">
                      {item.count} · {percent}%
                    </span>
                  </div>
                  <div className="h-1 bg-surface">
                    <div
                      className={`h-full ${STATUS_COLOR[item.status] ?? "bg-muted"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}
