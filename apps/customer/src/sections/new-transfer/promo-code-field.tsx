"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("NewTransfer.Promo");
  const [isPending, startTransition] = useTransition();

  function handleApply() {
    startTransition(async () => {
      await onApply(value);
    });
  }

  return (
    <div className="space-y-3 border-t border-border pt-5">
      <Field
        label={t("label")}
        htmlFor="promoCode"
        error={error}
        description={
          applied
            ? t("applied", {
                code: applied.code,
                discount: formatPromoDiscount(applied.discount_percentage),
              })
            : t("description")
        }
      >
        <div className="flex gap-2">
          <Input
            id="promoCode"
            value={value}
            onChange={(event) => onChange(event.target.value.toUpperCase())}
            placeholder={t("placeholder")}
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
              {t("remove")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              disabled={isPending || !value.trim()}
              onClick={handleApply}
            >
              {isPending ? t("checking") : t("apply")}
            </Button>
          )}
        </div>
      </Field>
    </div>
  );
}
