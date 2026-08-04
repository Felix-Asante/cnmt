"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "./utils";

export type PaymentDetail = {
  label: string;
  value: string;
  copyable?: boolean;
};

type PaymentCardProps = {
  title?: string;
  amountLabel: string;
  amountValue: string;
  details: PaymentDetail[];
  className?: string;
};

export function PaymentCard({
  title = "Payment details",
  amountLabel,
  amountValue,
  details,
  className,
}: PaymentCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      setCopiedKey(null);
    }
  }

  return (
    <section className={cn("border border-border bg-background", className)}>
      <div className="border-b border-border bg-navy px-6 py-6 text-white">
        <p className="text-[11px] font-medium tracking-[0.16em] text-white/55 uppercase">
          {title}
        </p>
        <p className="mt-4 text-xs text-white/55">{amountLabel}</p>
        <p className="mt-1 font-sans text-3xl font-semibold tracking-tight">
          {amountValue}
        </p>
      </div>

      <ul className="divide-y divide-border">
        {details.map((detail) => (
          <li
            key={detail.label}
            className="flex items-center justify-between gap-4 px-6 py-4"
          >
            <div className="min-w-0">
              <p className="text-xs text-muted">{detail.label}</p>
              <p className="mt-1 truncate text-sm font-medium text-foreground">
                {detail.value}
              </p>
            </div>
            {detail.copyable ? (
              <button
                type="button"
                onClick={() => copyValue(detail.label, detail.value)}
                aria-label={`Copy ${detail.label}`}
                className="inline-flex shrink-0 items-center gap-1.5 border border-border px-2.5 py-1.5 text-xs font-medium text-navy transition-colors duration-150 hover:border-navy hover:bg-surface"
              >
                {copiedKey === detail.label ? (
                  <Check className="size-3.5 text-success" aria-hidden />
                ) : (
                  <Copy className="size-3.5" aria-hidden />
                )}
                {copiedKey === detail.label ? "Copied" : "Copy"}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
