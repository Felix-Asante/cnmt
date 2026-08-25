import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  Banknote,
  BadgeCheck,
  Clock3,
  Receipt,
  ShieldCheck,
  Zap,
} from "lucide-react";
import type { DashboardOverview } from "@repo/types";
import { cn } from "@/lib/utils";
import { formatMoneyList } from "./shared";

type KpiAccent = "default" | "attention" | "success";

type Kpi = {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  accent: KpiAccent;
};

const ACCENT: Record<KpiAccent, string> = {
  default: "border-l-navy",
  attention: "border-l-gold",
  success: "border-l-success",
};

export function OverviewStats({ overview }: { overview: DashboardOverview }) {
  const items: Kpi[] = [
    {
      label: "Total transfers",
      value: String(overview.total_transfers),
      icon: ArrowLeftRight,
      accent: "default",
    },
    {
      label: "Transfer volume",
      value: formatMoneyList(overview.total_transfer_volume),
      hint: "By source currency",
      icon: Banknote,
      accent: "default",
    },
    {
      label: "Pending payment",
      value: String(overview.pending_payment),
      icon: Clock3,
      accent: "attention",
    },
    {
      label: "Payment verification",
      value: String(overview.payment_verification),
      icon: ShieldCheck,
      accent: "attention",
    },
    {
      label: "Processing",
      value: String(overview.processing),
      icon: Zap,
      accent: "default",
    },
    {
      label: "Completed",
      value: String(overview.completed),
      icon: BadgeCheck,
      accent: "success",
    },
    {
      label: "Total fees",
      value: formatMoneyList(overview.total_fees),
      hint: "By destination currency",
      icon: Receipt,
      accent: "default",
    },
  ];

  return (
    <section aria-label="Overview">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={cn(
                "border border-border border-l-2 bg-background px-4 py-4",
                ACCENT[item.accent],
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-medium tracking-[0.12em] text-subtle uppercase">
                  {item.label}
                </p>
                <Icon className="size-4 shrink-0 text-subtle" aria-hidden />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums text-navy">
                {item.value}
              </p>
              {item.hint ? (
                <p className="mt-1.5 text-xs text-muted">{item.hint}</p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
