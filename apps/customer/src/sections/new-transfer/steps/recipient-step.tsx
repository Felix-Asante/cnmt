"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
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
import { getCountry } from "../constants";
import { getSavedRecipients, type SavedRecipient } from "../memory";
import type { TransferFormValues } from "../schema";

type RecipientStepProps = {
  form: UseFormReturn<TransferFormValues>;
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
      <Label htmlFor={htmlFor} className="text-xs font-medium tracking-wide text-muted">
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

export function RecipientStep({ form }: RecipientStepProps) {
  const [saved, setSaved] = useState<SavedRecipient[]>([]);
  const country = getCountry(form.watch("recipientCountryCode"));
  const method = form.watch("receivingMethod");
  const errors = form.formState.errors;

  useEffect(() => {
    setSaved(getSavedRecipients());
  }, []);

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
  }

  if (!country) return null;

  const matchingSaved = saved.filter(
    (item) => item.recipientCountryCode === country.code,
  );

  return (
    <div className="space-y-10">
      <header className="max-w-lg space-y-2">
        <h1 className="text-[1.75rem] font-semibold tracking-tight text-navy md:text-[2rem]">
          Recipient details
        </h1>
        <p className="text-[15px] leading-relaxed text-muted">
          Use the name and number registered to their{" "}
          {method === "mobile_money" ? "mobile money" : "bank"} account.
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
                    {recipient.phone}
                    {recipient.network
                      ? ` · ${recipient.network}`
                      : recipient.bank
                        ? ` · ${recipient.bank}`
                        : ""}
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
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full name"
            htmlFor="recipientName"
            required
            error={errors.recipientName?.message}
          >
            <Input
              {...form.register("recipientName")}
              placeholder="Ama Mensah"
              autoComplete="name"
            />
          </Field>

          <Field
            label="Phone number"
            htmlFor="recipientPhone"
            required
            error={errors.recipientPhone?.message}
          >
            <Input
              {...form.register("recipientPhone")}
              placeholder="+233 24 000 0000"
              inputMode="tel"
              autoComplete="tel"
            />
          </Field>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium tracking-wide text-muted">
            Payout method
          </legend>
          <div className="grid grid-cols-2 border border-border p-1">
            {country.methods.map((item) => {
              const label =
                item === "mobile_money" ? "Mobile money" : "Bank transfer";
              const selected = method === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    form.setValue("receivingMethod", item, {
                      shouldValidate: true,
                      shouldDirty: true,
                    });
                    form.setValue(
                      "network",
                      item === "mobile_money"
                        ? (country.networks[0] ?? "")
                        : "",
                      { shouldDirty: true, shouldValidate: true },
                    );
                    form.setValue(
                      "bank",
                      item === "bank" ? (country.banks[0] ?? "") : "",
                      { shouldDirty: true, shouldValidate: true },
                    );
                  }}
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

        {method === "mobile_money" ? (
          <SelectField
            label="Network"
            htmlFor="network"
            required
            error={errors.network?.message}
          >
            <Select
              value={form.watch("network") || undefined}
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
                {country.networks.map((network) => (
                  <SelectItem key={network} value={network}>
                    {network}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SelectField>
        ) : (
          <SelectField
            label="Bank"
            htmlFor="bank"
            required
            error={errors.bank?.message}
          >
            <Select
              value={form.watch("bank") || undefined}
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
                {country.banks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SelectField>
        )}
      </div>
    </div>
  );
}
