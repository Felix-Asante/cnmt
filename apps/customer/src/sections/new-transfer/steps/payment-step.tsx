"use client";

import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import type { PaymentAccount, ReceivingMethod } from "@repo/types";
import type { UseFormReturn } from "react-hook-form";
import { Building2, Smartphone } from "lucide-react";
import { InformationBanner } from "@repo/ui/information-banner";
import { PaymentCard } from "@repo/ui/payment-card";
import { formatMoney } from "@repo/utils/money";
import { cn } from "@/lib/utils";
import { SUPPORT } from "@/constants/support";
import { getPaymentAccounts } from "../api/server";
import {
  accountSummary,
  groupPaymentAccounts,
  paymentAccountDetails,
  type PaymentMethodGroup,
} from "../payment-details";
import type { TransferFormValues } from "../schema";

type PaymentStepProps = {
  form: UseFormReturn<TransferFormValues>;
  reference: string;
  selectedAccountId: string;
  onSelectAccount: (accountId: string) => void;
};

export function PaymentStep({
  form,
  reference,
  selectedAccountId,
  onSelectAccount,
}: PaymentStepProps) {
  const t = useTranslations("NewTransfer.Payment");
  const amount = form.watch("sendAmount");
  const currency = form.watch("sendCurrency");
  const countryId = form.watch("senderCountryCode");

  const [groups, setGroups] = useState<PaymentMethodGroup[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<ReceivingMethod | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!countryId) {
      setGroups([]);
      setSelectedMethod(null);
      onSelectAccount("");
      setError(t("selectSourceCountry"));
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await getPaymentAccounts(countryId);
      const nextGroups = groupPaymentAccounts(result, currency);

      setGroups(nextGroups);

      const preferred =
        nextGroups
          .flatMap((group) => group.accounts)
          .find((account) => account.id === selectedAccountId) ??
        nextGroups[0]?.accounts[0];

      const preferredGroup =
        nextGroups.find((group) =>
          group.accounts.some((account) => account.id === preferred?.id),
        ) ?? nextGroups[0];

      setSelectedMethod(preferredGroup?.method ?? null);
      onSelectAccount(preferred?.id ?? "");

      if (nextGroups.length === 0) {
        setError(t("noAccounts"));
      }
    });
    // Only reload when corridor/currency changes; selection sync is handled above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId, currency]);

  const activeGroup =
    groups.find((group) => group.method === selectedMethod) ?? groups[0];
  const selected =
    activeGroup?.accounts.find((account) => account.id === selectedAccountId) ??
    activeGroup?.accounts[0];

  const parsedAmount = Number(amount);
  const displayAmount =
    amount && Number.isFinite(parsedAmount) && parsedAmount > 0
      ? formatMoney(parsedAmount, currency)
      : `— ${currency.trim() || "—"}`;

  function methodLabel(method: ReceivingMethod) {
    return method === "BANK" ? t("bankLabel") : t("mobileLabel");
  }

  function methodDescription(method: ReceivingMethod) {
    return method === "BANK" ? t("bankDescription") : t("mobileDescription");
  }

  function selectMethod(method: ReceivingMethod) {
    const group = groups.find((item) => item.method === method);
    if (!group) return;
    setSelectedMethod(method);
    onSelectAccount(group.accounts[0]?.id ?? "");
  }

  const detailLabels = {
    channel: t("detailChannel"),
    accountName: t("detailAccountName"),
    accountNumber: t("detailAccountNumber"),
    sortCode: t("detailSortCode"),
    iban: t("detailIban"),
    phone: t("detailPhone"),
    currency: t("detailCurrency"),
    reference: t("detailReference"),
  };

  return (
    <div className="space-y-8">
      <header className="max-w-lg space-y-2">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
          {t("title")}
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          {t("description")}
        </p>
      </header>

      <div className="border border-border bg-navy px-5 py-5 text-white sm:px-6">
        <p className="text-[11px] font-medium tracking-[0.16em] text-white/55 uppercase">
          {t("amountToPay")}
        </p>
        <p className="mt-2 font-sans text-3xl font-semibold tracking-tight">
          {displayAmount}
        </p>
        <p className="mt-2 text-sm text-white/70">
          {t("referenceLabel")}{" "}
          <span className="font-mono font-medium tracking-wide text-white">
            {reference}
          </span>
        </p>
      </div>

      <InformationBanner title={t("verifiedTitle")}>
        {t("verifiedBody")}
      </InformationBanner>

      {isPending ? (
        <PaymentStepSkeleton />
      ) : error || groups.length === 0 ? (
        <InformationBanner title={t("unavailableTitle")} tone="warning">
          {t.rich("unavailableContact", {
            error: error ?? t("unavailableFallback"),
            email: SUPPORT.email,
            wa: (chunks) => (
              <a href={SUPPORT.whatsappHref} className="font-medium text-navy">
                {chunks}
              </a>
            ),
            mail: (chunks) => (
              <a href={SUPPORT.emailHref} className="font-medium text-navy">
                {chunks}
              </a>
            ),
          })}
        </InformationBanner>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-medium text-navy">
                {t("chooseMethodTitle")}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {t("chooseMethodDescription")}
              </p>
            </div>

            <div
              className={cn(
                "grid gap-3",
                groups.length > 1 ? "sm:grid-cols-2" : "grid-cols-1",
              )}
            >
              {groups.map((group) => {
                const active = group.method === activeGroup?.method;
                const Icon =
                  group.method === "BANK" ? Building2 : Smartphone;

                return (
                  <button
                    key={group.method}
                    type="button"
                    onClick={() => selectMethod(group.method)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-start gap-3 border px-4 py-4 text-left transition-colors duration-150",
                      active
                        ? "border-navy bg-navy-soft"
                        : "border-border bg-background hover:border-navy/40 hover:bg-surface",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center border",
                        active
                          ? "border-navy bg-navy text-white"
                          : "border-border bg-surface text-navy",
                      )}
                    >
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-navy">
                        {methodLabel(group.method)}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted">
                        {t("accountsAvailable", {
                          count: group.accounts.length,
                        })}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {activeGroup ? (
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-medium text-navy">
                  {t("selectAccountTitle", {
                    method: methodLabel(activeGroup.method).toLowerCase(),
                  })}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {methodDescription(activeGroup.method)}
                </p>
              </div>

              <ul className="border border-border bg-background">
                {activeGroup.accounts.map((account) => (
                  <AccountOption
                    key={account.id}
                    account={account}
                    selected={account.id === selected?.id}
                    onSelect={() => onSelectAccount(account.id)}
                  />
                ))}
              </ul>
            </section>
          ) : null}

          {selected ? (
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-medium text-navy">
                  {t("payDetailsTitle")}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {t("payDetailsDescription", { amount: displayAmount })}
                </p>
              </div>

              <PaymentCard
                title={selected.name}
                amountLabel={t("amountToPay")}
                amountValue={displayAmount}
                details={paymentAccountDetails(
                  selected,
                  reference,
                  detailLabels,
                )}
              />
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function AccountOption({
  account,
  selected,
  onSelect,
}: {
  account: PaymentAccount;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <li className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-150",
          selected ? "bg-navy-soft" : "bg-background hover:bg-surface",
        )}
      >
        <span
          className={cn(
            "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border",
            selected ? "border-navy" : "border-border-strong",
          )}
          aria-hidden
        >
          <span
            className={cn(
              "size-2 rounded-full",
              selected ? "bg-navy" : "bg-transparent",
            )}
          />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-navy">
            {account.name}
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-muted">
            {accountSummary(account)}
          </span>
        </span>
      </button>
    </li>
  );
}

function PaymentStepSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-20 border border-border bg-surface" />
        <div className="h-20 border border-border bg-surface" />
      </div>
      <div className="border border-border bg-background">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="border-b border-border px-4 py-4 last:border-b-0"
          >
            <div className="h-4 w-40 bg-surface" />
            <div className="mt-2 h-3 w-56 bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
