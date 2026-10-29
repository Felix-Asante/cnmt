"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { AmountInput } from "@repo/ui/amount-input";
import { CorridorPicker } from "@repo/ui/corridor-picker";
import { cn } from "@/lib/utils";
import {
  calculateFee,
  firstDestinationForSource,
  getRecipientCountry,
  getSenderCountry,
  getTransferQuote,
  receiveAmountFromSend,
  bankPayoutKindFor,
  selectableBanks,
  sendAmountFromReceive,
  toAmountInputValue,
} from "../constants";
import { itemId } from "@repo/utils/lookup";
import { formatMoney } from "@repo/utils/money";
import { getRecentCorridors, type RecentCorridor } from "../memory";
import type { TransferFormValues } from "../schema";
import type { TransferOptions } from "@repo/types";

type AmountSide = "send" | "receive";

type TransferStepProps = {
  form: UseFormReturn<TransferFormValues>;
  transferOptions: TransferOptions;
};

export function TransferStep({ form, transferOptions }: TransferStepProps) {
  const t = useTranslations("NewTransfer.Transfer");
  const [recent] = useState<RecentCorridor[]>(getRecentCorridors());
  const [amountSide, setAmountSide] = useState<AmountSide>("send");
  const [receiveDraft, setReceiveDraft] = useState("");

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
    senderCode,
    transferOptions.destinations,
  );
  const sendCode = sender?.currency_code ?? sendCurrency;
  const receiveCode = recipient?.currency_code ?? "GHS";
  const rate = Number(recipient?.default_exchange_rate ?? 1);
  const feeType = recipient?.fee_type ?? "fixed";
  const feeValue = Number(recipient?.fee ?? 0);

  const fee = calculateFee(Number(amount ?? 0), feeType, feeValue);
  const quote = getTransferQuote(
    amount,
    sendCode,
    receiveCode,
    rate,
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

  useEffect(() => {
    if (amountSide !== "receive" || !receiveDraft) return;
    const receiveAmount = Number(receiveDraft);
    if (!Number.isFinite(receiveAmount) || receiveAmount <= 0) return;
    const nextSend = toAmountInputValue(
      sendAmountFromReceive(receiveAmount, rate, feeType, feeValue),
    );
    if (nextSend !== form.getValues("sendAmount")) {
      form.setValue("sendAmount", nextSend, {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [amountSide, feeType, feeValue, form, rate, receiveDraft, recipientCode]);

  function applyCorridor(nextSender: string, nextRecipient: string) {
    const senderCountry = getSenderCountry(nextSender, transferOptions.sources);
    const recipientCountry = getRecipientCountry(
      nextRecipient,
      nextSender,
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
      const bankKind = bankPayoutKindFor(recipientCountry);
      form.setValue("receivingMethod", method, { shouldDirty: true });
      form.setValue("bankPayoutKind", bankKind, { shouldDirty: true });
      form.setValue(
        "network",
        method === "mobile_money"
          ? itemId(recipientCountry.mobile_networks[0])
          : "",
        { shouldDirty: true },
      );
      form.setValue(
        "bank",
        method === "bank" && bankKind === "local"
          ? itemId(selectableBanks(recipientCountry)[0])
          : "",
        { shouldDirty: true },
      );
      form.setValue("iban", "", { shouldDirty: true });
      if (bankKind !== "local") {
        form.setValue("bankAccountNumber", "", { shouldDirty: true });
      }
    }
  }

  function setSendAmount(value: string) {
    form.setValue("sendAmount", value, {
      shouldDirty: true,
      shouldTouch: true,
    });
  }

  function switchAmountSide(next: AmountSide) {
    if (next === amountSide) return;

    if (next === "receive") {
      const sendValue = Number(form.getValues("sendAmount"));
      setReceiveDraft(
        Number.isFinite(sendValue) && sendValue > 0
          ? toAmountInputValue(
              receiveAmountFromSend(sendValue, rate, feeType, feeValue),
            )
          : "",
      );
    }

    setAmountSide(next);
  }

  function handleAmountChange(value: string) {
    if (amountSide === "send") {
      setSendAmount(value);
      return;
    }

    setReceiveDraft(value);
    const receiveAmount = Number(value);
    if (!value || !Number.isFinite(receiveAmount) || receiveAmount <= 0) {
      setSendAmount("");
      return;
    }
    setSendAmount(
      toAmountInputValue(
        sendAmountFromReceive(receiveAmount, rate, feeType, feeValue),
      ),
    );
  }

  const minAmount = Number(recipient?.min_transfer_amount);
  const maxAmount = Number(recipient?.max_transfer_amount);
  const hasLimits =
    Number.isFinite(minAmount) && Number.isFinite(maxAmount) && maxAmount > 0;

  const receiveMin = hasLimits
    ? receiveAmountFromSend(minAmount, rate, feeType, feeValue)
    : 0;
  const receiveMax = hasLimits
    ? receiveAmountFromSend(maxAmount, rate, feeType, feeValue)
    : 0;

  const helperText = quote.hasAmount
    ? amountSide === "send"
      ? t("receivesAmount", { amount: quote.receiveLabel })
      : t("youPay", { amount: quote.sendLabel })
    : hasLimits
      ? amountSide === "send"
        ? t("sendRange", {
            min: formatMoney(minAmount, sendCode),
            max: formatMoney(maxAmount, sendCode),
          })
        : t("receiveRange", {
            min: formatMoney(receiveMin, receiveCode),
            max: formatMoney(receiveMax, receiveCode),
          })
      : recipient
        ? t("receivesIn", { currency: receiveCode })
        : undefined;

  return (
    <div className="space-y-10">
      <header className="max-w-lg space-y-2">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
          {t("title")}
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          {t("description")}
        </p>
      </header>

      {recent.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-subtle">{t("recent")}</span>
          {recent.map((item) => {
            const from = getSenderCountry(
              item.senderCountryCode,
              transferOptions.sources,
            );
            const to = getRecipientCountry(
              item.recipientCountryCode,
              item.senderCountryCode,
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
                {from.flag} {from.iso_code}
                <span className="opacity-50">→</span>
                {to.flag} {to.iso_code}
              </button>
            );
          })}
        </div>
      ) : null}

      <CorridorPicker
        from={{
          id: "sender-country",
          label: t("from"),
          value: senderCode,
          recentCodes: recent.map((item) => item.senderCountryCode),
          options: senderSources.map((country) => ({
            id: country.id,
            name: country.name,
            flag: country.flag,
          })),
          onChange: (code) => {
            const currentRecipient = form.getValues("recipientCountryCode");
            const destinations = transferOptions.destinations.filter(
              (country) => country.source_country_id.toString() === code,
            );
            const nextRecipient = destinations.some(
              (country) => country.id.toString() === currentRecipient,
            )
              ? currentRecipient
              : (firstDestinationForSource(code, destinations)?.id.toString() ??
                "");
            applyCorridor(code, nextRecipient);
          },
          error: errors.senderCountryCode?.message,
        }}
        to={{
          id: "recipient-country",
          label: t("to"),
          value: recipientCode,
          recentCodes: recent.map((item) => item.recipientCountryCode),
          options: recipientDestinations.map((country) => ({
            id: country.id,
            name: country.name,
            flag: country.flag,
          })),
          onChange: (code) => {
            const currentSender = form.getValues("senderCountryCode");
            applyCorridor(currentSender, code);
          },
          error: errors.recipientCountryCode?.message,
        }}
      />

      <div className="space-y-4">
        <div
          role="group"
          aria-label={t("amountSide")}
          className="grid max-w-sm grid-cols-2 border border-border p-1"
        >
          {(["send", "receive"] as const).map((side) => {
            const selected = amountSide === side;
            return (
              <button
                key={side}
                type="button"
                aria-pressed={selected}
                onClick={() => switchAmountSide(side)}
                className={cn(
                  "px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15",
                  selected
                    ? "bg-navy text-white"
                    : "bg-transparent text-muted hover:text-foreground",
                )}
              >
                {side === "send" ? t("youSend") : t("theyGet")}
              </button>
            );
          })}
        </div>

        <AmountInput
          id={amountSide === "send" ? "send-amount" : "receive-amount"}
          aria-label={amountSide === "send" ? t("youSend") : t("theyGet")}
          value={amountSide === "send" ? (amount ?? "") : receiveDraft}
          currency={amountSide === "send" ? sendCode : receiveCode}
          onChange={handleAmountChange}
          error={errors?.sendAmount?.message}
          helperText={helperText}
        />
      </div>
    </div>
  );
}
