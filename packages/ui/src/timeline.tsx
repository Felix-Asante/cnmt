import { Check } from "lucide-react";
import { cn } from "./utils";

export type TimelineItem = {
  id: string;
  title: string;
  description?: string;
  status: "complete" | "current" | "upcoming";
};

type TimelineProps = {
  items: TimelineItem[];
  className?: string;
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("space-y-0", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <li key={item.id} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden
                className={cn(
                  "absolute top-7 left-[11px] h-[calc(100%-16px)] w-px",
                  item.status === "complete" ? "bg-navy" : "bg-border",
                )}
              />
            ) : null}

            <span
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center border text-[10px] font-semibold",
                item.status === "complete" &&
                  "border-navy bg-navy text-white",
                item.status === "current" &&
                  "border-brand bg-brand text-white",
                item.status === "upcoming" &&
                  "border-border bg-background text-subtle",
              )}
              aria-current={item.status === "current" ? "step" : undefined}
            >
              {item.status === "complete" ? (
                <Check className="size-3" strokeWidth={2.5} aria-hidden />
              ) : (
                index + 1
              )}
            </span>

            <div className="min-w-0 pt-0.5">
              <p
                className={cn(
                  "text-sm font-medium",
                  item.status === "upcoming"
                    ? "text-subtle"
                    : "text-foreground",
                )}
              >
                {item.title}
              </p>
              {item.description ? (
                <p className="mt-1 text-sm text-muted">{item.description}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
