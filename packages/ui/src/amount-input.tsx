"use client";

import { useEffect, useState } from "react";
import { cn } from "./utils";

type AmountInputProps = {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  currency: string;
  error?: string;
  helperText?: string;
  className?: string;
};

function sanitizeAmount(raw: string) {
  const cleaned = raw.replace(/[^\d.]/g, "");
  const [whole, ...fractionParts] = cleaned.split(".");
  if (fractionParts.length === 0) return whole;
  return `${whole}.${fractionParts.join("").slice(0, 2)}`;
}

export function AmountInput({
  id = "send-amount",
  label = "You send",
  value,
  onChange,
  currency,
  error,
  helperText,
  className,
}: AmountInputProps) {
  const [draft, setDraft] = useState(value);
  const descriptionId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>

      <div
        className={cn(
          "border-b pb-2 transition-colors duration-200",
          error ? "border-danger" : "border-border focus-within:border-navy",
        )}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-subtle md:text-3xl">
            {currency}
          </span>
          <input
            id={id}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={draft}
            onChange={(event) => {
              const next = sanitizeAmount(event.target.value);
              setDraft(next);
              onChange(next);
            }}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={
              [descriptionId, errorId].filter(Boolean).join(" ") || undefined
            }
            className="w-full min-w-0 bg-transparent font-sans text-5xl font-semibold tracking-tight text-navy outline-none placeholder:text-border-strong md:text-6xl"
          />
        </div>
      </div>

      {helperText && !error ? (
        <p id={descriptionId} className="text-sm text-muted">
          {helperText}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-brand">
          {error}
        </p>
      ) : null}
    </div>
  );
}
