import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AdminCountry, AdminPaymentChannel } from "@repo/types";
import { Button } from "@repo/ui/button";
import { Field } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { loadCountryChannels } from "./api";
import {
  defaultPaymentAccountFormValues,
  paymentAccountFormSchema,
  type PaymentAccountFormValues,
} from "./schema";

export function PaymentAccountForm({
  countries,
  defaultValues,
  channelNameHint,
  lockCountry = false,
  lockMethod = false,
  pending = false,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  countries: AdminCountry[];
  defaultValues?: Partial<PaymentAccountFormValues>;
  channelNameHint?: string;
  lockCountry?: boolean;
  lockMethod?: boolean;
  pending?: boolean;
  submitLabel: string;
  onSubmit: (values: PaymentAccountFormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<PaymentAccountFormValues>({
    resolver: zodResolver(paymentAccountFormSchema),
    defaultValues: defaultPaymentAccountFormValues(defaultValues),
    mode: "onTouched",
  });

  const errors = form.formState.errors;
  const countryId = useWatch({ control: form.control, name: "country_id" });
  const method = useWatch({ control: form.control, name: "payment_method" });
  const [channels, setChannels] = useState<AdminPaymentChannel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);

  useEffect(() => {
    if (!countryId) {
      setChannels([]);
      return;
    }

    let cancelled = false;
    setLoadingChannels(true);

    void loadCountryChannels(countryId)
      .then((country) => {
        if (cancelled) return;
        const active = country.payment_channels.filter(
          (channel) => channel.is_active,
        );
        setChannels(active);

        const currency = form.getValues("currency_code");
        if (!currency.trim()) {
          form.setValue("currency_code", country.currency_code);
        }

        const currentChannelId = form.getValues("payment_channel_id");
        if (!currentChannelId && channelNameHint) {
          const match = active.find(
            (channel) =>
              channel.channel_type === form.getValues("payment_method") &&
              channel.name === channelNameHint,
          );
          if (match) form.setValue("payment_channel_id", match.id);
        }
      })
      .catch(() => {
        if (!cancelled) setChannels([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingChannels(false);
      });

    return () => {
      cancelled = true;
    };
  }, [countryId, form, channelNameHint]);


  const filteredChannels = channels.filter(
    (channel) => channel.channel_type === method,
  );

  useEffect(() => {
    const channelId = form.getValues("payment_channel_id");
    if (
      channelId &&
      filteredChannels.length > 0 &&
      !filteredChannels.some((channel) => channel.id === channelId)
    ) {
      form.setValue("payment_channel_id", "");
    }
  }, [filteredChannels, form]);

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <Controller
        control={form.control}
        name="country_id"
        render={({ field }) => (
          <Field
            label="Country"
            htmlFor="country_id"
            required
            error={errors.country_id?.message}
          >
            <Select
              value={field.value || undefined}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("payment_channel_id", "");
                form.setValue("currency_code", "");
              }}
              disabled={lockCountry}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={String(country.id)}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="payment_method"
        render={({ field }) => (
          <Field
            label="Payment method"
            htmlFor="payment_method"
            required
            error={errors.payment_method?.message}
          >
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value);
                form.setValue("payment_channel_id", "");
                if (value === "BANK") {
                  form.setValue("phone_number", "");
                } else {
                  form.setValue("account_number", "");
                  form.setValue("sort_code", "");
                  form.setValue("iban", "");
                }
              }}
              disabled={lockMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BANK">Bank</SelectItem>
                <SelectItem value="MOBILE_MONEY">Mobile money</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="payment_channel_id"
        render={({ field }) => (
          <Field
            label="Payment channel"
            htmlFor="payment_channel_id"
            required
            error={errors.payment_channel_id?.message}
            description={
              loadingChannels
                ? "Loading channels…"
                : filteredChannels.length === 0 && countryId
                  ? `No active ${method === "BANK" ? "bank" : "mobile money"} channels for this country.`
                  : undefined
            }
          >
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={!countryId || loadingChannels}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent>
                {filteredChannels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <Field
        label="Display name"
        htmlFor="name"
        required
        error={errors.name?.message}
        description="Internal label for ops, e.g. UK Barclays GBP."
      >
        <Input id="name" {...form.register("name")} />
      </Field>

      <Field
        label="Account name"
        htmlFor="account_name"
        required
        error={errors.account_name?.message}
      >
        <Input id="account_name" {...form.register("account_name")} />
      </Field>

      {method === "BANK" ? (
        <>
          <Field
            label="Account number"
            htmlFor="account_number"
            required
            error={errors.account_number?.message}
          >
            <Input id="account_number" {...form.register("account_number")} />
          </Field>
          <Field
            label="Sort code"
            htmlFor="sort_code"
            error={errors.sort_code?.message}
          >
            <Input id="sort_code" {...form.register("sort_code")} />
          </Field>
          <Field label="IBAN" htmlFor="iban" error={errors.iban?.message}>
            <Input id="iban" {...form.register("iban")} />
          </Field>
        </>
      ) : (
        <Field
          label="Phone number"
          htmlFor="phone_number"
          required
          error={errors.phone_number?.message}
          description="E.164 format, e.g. +233551234567."
        >
          <Input
            id="phone_number"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+233551234567"
            {...form.register("phone_number")}
          />
        </Field>
      )}

      <Field
        label="Currency"
        htmlFor="currency_code"
        required
        error={errors.currency_code?.message}
      >
        <Input
          id="currency_code"
          maxLength={3}
          className="uppercase"
          {...form.register("currency_code")}
        />
      </Field>

      <div className="flex gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
