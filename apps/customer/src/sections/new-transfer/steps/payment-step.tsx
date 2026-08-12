"use client";

import type { UseFormReturn } from "react-hook-form";
import { InformationBanner } from "@repo/ui/information-banner";
import { PaymentCard } from "@repo/ui/payment-card";
import { STATIC_QUOTE, formatMoney } from "../constants";
import type { TransferFormValues } from "../schema";

type PaymentStepProps = {
  form: UseFormReturn<TransferFormValues>;
  reference: string;
};

export function PaymentStep({ form, reference }: PaymentStepProps) {
  const amount = form.watch("sendAmount");
  const currency = form.watch("sendCurrency");
  const parsedAmount = Number(amount);
  const displayAmount =
    amount && Number.isFinite(parsedAmount) && parsedAmount > 0
      ? formatMoney(parsedAmount, currency)
      : `— ${currency.trim() || "—"}`;

  return (
    <div className="space-y-8">
      <header className="max-w-lg space-y-2">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
          Make your payment
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Transfer the exact amount and include the reference so we can match it
          quickly.
        </p>
      </header>

      <InformationBanner title="Verified before processing">
        We’ll confirm your payment before sending money to the recipient. Most
        transfers complete within 30 minutes after verification.
      </InformationBanner>

      <PaymentCard
        amountLabel="Amount to pay"
        amountValue={displayAmount}
        details={[
          {
            label: "Payment method",
            value: STATIC_QUOTE.paymentMethod,
          },
          {
            label: "Account name",
            value: STATIC_QUOTE.accountName,
            copyable: true,
          },
          {
            label: "Account number",
            value: STATIC_QUOTE.accountNumber,
            copyable: true,
          },
          {
            label: "Sort code",
            value: STATIC_QUOTE.sortCode,
            copyable: true,
          },
          {
            label: "Payment reference",
            value: reference,
            copyable: true,
          },
        ]}
      />
    </div>
  );
}
