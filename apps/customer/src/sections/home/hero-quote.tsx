"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import type { TransferOptions } from "@repo/types";
import { AmountInput } from "@repo/ui/amount-input";
import { Button } from "@repo/ui/button";
import { CorridorPicker } from "@repo/ui/corridor-picker";
import { formatMoney } from "@repo/utils/money";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  firstDestinationForSource,
  getRecipientCountry,
  getSenderCountry,
  getTransferQuote,
  resolveTransferFee,
} from "@/sections/new-transfer/constants";

const DEFAULT_AMOUNT = 100;

function startingAmount(min: number, max: number) {
  let amount = DEFAULT_AMOUNT;
  if (Number.isFinite(min) && min > amount) amount = min;
  if (Number.isFinite(max) && max > 0 && max < amount) amount = max;
  return String(amount);
}

/**
 * Live quote in the hero. Uses the same quote maths as the transfer form, so
 * the amount shown here is what the form shows on its first step.
 */
export function HeroQuote({
  transferOptions,
  className,
}: {
  transferOptions: TransferOptions;
  className?: string;
}) {
  const t = useTranslations("Home.Quote");
  const { sources, destinations } = transferOptions;

  const firstSource = sources[0];
  const [senderCode, setSenderCode] = useState(
    firstSource?.id.toString() ?? "",
  );
  const [recipientCode, setRecipientCode] = useState(
    firstSource
      ? (firstDestinationForSource(
          firstSource.id.toString(),
          destinations,
        )?.id.toString() ?? "")
      : "",
  );

  const sender = getSenderCountry(senderCode, sources);
  const recipient = getRecipientCountry(
    recipientCode,
    senderCode,
    destinations,
  );
  const minAmount = Number(recipient?.min_transfer_amount);
  const maxAmount = Number(recipient?.max_transfer_amount);

  const [amount, setAmount] = useState(() =>
    startingAmount(minAmount, maxAmount),
  );

  const sendCurrency = sender?.currency_code ?? "GBP";
  const receiveCurrency = recipient?.currency_code ?? "";
  const rate = Number(recipient?.default_exchange_rate ?? 0);
  const fee = resolveTransferFee({
    amount: Number(amount || 0),
    feeType: recipient?.fee_type ?? "fixed",
    fee: Number(recipient?.fee ?? 0),
  });
  const quote = getTransferQuote(
    amount,
    sendCurrency,
    receiveCurrency,
    rate,
    fee,
    null,
  );

  const numericAmount = Number(amount);
  const hasLimits =
    Number.isFinite(minAmount) && Number.isFinite(maxAmount) && maxAmount > 0;
  const outOfRange =
    quote.hasAmount &&
    hasLimits &&
    (numericAmount < minAmount || numericAmount > maxAmount);

  const senderDestinations = destinations.filter(
    (country) => country.source_country_id.toString() === senderCode,
  );

  function changeSender(code: string) {
    setSenderCode(code);
    const next = destinations.filter(
      (country) => country.source_country_id.toString() === code,
    );
    if (!next.some((country) => country.id.toString() === recipientCode)) {
      setRecipientCode(
        firstDestinationForSource(code, next)?.id.toString() ?? "",
      );
    }
  }

  const canContinue = Boolean(sender && recipient) && !outOfRange;
  const continueHref = {
    pathname: "/transfer",
    query: {
      from: senderCode,
      to: recipientCode,
      ...(quote.hasAmount ? { amount } : {}),
    },
  } as const;

  return (
    <div
      className={cn(
        "w-full border border-border bg-background shadow-lg",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <h2 className="font-display text-lg font-bold tracking-wide text-navy uppercase">
          {t("title")}
        </h2>
        <span className="flex items-center gap-1.5 text-xs font-medium text-success">
          <span className="size-1.5 rounded-full bg-success" aria-hidden />
          {t("liveRates")}
        </span>
      </div>

      <div className="space-y-5 px-5 py-5 sm:px-6">
        <CorridorPicker
          from={{
            id: "hero-sender-country",
            label: t("from"),
            value: senderCode,
            options: sources.map((country) => ({
              id: country.id,
              name: country.name,
              flag: country.flag,
            })),
            onChange: changeSender,
          }}
          to={{
            id: "hero-recipient-country",
            label: t("to"),
            value: recipientCode,
            options: senderDestinations.map((country) => ({
              id: country.id,
              name: country.name,
              flag: country.flag,
            })),
            onChange: setRecipientCode,
          }}
        />

        <AmountInput
          id="hero-send-amount"
          label={t("youSend")}
          value={amount}
          currency={sendCurrency}
          onChange={setAmount}
          error={
            outOfRange
              ? t("range", {
                  min: formatMoney(minAmount, sendCurrency),
                  max: formatMoney(maxAmount, sendCurrency),
                })
              : undefined
          }
        />

        <div className="bg-surface px-4 py-4">
          <p className="text-xs font-medium text-muted">{t("theyGet")}</p>
          <p
            className="mt-1 font-display text-3xl font-bold tracking-tight text-navy"
            aria-live="polite"
          >
            {quote.receiveLabel}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            {recipient && rate > 0 ? (
              <span>
                {t("rate", {
                  send: sendCurrency,
                  receive: formatMoney(rate, receiveCurrency),
                })}
              </span>
            ) : null}
            <span>{t("feesIncluded")}</span>
          </div>
        </div>

        {canContinue ? (
          <Button asChild size="lg" className="w-full gap-2">
            <Link href={continueHref}>
              {t("continue")}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button size="lg" className="w-full gap-2" disabled>
            {t("continue")}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        )}

        <p className="text-center text-xs text-subtle">{t("disclaimer")}</p>
      </div>
    </div>
  );
}
