import type { ReactNode } from "react";
import type { DashboardMoneyByCurrency } from "@repo/types";
import { formatAmount } from "@/utils/format";

export function formatMoneyList(items: DashboardMoneyByCurrency[]) {
  if (items.length === 0) return "—";
  return items
    .map((item) => formatAmount(item.amount, item.currency))
    .join(" · ");
}

export function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border border-border bg-background">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-navy">{title}</h2>
          {description ? (
            <p className="mt-1 text-xs leading-relaxed text-muted">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function EmptyCopy({ children }: { children: ReactNode }) {
  return (
    <p className="px-1 py-10 text-center text-sm text-muted">{children}</p>
  );
}
