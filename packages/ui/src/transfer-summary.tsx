import { Lock } from "lucide-react";
import { cn } from "./utils";

export type TransferSummaryItem = {
  label: string;
  value: string;
  emphasis?: boolean;
};

type TransferSummaryProps = {
  title?: string;
  items: TransferSummaryItem[];
  estimatedCompletion: string;
  className?: string;
  receiveHighlight?: string;
  feesIncluded?: boolean;
  feesIncludedText?: string;
};

export function TransferSummary({
  title = "Summary",
  items,
  estimatedCompletion,
  className,
  receiveHighlight,
  feesIncluded = true,
  feesIncludedText = "Fees are included in the total",
}: TransferSummaryProps) {
  const emphasised = items.filter((item) => item.emphasis);
  const rest = items.filter(
    (item) => !item.emphasis && !item.label.toLowerCase().includes("fee"),
  );

  const sendLabel =
    emphasised[0]?.label.toLowerCase() === "you send"
      ? "Total you send"
      : (emphasised[0]?.label ?? "Total you send");

  return (
    <aside
      className={cn("border border-border bg-background p-6 md:p-7", className)}
      aria-label={title}
    >
      <p className="text-[11px] font-medium tracking-[0.16em] text-subtle uppercase">
        {title}
      </p>

      {receiveHighlight || emphasised[1] ? (
        <div className="mt-5 border-b border-border pb-5">
          <p className="text-xs text-muted">Recipient gets</p>
          <p className="mt-1 font-sans text-2xl font-semibold tracking-tight text-navy">
            {receiveHighlight ?? emphasised[1]?.value}
          </p>
          {emphasised[0] ? (
            <div className="mt-2 flex items-baseline justify-between gap-2 text-sm">
              <span className="text-muted">{sendLabel}</span>
              <span className="font-semibold text-navy">
                {emphasised[0].value}
              </span>
            </div>
          ) : null}
          {feesIncluded ? (
            <p className="mt-1 text-xs text-subtle">
              {feesIncludedText}
            </p>
          ) : null}
        </div>
      ) : feesIncluded ? (
        <p className="mt-2 text-xs text-subtle">
          {feesIncludedText}
        </p>
      ) : null}

      <dl className="mt-5 space-y-3">
        {rest.map((item) => (
          <div
            key={item.label}
            className="flex items-baseline justify-between gap-4"
          >
            <dt className="text-sm text-muted">{item.label}</dt>
            <dd className="text-right text-sm font-medium text-foreground">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-xs text-muted">Arrives</p>
        <p className="mt-1 text-sm font-medium text-foreground">
          {estimatedCompletion}
        </p>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted">
        <Lock className="size-3.5 shrink-0" aria-hidden />
        <p>
          We won&apos;t be responsible for a wrong details given. Please verify
          your recipient details.{" "}
        </p>
      </div>
    </aside>
  );
}
