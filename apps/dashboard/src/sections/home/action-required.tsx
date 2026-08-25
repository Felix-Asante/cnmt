import { Link } from "@tanstack/react-router";
import { Clock3, ShieldCheck, Zap } from "lucide-react";
import type { DashboardActionRequired, TransferStatus } from "@repo/types";
import { Button } from "@repo/ui/button";
import { cn } from "@/lib/utils";
import { EmptyCopy, SectionCard } from "./shared";

type ActionItem = {
  key: string;
  title: string;
  count: number;
  description: string;
  status: TransferStatus;
  accent: string;
  icon: typeof ShieldCheck;
};

export function ActionRequired({
  action,
}: {
  action: DashboardActionRequired;
}) {
  const items: ActionItem[] = (
    [
      {
        key: "verification",
        title: "Payment verification",
        count: action.payment_verification_count,
        description: "Payments waiting to be confirmed before payout.",
        status: "PAYMENT_RECEIVED",
        accent: "border-l-brand",
        icon: ShieldCheck,
      },
      {
        key: "processing",
        title: "Processing",
        count: action.processing_count,
        description: "Payouts in progress that still need to be completed.",
        status: "PROCESSING",
        accent: "border-l-navy",
        icon: Zap,
      },
      {
        key: "expiring",
        title: "Approaching expiry",
        count: action.expiring_count,
        description: "Pending payments that expire within 24 hours.",
        status: "PENDING_PAYMENT",
        accent: "border-l-gold",
        icon: Clock3,
      },
    ] satisfies ActionItem[]
  ).filter((item) => item.count > 0);

  return (
    <SectionCard
      title="Action required"
      description="Live queues that need attention now."
    >
      {items.length === 0 ? (
        <EmptyCopy>Nothing needs attention right now.</EmptyCopy>
      ) : (
        <ul className="divide-y divide-border border border-border">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.key}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 border-l-2 bg-background px-4 py-3.5",
                  item.accent,
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <Icon
                    className="mt-0.5 size-4 shrink-0 text-muted"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy">
                      {item.title}
                      <span className="ml-2 tabular-nums text-muted">
                        ({item.count})
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link
                    to="/dashboard/transfers"
                    search={{ status: item.status }}
                  >
                    View transfers
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
