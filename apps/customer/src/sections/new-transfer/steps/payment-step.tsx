"use client";

import { useEffect, useState, useTransition } from "react";
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
};

export function PaymentStep({ form, reference }: PaymentStepProps) {
  const amount = form.watch("sendAmount");
  const currency = form.watch("sendCurrency");
  const countryId = form.watch("senderCountryCode");

  const [groups, setGroups] = useState<PaymentMethodGroup[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<ReceivingMethod | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!countryId) {
      setGroups([]);
      setSelectedMethod(null);
      setSelectedId("");
      setError("Select a source country before making payment.");
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await getPaymentAccounts(countryId);
      const nextGroups = groupPaymentAccounts(result, currency);

      setGroups(nextGroups);

      const firstGroup = nextGroups[0];
      const firstAccount = firstGroup?.accounts[0];
      setSelectedMethod(firstGroup?.method ?? null);
      setSelectedId(firstAccount?.id ?? "");

      if (nextGroups.length === 0) {
        setError(
          "No payment accounts are available for this corridor right now. Contact support with your reference.",
        );
      }
    });
  }, [countryId, currency]);

  const activeGroup =
    groups.find((group) => group.method === selectedMethod) ?? groups[0];
  const selected =
    activeGroup?.accounts.find((account) => account.id === selectedId) ??
    activeGroup?.accounts[0];

  const parsedAmount = Number(amount);
  const displayAmount =
    amount && Number.isFinite(parsedAmount) && parsedAmount > 0
      ? formatMoney(parsedAmount, currency)
      : `— ${currency.trim() || "—"}`;

  function selectMethod(method: ReceivingMethod) {
    const group = groups.find((item) => item.method === method);
    if (!group) return;
    setSelectedMethod(method);
    setSelectedId(group.accounts[0]?.id ?? "");
  }

  return (
    <div className="space-y-8">
      <header className="max-w-lg space-y-2">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
          Make your payment
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Choose a payment method, pick an account, then send the exact amount
          with your reference.
        </p>
      </header>

      <div className="border border-border bg-navy px-5 py-5 text-white sm:px-6">
        <p className="text-[11px] font-medium tracking-[0.16em] text-white/55 uppercase">
          Amount to pay
        </p>
        <p className="mt-2 font-sans text-3xl font-semibold tracking-tight">
          {displayAmount}
        </p>
        <p className="mt-2 text-sm text-white/70">
          Reference{" "}
          <span className="font-mono font-medium tracking-wide text-white">
            {reference}
          </span>
        </p>
      </div>

      <InformationBanner title="Verified before processing">
        We’ll confirm your payment before sending money to the recipient. Most
        transfers complete within 30 minutes after verification.
      </InformationBanner>

      {isPending ? (
        <PaymentStepSkeleton />
      ) : error || groups.length === 0 ? (
        <InformationBanner title="Payment details unavailable" tone="warning">
          {error ?? "Unable to load payment details."} You can reach us on{" "}
          <a href={SUPPORT.whatsappHref} className="font-medium text-navy">
            WhatsApp
          </a>{" "}
          or{" "}
          <a href={SUPPORT.emailHref} className="font-medium text-navy">
            {SUPPORT.email}
          </a>
          .
        </InformationBanner>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <div>
              <h2 className="text-sm font-medium text-navy">
                1. Choose payment method
              </h2>
              <p className="mt-1 text-sm text-muted">
                Bank and mobile money are listed separately when available.
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
                        {group.label}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted">
                        {group.accounts.length}{" "}
                        {group.accounts.length === 1 ? "account" : "accounts"}{" "}
                        available
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
                  2. Select a {activeGroup.label.toLowerCase()} account
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {activeGroup.description}
                </p>
              </div>

              <ul className="border border-border bg-background">
                {activeGroup.accounts.map((account) => (
                  <AccountOption
                    key={account.id}
                    account={account}
                    selected={account.id === selected?.id}
                    onSelect={() => setSelectedId(account.id)}
                  />
                ))}
              </ul>
            </section>
          ) : null}

          {selected ? (
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-medium text-navy">
                  3. Pay using these details
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Send exactly {displayAmount} and include your reference.
                </p>
              </div>

              <PaymentCard
                title={selected.name}
                amountLabel="Amount to pay"
                amountValue={displayAmount}
                details={paymentAccountDetails(selected, reference)}
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
