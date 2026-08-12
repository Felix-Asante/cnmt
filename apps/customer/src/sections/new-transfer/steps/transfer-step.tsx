"use client";

import { useEffect, useState } from "react";
import { useFormState, useWatch, type UseFormReturn } from "react-hook-form";
import { AmountInput } from "@repo/ui/amount-input";
import { CorridorPicker } from "@repo/ui/corridor-picker";
import {
  RECIPIENT_COUNTRIES,
  SENDER_COUNTRIES,
  calculateFee,
  getRecipientCountry,
  getSenderCountry,
  getTransferQuote,
} from "../constants";
import { getRecentCorridors, type RecentCorridor } from "../memory";
import type { TransferFormValues } from "../schema";
import type { TransferOptions } from "@repo/types";

type TransferStepProps = {
  form: UseFormReturn<TransferFormValues>;
  transferOptions: TransferOptions;
};

export function TransferStep({ form, transferOptions }: TransferStepProps) {
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

  const sender = getSenderCountry(senderCode, transferOptions.sources);
  const recipient = getRecipientCountry(
    recipientCode,
    transferOptions.destinations,
  );
  const currency = sender?.currency_code ?? sendCurrency;

  const fee = calculateFee(
    Number(amount ?? 0),
    recipient?.fee_type ?? "fixed",
    Number(recipient?.fee ?? 0),
  );

  const quote = getTransferQuote(
    amount,
    currency,
    recipient?.currency_code ?? "GHS",
    Number(recipient?.default_exchange_rate ?? 1),
    fee,
  );

  const senderSources = transferOptions.sources;
  const recipientDestinations = transferOptions.destinations.filter(
    (country) => country.source_country_id.toString() === senderCode,
  );

  useEffect(() => {
    if (!sender) return;
    if (sendCurrency !== sender.currency_code) {
      form.setValue("sendCurrency", sender.currency_code, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, sendCurrency, sender]);

  function applyCorridor(nextSender: string, nextRecipient: string) {
    const senderCountry = getSenderCountry(nextSender, transferOptions.sources);
    const recipientCountry = getRecipientCountry(
      nextRecipient,
      transferOptions.destinations,
    );

    form.setValue("senderCountryCode", nextSender, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("recipientCountryCode", nextRecipient, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (senderCountry) {
      form.setValue("sendCurrency", senderCountry.currency_code, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (recipientCountry) {
      const method =
        recipientCountry.mobile_networks.length > 0 ? "mobile_money" : "bank";
      form.setValue("receivingMethod", method, { shouldDirty: true });
      form.setValue(
        "network",
        method === "mobile_money"
          ? (recipientCountry.mobile_networks[0]?.name ?? "")
          : "",
        { shouldDirty: true },
      );
      form.setValue(
        "bank",
        method === "bank" ? (recipientCountry.banks[0]?.name ?? "") : "",
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
            const from = getSenderCountry(
              item.senderCountryCode,
              transferOptions.sources,
            );
            const to = getRecipientCountry(
              item.recipientCountryCode,
              transferOptions.destinations,
            );
            if (!from || !to) return null;
            const active =
              senderCode === from.id.toString() &&
              recipientCode === to.id.toString();
            return (
              <button
                key={`${from.id}-${to.id}`}
                type="button"
                onClick={() =>
                  applyCorridor(from.id.toString(), to.id.toString())
                }
                className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-colors duration-150 ${
                  active
                    ? "border-navy bg-navy text-white"
                    : "border-border text-muted hover:border-border-strong hover:text-foreground"
                }`}
              >
                {from.flag} {from.id}
                <span className="opacity-50">→</span>
                {to.flag} {to.id}
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
          options: senderSources.map((country) => ({
            id: country.id,
            name: country.name,
            flag: country.flag,
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
          options: recipientDestinations.map((country) => ({
            id: country.id,
            name: country.name,
            flag: country.flag,
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
              ? `Recipient receives in ${recipient.currency_code}`
              : undefined
        }
      />
    </div>
  );
}
