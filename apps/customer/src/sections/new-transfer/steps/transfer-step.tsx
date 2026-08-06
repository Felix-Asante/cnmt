"use client";

import { useEffect, useState } from "react";
import { useFormState, useWatch, type UseFormReturn } from "react-hook-form";
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
  const [recent] = useState<RecentCorridor[]>(getRecentCorridors());
  const senderCode = useWatch({
    control: form.control,
    name: "senderCountryCode",
  });
  const recipientCode = useWatch({
    control: form.control,
    name: "recipientCountryCode",
  });
  const amount = useWatch({ control: form.control, name: "sendAmount" });
  const sendCurrency = useWatch({
    control: form.control,
    name: "sendCurrency",
  });

  const errors = form.formState?.errors;

  const sender = getSenderCountry(senderCode);
  const recipient = getRecipientCountry(recipientCode);
  const currency = sender?.currency ?? sendCurrency;

  const quote = getTransferQuote(
    amount,
    currency,
    recipient?.receiveCurrency ?? "GHS",
  );

  useEffect(() => {
    if (!sender) return;
    if (sendCurrency !== sender.currency) {
      form.setValue("sendCurrency", sender.currency, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, sendCurrency, sender]);

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
        error={errors?.sendAmount?.message}
        helperText={
          quote.hasAmount
            ? `Recipient receives ${quote.receiveLabel}`
            : recipient
              ? `Recipient receives in ${recipient.receiveCurrency}`
              : undefined
        }
      />
    </div>
  );
}
