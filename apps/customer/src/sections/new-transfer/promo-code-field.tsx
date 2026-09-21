"use client";

import { useTransition } from "react";
import type { PreviewPromoCode } from "@repo/types";
import { formatPromoDiscount } from "@/utils/transfer";
import { Button } from "@repo/ui/button";
import { Field } from "@repo/ui/field";
import { Input } from "@repo/ui/input";

type PromoCodeFieldProps = {
  value: string;
  applied: PreviewPromoCode | null;
  error?: string;
  onChange: (value: string) => void;
  onApply: (code: string) => Promise<string | null>;
  onClear: () => void;
};

export function PromoCodeField({
  value,
  applied,
  error,
  onChange,
  onApply,
  onClear,
}: PromoCodeFieldProps) {
  const [isPending, startTransition] = useTransition();

  function handleApply() {
    startTransition(async () => {
      await onApply(value);
    });
  }

  return (
    <div className="space-y-3 border-t border-border pt-5">
      <Field
        label="Promo code"
        htmlFor="promoCode"
        error={error}
        description={
          applied
            ? `${applied.code} applied · ${formatPromoDiscount(applied.discount_percentage)} off the fee`
            : "Optional. Apply a valid code to reduce the transfer fee."
        }
      >
        <div className="flex gap-2">
          <Input
            id="promoCode"
            value={value}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            placeholder="SAVE10"
            autoComplete="off"
            spellCheck={false}
            disabled={Boolean(applied) || isPending}
            className="font-mono uppercase tracking-wide"
          />
          {applied ? (
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onClear}
            >
              Remove
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isPending || !value.trim()}
              onClick={handleApply}
            >
              {isPending ? "Checking…" : "Apply"}
            </Button>
          )}
        </div>
      </Field>
    </div>
  );
}
