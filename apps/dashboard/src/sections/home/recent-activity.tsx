import { Link } from "@tanstack/react-router";
import type { DashboardActivityItem, TransferStatus } from "@repo/types";
import { TRANSFER_STATUS_LABELS } from "@/sections/transfers/constants";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/utils/format";
import { EmptyCopy, SectionCard } from "./shared";

const STATUS_DOT: Record<TransferStatus, string> = {
  PENDING_PAYMENT: "bg-gold",
  PAYMENT_RECEIVED: "bg-navy",
  VERIFYING: "bg-navy/80",
  PROCESSING: "bg-navy/60",
  COMPLETED: "bg-success",
  FAILED: "bg-brand",
  CANCELLED: "bg-border-strong",
};

export function RecentActivity({
  activity,
}: {
  activity: DashboardActivityItem[];
}) {
  return (
    <SectionCard
      title="Recent activity"
      description="Latest transfer events across the system."
    >
      {activity.length === 0 ? (
        <EmptyCopy>No recent activity.</EmptyCopy>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {activity.map((item, index) => (
            <li
              key={`${item.reference}-${item.created_at}-${index}`}
              className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0",
                    STATUS_DOT[item.status],
                  )}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-navy">
                    {TRANSFER_STATUS_LABELS[item.status]}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    <Link
                      to="/dashboard/transfers/$reference"
                      params={{ reference: item.reference }}
                      className="font-medium text-navy no-underline hover:underline"
                    >
                      {item.reference}
                    </Link>
                    {item.note ? (
                      <span className="text-muted"> · {item.note}</span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs text-subtle">{item.actor}</p>
                </div>
              </div>
              <p className="shrink-0 text-xs text-muted">
                {formatRelativeTime(item.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
