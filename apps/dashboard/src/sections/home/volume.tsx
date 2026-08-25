import type { DashboardVolumePoint } from "@repo/types";
import { formatAmount, formatDate } from "@/utils/format";
import { EmptyCopy, SectionCard } from "./shared";

type DayBucket = {
  date: string;
  transferCount: number;
  volumes: Array<{ currency: string; volume: string; count: number }>;
};

function groupByDate(points: DashboardVolumePoint[]): DayBucket[] {
  const map = new Map<string, DayBucket>();

  for (const point of points) {
    const existing = map.get(point.date);
    if (!existing) {
      map.set(point.date, {
        date: point.date,
        transferCount: point.transfer_count,
        volumes: [
          {
            currency: point.currency,
            volume: point.volume,
            count: point.transfer_count,
          },
        ],
      });
      continue;
    }

    existing.transferCount += point.transfer_count;
    existing.volumes.push({
      currency: point.currency,
      volume: point.volume,
      count: point.transfer_count,
    });
  }

  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function TransferVolume({ volume }: { volume: DashboardVolumePoint[] }) {
  const days = groupByDate(volume);
  const max = Math.max(...days.map((day) => day.transferCount), 0);

  return (
    <SectionCard
      title="Transfer volume"
      description="Transfer count by day. Amounts stay split by currency."
    >
      {days.length === 0 ? (
        <EmptyCopy>No transfer volume for this period.</EmptyCopy>
      ) : (
        <div className="space-y-5">
          <div
            className="flex h-40 items-end gap-2 border border-border bg-surface px-3 pt-3 pb-2 sm:gap-2.5"
            role="img"
            aria-label="Transfer count by day"
          >
            {days.map((day) => {
              const height =
                max === 0 ? 0 : Math.max((day.transferCount / max) * 100, 6);
              return (
                <div
                  key={day.date}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2"
                >
                  <span className="text-[11px] tabular-nums text-muted">
                    {day.transferCount}
                  </span>
                  <div className="flex h-28 w-full items-end justify-center">
                    <div
                      className="w-full max-w-10 bg-navy"
                      style={{ height: `${height}%` }}
                      title={day.volumes
                        .map(
                          (item) =>
                            `${formatAmount(item.volume, item.currency)} · ${item.count}`,
                        )
                        .join(" · ")}
                    />
                  </div>
                  <span className="truncate text-[10px] text-subtle">
                    {formatDate(`${day.date}T00:00:00Z`)}
                  </span>
                </div>
              );
            })}
          </div>

          <ul className="space-y-0 divide-y divide-border border-t border-border">
            {days.map((day) => (
              <li
                key={`${day.date}-detail`}
                className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 text-sm"
              >
                <span className="text-muted">
                  {formatDate(`${day.date}T00:00:00Z`)}
                </span>
                <span className="tabular-nums text-navy">
                  {day.volumes
                    .map((item) => formatAmount(item.volume, item.currency))
                    .join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}
