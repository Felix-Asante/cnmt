"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useWatch, type UseFormReturn } from "react-hook-form";
import { Label } from "@repo/ui/label";
import { Input } from "@repo/ui/input";
import { Field } from "@repo/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { cn } from "@/lib/utils";
import {
  getRecipientCountry,
} from "../constants";
import { itemId, itemName } from "@repo/utils/lookup";
import { getSavedRecipients, type SavedRecipient } from "../memory";
import type { TransferFormValues } from "../schema";
import type { TransferOptions } from "@repo/types";

type RecipientStepProps = {
  form: UseFormReturn<TransferFormValues>;
  transferOptions: TransferOptions;
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

export function RecipientStep({ form, transferOptions }: RecipientStepProps) {
  const [saved, setSaved] = useState<SavedRecipient[]>([]);
  const [paymentChannels, setPaymentChannels] = useState<string[]>([]);
  const recipientCode = useWatch({
    control: form.control,
    name: "recipientCountryCode",
  });
  const country = getRecipientCountry(recipientCode, transferOptions.destinations);
  const method = useWatch({ control: form.control, name: "receivingMethod" });
  const network = useWatch({ control: form.control, name: "network" });
  const bank = useWatch({ control: form.control, name: "bank" });
  const recipientName = useWatch({
    control: form.control,
    name: "recipientName",
  });
  const errors = form.formState.errors;
  const isMobileMoney = method === "mobile_money";

  useEffect(() => {
    setSaved(getSavedRecipients());
  }, []);

  useEffect(() => {
    if (!country) return;

    const methods: Array<"mobile_money" | "bank"> = [];
    if (country.mobile_networks.length > 0) methods.push("mobile_money");
    if (country.banks.length > 0) methods.push("bank");
    setPaymentChannels(methods);

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

    const ids = country.banks.map((item) => item.id);
    if (ids[0] && !ids.includes(bank ?? "")) {
      form.setValue("bank", ids[0]);
    }
  }, [bank, country, form, method, network]);

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
    form.setValue("bankAccountName", recipient.bankAccountName ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("bankAccountNumber", recipient.bankAccountNumber ?? "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function setMethod(next: "mobile_money" | "bank") {
    form.setValue("receivingMethod", next, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (next === "mobile_money") {
      form.setValue("network", itemId(country?.mobile_networks[0]), {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue("bank", "", { shouldDirty: true });
      form.setValue("bankAccountName", "", { shouldDirty: true });
      form.setValue("bankAccountNumber", "", { shouldDirty: true });
      return;
    }

    form.setValue("network", "", { shouldDirty: true });
    form.setValue("recipientPhone", "", { shouldDirty: true });
    form.clearErrors("recipientPhone");
    form.setValue("bank", itemId(country?.banks[0]), {
      shouldDirty: true,
      shouldValidate: true,
    });
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
          Recipient details
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Add your WhatsApp for updates, then the details for their{" "}
          {isMobileMoney ? "mobile money" : "bank"} payout.
        </p>
      </header>

      {matchingSaved.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-medium tracking-wide text-muted">
            Send again
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
                      ? [
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
                  Select
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        <Field
          label="Your WhatsApp number"
          htmlFor="senderWhatsApp"
          required
          description="We’ll use this to update you on the transfer."
          error={errors.senderWhatsApp?.message}
        >
          <Input
            {...form.register("senderWhatsApp")}
            placeholder="+44 7700 900123"
            inputMode="tel"
            autoComplete="tel"
          />
        </Field>

        <div className="border-t border-border pt-5">
          <p className="text-xs font-medium tracking-wide text-muted">
            Recipient
          </p>
        </div>

        <Field
          label="Full name"
          htmlFor="recipientName"
          required
          error={errors.recipientName?.message}
        >
          <Input
            {...recipientNameField}
            placeholder="Ama Mensah"
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
            Payout method
          </legend>
          <div className="grid grid-cols-2 border border-border p-1">
            {paymentChannels.map((item) => {
              const label =
                item === "mobile_money" ? "Mobile money" : "Bank transfer";
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
              label="Network"
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
                  <SelectValue placeholder="Choose network" />
                </SelectTrigger>
                <SelectContent>
                  {country.mobile_networks.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SelectField>

            <Field
              label="Mobile money number"
              htmlFor="recipientPhone"
              required
              description="Must match the number registered on their wallet."
              error={errors.recipientPhone?.message}
            >
              <Input
                {...form.register("recipientPhone")}
                placeholder="+233 24 000 0000"
                inputMode="tel"
                autoComplete="tel"
              />
            </Field>
          </>
        ) : (
          <>
            <SelectField
              label="Bank"
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
                  <SelectValue placeholder="Choose bank" />
                </SelectTrigger>
                <SelectContent>
                  {country.banks.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SelectField>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Account holder name"
                htmlFor="bankAccountName"
                required
                error={errors.bankAccountName?.message}
              >
                <Input
                  {...form.register("bankAccountName")}
                  placeholder="Ama Mensah"
                  autoComplete="name"
                />
              </Field>

              <Field
                label="Account number"
                htmlFor="bankAccountNumber"
                required
                error={errors.bankAccountNumber?.message}
              >
                <Input
                  {...form.register("bankAccountNumber")}
                  placeholder="0123456789"
                  inputMode="numeric"
                  autoComplete="off"
                />
              </Field>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
