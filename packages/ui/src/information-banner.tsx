import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { cn } from "./utils";

type InformationBannerProps = {
  title?: string;
  children: ReactNode;
  icon?: LucideIcon;
  tone?: "info" | "warning" | "success";
  className?: string;
};

const toneStyles = {
  info: "border-border bg-surface text-foreground",
  warning: "border-border bg-gold-soft text-navy",
  success: "border-border bg-success-soft text-success",
} as const;

export function InformationBanner({
  title,
  children,
  icon: Icon = Info,
  tone = "info",
  className,
}: InformationBannerProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 border px-4 py-3.5",
        toneStyles[tone],
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
      <div className="min-w-0 space-y-1">
        {title ? (
          <p className="text-sm font-medium text-foreground">{title}</p>
        ) : null}
        <div className="text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </div>
  );
}
