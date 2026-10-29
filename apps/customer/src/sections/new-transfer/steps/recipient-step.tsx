"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Controller, useWatch, type UseFormReturn } from "react-hook-form";
import { Label } from "@repo/ui/label";
import { Input } from "@repo/ui/input";
import { PhoneInput } from "@repo/ui/phone-input";
import { Field } from "@repo/ui/field";
import { Textarea } from "@repo/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { cn } from "@/lib/utils";
import {
  bankPayoutKindFor,
  channelOptionLabel,
  getRecipientCountry,
  getSenderCountry,
  selectableBanks,
} from "../constants";
import { formatIbanDisplay, maskIban } from "@repo/utils/iban";
import { itemId, itemName } from "@repo/utils/lookup";
import { getSavedRecipients, type SavedRecipient } from "../memory";
import type { TransferFormValues } from "../schema";
import type { PreviewPromoCode, TransferOptions } from "@repo/types";
import { PromoCodeField } from "../promo-code-field";

type RecipientStepProps = {
  form: UseFormReturn<TransferFormValues>;
  transferOptions: TransferOptions;
  appliedPromo: PreviewPromoCode | null;
  promoError?: string;
  onApplyPromo: (code: string) => Promise<string | null>;
  onClearPromo: () => void;
};

function SelectField({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={htmlFor}
        className="text-xs font-medium tracking-wide text-muted"
      >
        {label}
        {required ? <span className="text-brand"> *</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-sm font-medium text-brand">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function RecipientStep({
  form,
  transferOptions,
  appliedPromo,
  promoError,
  onApplyPromo,
  onClearPromo,
}: RecipientStepProps) {
  const t = useTranslations("NewTransfer.Recipient");
  const [saved, setSaved] = useState<SavedRecipient[]>([]);
  const [paymentChannels, setPaymentChannels] = useState<string[]>([]);
  const recipientCode = useWatch({
    control: form.control,
    name: "recipientCountryCode",
  });
  const senderCode = useWatch({
    control: form.control,
    name: "senderCountryCode",
  });
  const promoCode = useWatch({
    control: form.control,
    name: "promoCode",
  });
  const country = getRecipientCountry(
    recipientCode,
    senderCode,
    transferOptions.destinations,
  );
  const senderCountry = getSenderCountry(senderCode, transferOptions.sources);
  const method = useWatch({ control: form.control, name: "receivingMethod" });
  const bankPayoutKind = useWatch({
    control: form.control,
    name: "bankPayoutKind",
  });
  const network = useWatch({ control: form.control, name: "network" });
  const bank = useWatch({ control: form.control, name: "bank" });
  const recipientName = useWatch({
    control: form.control,
    name: "recipientName",
  });
  const errors = form.formState.errors;
  const isMobileMoney = method === "mobile_money";
  const isIbanPayout = method === "bank" && bankPayoutKind === "iban";
  const localBanks = selectableBanks(country);

  useEffect(() => {
    setSaved(getSavedRecipients());
  }, []);

  useEffect(() => {
    if (!country) return;

    const methods: Array<"mobile_money" | "bank"> = [];
    if (country.mobile_networks.length > 0) methods.push("mobile_money");
    if (country.banks.length > 0) methods.push("bank");
    setPaymentChannels(methods);

    const nextKind = bankPayoutKindFor(country);
    if (nextKind !== bankPayoutKind) {
      form.setValue("bankPayoutKind", nextKind, { shouldDirty: true });
    }

    const nextMethod =
      method === "mobile_money" && !methods.includes("mobile_money")
        ? methods[0]
        : method === "bank" && !methods.includes("bank")
          ? methods[0]
          : method;

    if (nextMethod && nextMethod !== method) {
      form.setValue("receivingMethod", nextMethod, { shouldDirty: true });
      return;
    }

    if (nextMethod === "mobile_money") {
      const ids = country.mobile_networks.map((item) => item.id);
      if (ids[0] && !ids.includes(network ?? "")) {
        form.setValue("network", ids[0]);
      }
      return;
    }

    if (nextKind === "iban") {
      if (bank) form.setValue("bank", "", { shouldDirty: true });
      if (form.getValues("bankAccountNumber")) {
        form.setValue("bankAccountNumber", "", { shouldDirty: true });
      }
      return;
    }

    const bankIds = selectableBanks(country).map((item) => item.id);
    if (bankIds[0] && !bankIds.includes(bank ?? "")) {
      form.setValue("bank", bankIds[0]);
    }
    if (form.getValues("iban")) {
      form.setValue("iban", "", { shouldDirty: true });
    }
  }, [bank, bankPayoutKind, country, form, method, network]);

  function applySaved(recipient: SavedRecipient) {
    form.setValue("senderCountryCode", recipient.senderCountryCode, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("recipientCountryCode", recipient.recipientCountryCode, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("sendCurrency", recipient.sendCurrency, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("recipientName", recipient.name, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("recipientPhone", recipient.phone, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("receivingMethod", recipient.receivingMethod, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("network", recipient.network ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("bank", recipient.bank ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(
      "bankPayoutKind",
      recipient.bankPayoutKind ??
        bankPayoutKindFor(
          getRecipientCountry(
            recipient.recipientCountryCode,
            recipient.senderCountryCode,
            transferOptions.destinations,
          ),
        ),
      { shouldDirty: true, shouldValidate: true },
    );
    form.setValue("bankAccountName", recipient.bankAccountName ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("bankAccountNumber", recipient.bankAccountNumber ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("iban", recipient.iban ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function setMethod(next: "mobile_money" | "bank") {
    const nextKind = bankPayoutKindFor(country);
    form.setValue("receivingMethod", next, {
      shouldValidate: true,
      shouldDirty: true,
    });
    form.setValue("bankPayoutKind", nextKind, { shouldDirty: true });

    if (next === "mobile_money") {
      form.setValue("network", itemId(country?.mobile_networks[0]), {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("bank", "", { shouldDirty: true });
      form.setValue("bankAccountName", "", { shouldDirty: true });
      form.setValue("bankAccountNumber", "", { shouldDirty: true });
      form.setValue("iban", "", { shouldDirty: true });
      return;
    }

    form.setValue("network", "", { shouldDirty: true });
    form.setValue("recipientPhone", "", { shouldDirty: true });
    form.clearErrors("recipientPhone");
    if (nextKind === "iban") {
      form.setValue("bank", "", { shouldDirty: true });
      form.setValue("bankAccountNumber", "", { shouldDirty: true });
    } else {
      form.setValue("bank", itemId(selectableBanks(country)[0]), {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("iban", "", { shouldDirty: true });
    }
    if (!form.getValues("bankAccountName") && recipientName) {
      form.setValue("bankAccountName", recipientName, { shouldDirty: true });
    }
  }

  if (!country) return null;

  const matchingSaved = saved.filter(
    (item) => item.recipientCountryCode === country.id.toString(),
  );
  const recipientNameField = form.register("recipientName");

  return (
    <div className="space-y-10">
      <header className="max-w-lg space-y-2">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
          {t("title")}
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          {isMobileMoney
            ? t("descriptionMobile")
            : isIbanPayout
              ? t("descriptionIban")
              : t("descriptionBank")}
        </p>
      </header>

      {matchingSaved.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-wide text-muted">
            {t("sendAgain")}
          </p>
          <div className="divide-y divide-border border border-border">
            {matchingSaved.map((recipient) => (
              <button
                key={recipient.id}
                type="button"
                onClick={() => applySaved(recipient)}
                className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-surface"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {recipient.name}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {recipient.receivingMethod === "bank"
                      ? recipient.iban
                        ? [t("ibanTransfer"), maskIban(recipient.iban)]
                            .filter(Boolean)
                            .join(" · ")
                        : [
                            itemName(country.banks, recipient.bank),
                            recipient.bankAccountNumber
                              ? `••••${recipient.bankAccountNumber.slice(-4)}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")
                      : [
                          recipient.phone,
                          itemName(
                            country.mobile_networks,
                            recipient.network,
                          ) || null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-medium text-navy">
                  {t("select")}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        <Field
          label={t("whatsappLabel")}
          htmlFor="senderWhatsApp"
          required
          description={t("whatsappDescription")}
          error={errors.senderWhatsApp?.message}
        >
          <Controller
            control={form.control}
            name="senderWhatsApp"
            render={({ field }) => (
              <PhoneInput
                id="senderWhatsApp"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                defaultCountry={senderCountry?.iso_code ?? "MA"}
                placeholder={t("whatsappPlaceholder")}
                error={errors.senderWhatsApp?.message}
                autoComplete="tel"
              />
            )}
          />
        </Field>

        <div className="border-t border-border pt-5">
          <p className="text-xs font-medium tracking-wide text-muted">
            {t("recipientSection")}
          </p>
        </div>

        <Field
          label={t("fullName")}
          htmlFor="recipientName"
          required
          error={errors.recipientName?.message}
        >
          <Input
            {...recipientNameField}
            placeholder={t("fullNamePlaceholder")}
            autoComplete="name"
            onBlur={(event) => {
              void recipientNameField.onBlur(event);
              if (
                method === "bank" &&
                !form.getValues("bankAccountName") &&
                event.target.value.trim()
              ) {
                form.setValue("bankAccountName", event.target.value.trim(), {
                  shouldDirty: true,
                });
              }
            }}
          />
        </Field>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium tracking-wide text-muted">
            {t("payoutMethod")}
          </legend>
          <div className="grid grid-cols-2 border border-border p-1">
            {paymentChannels.map((item) => {
              const label =
                item === "mobile_money"
                  ? t("mobileMoney")
                  : bankPayoutKindFor(country) === "iban"
                    ? t("ibanTransfer")
                    : t("bankTransfer");
              const selected = method === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setMethod(item as "mobile_money" | "bank")}
                  className={cn(
                    "px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/15",
                    selected
                      ? "bg-navy text-white"
                      : "bg-transparent text-muted hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {isMobileMoney ? (
          <>
            <SelectField
              label={t("network")}
              htmlFor="network"
              required
              error={errors.network?.message}
            >
              <Select
                value={network || undefined}
                onValueChange={(value) =>
                  form.setValue("network", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger
                  id="network"
                  aria-invalid={Boolean(errors.network) || undefined}
                >
                  <SelectValue placeholder={t("chooseNetwork")} />
                </SelectTrigger>
                <SelectContent>
                  {country.mobile_networks.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {channelOptionLabel(item, country.currency_code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SelectField>

            <Field
              label={t("mobileNumber")}
              htmlFor="recipientPhone"
              required
              description={t("mobileNumberDescription")}
              error={errors.recipientPhone?.message}
            >
              <Controller
                control={form.control}
                name="recipientPhone"
                render={({ field }) => (
                  <PhoneInput
                    id="recipientPhone"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    defaultCountry={country?.iso_code ?? "GH"}
                    placeholder={t("mobileNumberPlaceholder")}
                    error={errors.recipientPhone?.message}
                    autoComplete="tel"
                  />
                )}
              />
            </Field>
          </>
        ) : isIbanPayout ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label={t("accountHolderName")}
              htmlFor="bankAccountName"
              required
              error={errors.bankAccountName?.message}
            >
              <Input
                {...form.register("bankAccountName")}
                placeholder={t("fullNamePlaceholder")}
                autoComplete="name"
              />
            </Field>

            <Field
              label={t("iban")}
              htmlFor="iban"
              required
              description={t("ibanDescription")}
              error={errors.iban?.message}
            >
              <Input
                {...form.register("iban", {
                  onChange: (event) => {
                    const formatted = formatIbanDisplay(event.target.value);
                    if (formatted !== event.target.value) {
                      form.setValue("iban", formatted, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  },
                })}
                placeholder={t("ibanPlaceholder")}
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="characters"
                className="font-mono tracking-wide uppercase"
              />
            </Field>
          </div>
        ) : (
          <>
            <SelectField
              label={t("bank")}
              htmlFor="bank"
              required
              error={errors.bank?.message}
            >
              <Select
                value={bank || undefined}
                onValueChange={(value) =>
                  form.setValue("bank", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger
                  id="bank"
                  aria-invalid={Boolean(errors.bank) || undefined}
                >
                  <SelectValue placeholder={t("chooseBank")} />
                </SelectTrigger>
                <SelectContent>
                  {localBanks.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {channelOptionLabel(item, country.currency_code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SelectField>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={t("accountHolderName")}
                htmlFor="bankAccountName"
                required
                error={errors.bankAccountName?.message}
              >
                <Input
                  {...form.register("bankAccountName")}
                  placeholder={t("fullNamePlaceholder")}
                  autoComplete="name"
                />
              </Field>

              <Field
                label={t("accountNumber")}
                htmlFor="bankAccountNumber"
                required
                error={errors.bankAccountNumber?.message}
              >
                <Input
                  {...form.register("bankAccountNumber")}
                  placeholder={t("accountNumberPlaceholder")}
                  inputMode="numeric"
                  autoComplete="off"
                />
              </Field>
            </div>
          </>
        )}

        <Field
          label={t("noteLabel")}
          htmlFor="note"
          description={t("noteDescription")}
          error={errors.note?.message}
        >
          <Textarea
            id="note"
            {...form.register("note")}
            placeholder={t("notePlaceholder")}
            maxLength={160}
            rows={3}
            className="min-h-20 resize-none"
          />
        </Field>

        <PromoCodeField
          value={promoCode ?? ""}
          applied={appliedPromo}
          error={promoError}
          onChange={(value) => {
            form.setValue("promoCode", value, {
              shouldDirty: true,
              shouldValidate: true,
            });
            if (appliedPromo) onClearPromo();
          }}
          onApply={onApplyPromo}
          onClear={onClearPromo}
        />
      </div>
    </div>
  );
}
