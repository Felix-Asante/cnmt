"use client";

import { useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { AmountInput } from "@repo/ui/amount-input";
import { CorridorPicker } from "@repo/ui/corridor-picker";
import {
  RECIPIENT_COUNTRIES,
  SENDER_COUNTRIES,
  getRecipientCountry,
  getSenderCountry,
  getTransferQuote,
} from "../constants";
import { getRecentCorridors, type RecentCorridor } from "../memory";
import type { TransferFormValues } from "../schema";

type TransferStepProps = {
  form: UseFormReturn<TransferFormValues>;
};

export function TransferStep({ form }: TransferStepProps) {
  const [recent, setRecent] = useState<RecentCorridor[]>([]);
  const senderCode = form.watch("senderCountryCode");
  const recipientCode = form.watch("recipientCountryCode");
  const amount = form.watch("sendAmount");
  const errors = form.formState.errors;

  const sender = getSenderCountry(senderCode);
  const recipient = getRecipientCountry(recipientCode);
  const currency = sender?.currency ?? form.watch("sendCurrency");

  const quote = getTransferQuote(
    amount,
    currency,
    recipient?.receiveCurrency ?? "GHS",
  );

  useEffect(() => {
    setRecent(getRecentCorridors());
  }, []);

  // Keep send currency locked to the selected sender country.
  useEffect(() => {
    if (!sender) return;
    if (form.getValues("sendCurrency") !== sender.currency) {
      form.setValue("sendCurrency", sender.currency, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, sender]);

  function applyCorridor(nextSender: string, nextRecipient: string) {
    const senderCountry = getSenderCountry(nextSender);
    const recipientCountry = getRecipientCountry(nextRecipient);

    form.setValue("senderCountryCode", nextSender, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("recipientCountryCode", nextRecipient, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (senderCountry) {
      form.setValue("sendCurrency", senderCountry.currency, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (recipientCountry) {
      const method = recipientCountry.methods.includes("mobile_money")
        ? "mobile_money"
        : "bank";
      form.setValue("receivingMethod", method, { shouldDirty: true });
      form.setValue(
        "network",
        method === "mobile_money" ? (recipientCountry.networks[0] ?? "") : "",
        { shouldDirty: true },
      );
      form.setValue(
        "bank",
        method === "bank" ? (recipientCountry.banks[0] ?? "") : "",
        { shouldDirty: true },
      );
    }
  }

  return (
    <div className="space-y-10">
      <header className="max-w-lg space-y-2">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
          Send money abroad
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Choose where you’re sending from, where it’s going, and how much.
        </p>
      </header>

      {recent.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-subtle">Recent</span>
          {recent.map((item) => {
            const from = getSenderCountry(item.senderCountryCode);
            const to = getRecipientCountry(item.recipientCountryCode);
            if (!from || !to) return null;
            const active =
              senderCode === from.code && recipientCode === to.code;
            return (
              <button
                key={`${from.code}-${to.code}`}
                type="button"
                onClick={() => applyCorridor(from.code, to.code)}
                className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
                  active
                    ? "border-navy bg-navy text-white"
                    : "border-border text-muted hover:border-border-strong hover:text-foreground"
                }`}
              >
                {from.flag} {from.code}
                <span className="opacity-50">→</span>
                {to.flag} {to.code}
              </button>
            );
          })}
        </div>
      ) : null}

      <CorridorPicker
        from={{
          id: "sender-country",
          label: "From",
          value: senderCode,
          recentCodes: recent.map((item) => item.senderCountryCode),
          options: SENDER_COUNTRIES.map((country) => ({
            code: country.code,
            name: country.name,
            flag: country.flag,
            meta: country.currency,
          })),
          onChange: (code) => {
            const currentRecipient = form.getValues("recipientCountryCode");
            applyCorridor(code, currentRecipient || "GH");
          },
          error: errors.senderCountryCode?.message,
        }}
        to={{
          id: "recipient-country",
          label: "To",
          value: recipientCode,
          recentCodes: recent.map((item) => item.recipientCountryCode),
          options: RECIPIENT_COUNTRIES.map((country) => ({
            code: country.code,
            name: country.name,
            flag: country.flag,
            meta: country.methodLabels.join(" · "),
          })),
          onChange: (code) => {
            const currentSender = form.getValues("senderCountryCode");
            applyCorridor(currentSender || "GB", code);
          },
          error: errors.recipientCountryCode?.message,
        }}
      />

      <AmountInput
        value={amount}
        currency={currency}
        onChange={(value) =>
          form.setValue("sendAmount", value, {
            shouldDirty: true,
            shouldTouch: true,
          })
        }
        error={
          form.formState.touchedFields.sendAmount || form.formState.isSubmitted
            ? errors.sendAmount?.message
            : undefined
        }
        helperText={
          quote.hasAmount
            ? `Recipient receives ${quote.receiveLabel}`
            : recipient
              ? `Recipient receives in ${recipient.receiveCurrency}`
              : undefined
        }
      />

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-muted">Rate</dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {quote.rateLabel}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Fee</dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {quote.feeLabel}
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-xs text-muted">They receive</dt>
          <dd
            className="mt-1 text-sm font-semibold text-navy"
            aria-live="polite"
          >
            {quote.receiveLabel}
          </dd>
        </div>
      </dl>
    </div>
  );
}
