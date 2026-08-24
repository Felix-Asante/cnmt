import { useState } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Control,
  type UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import {
  getCountryByIso,
  getCountryPickerOptions,
} from "@repo/utils/countries";
import { Button } from "@repo/ui/button";
import { CountryPicker } from "@repo/ui/country-picker";
import { Field } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import { Stepper } from "@repo/ui/stepper";
import {
  CREATE_COUNTRY_STEPS,
  createCountrySchema,
  defaultCreateCountryValues,
  valuesFromCatalog,
  type CreateCountryValues,
} from "./schema";

const STEPS = CREATE_COUNTRY_STEPS.map((step) => ({
  id: step.id,
  label: step.label,
}));

const COUNTRY_FIELDS = [
  "iso_code",
  "name",
  "flag",
  "currency_code",
  "currency_name",
  "currency_symbol",
] as const;

export function CreateCountryForm({
  existingIsoCodes,
  pending = false,
  onSubmit,
  onCancel,
}: {
  existingIsoCodes: Iterable<string>;
  pending?: boolean;
  onSubmit: (values: CreateCountryValues) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState(0);
  const form = useForm<CreateCountryValues>({
    resolver: zodResolver(createCountrySchema),
    defaultValues: defaultCreateCountryValues(),
    mode: "onTouched",
  });
  const channels = useFieldArray({
    control: form.control,
    name: "payment_channels",
  });
  const selected = useWatch({
    control: form.control,
    name: COUNTRY_FIELDS,
  });
  const [isoCode, name, flag, currencyCode, currencyName, currencySymbol] =
    selected;
  const options = getCountryPickerOptions(existingIsoCodes);
  const errors = form.formState.errors;

  async function goNext() {
    const ok = await form.trigger([...COUNTRY_FIELDS]);
    if (ok) setStep(1);
  }

  function selectCountry(code: string) {
    const entry = getCountryByIso(code);
    if (!entry) return;

    form.reset(
      {
        ...form.getValues(),
        ...valuesFromCatalog(entry),
      },
      { keepDirtyValues: false },
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <Stepper steps={STEPS} currentStep={step} />

      {step === 0 ? (
        <CountryStep
          control={form.control}
          options={options}
          isoCode={isoCode}
          name={name}
          flag={flag}
          currencyCode={currencyCode}
          currencyName={currencyName}
          currencySymbol={currencySymbol}
          error={errors.iso_code?.message}
          onSelect={selectCountry}
        />
      ) : (
        <ChannelsStep
          form={form}
          channels={channels}
          flag={flag}
          name={name}
          isoCode={isoCode}
          currencyCode={currencyCode}
        />
      )}

      <div className="flex justify-between gap-2 border-t border-border pt-4">
        {step === 0 ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => setStep(0)}
          >
            Back
          </Button>
        )}

        {step === 0 ? (
          <Button type="button" onClick={() => void goNext()}>
            Continue
          </Button>
        ) : (
          <Button type="submit" loading={pending}>
            Create country
          </Button>
        )}
      </div>
    </form>
  );
}

function CountryStep({
  control,
  options,
  isoCode,
  name,
  flag,
  currencyCode,
  currencyName,
  currencySymbol,
  error,
  onSelect,
}: {
  control: Control<CreateCountryValues>;
  options: ReturnType<typeof getCountryPickerOptions>;
  isoCode: string;
  name: string;
  flag: string;
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  error?: string;
  onSelect: (code: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Controller
        control={control}
        name="iso_code"
        render={({ field }) => (
          <CountryPicker
            id="iso_code"
            label="Country"
            value={field.value}
            options={options}
            placeholder="Search country"
            error={error}
            onChange={onSelect}
          />
        )}
      />

      {isoCode ? (
        <dl className="border border-border">
          <MetaRow label="Name" value={name} />
          <MetaRow label="ISO code" value={isoCode} />
          <MetaRow label="Flag" value={flag} />
          <MetaRow
            label="Currency"
            value={`${currencyName} (${currencyCode} · ${currencySymbol})`}
          />
        </dl>
      ) : (
        <p className="text-sm leading-relaxed text-muted">
          Pick a country. ISO code, flag, and currency are filled in for you.
        </p>
      )}
    </div>
  );
}

function ChannelsStep({
  form,
  channels,
  flag,
  name,
  isoCode,
  currencyCode,
}: {
  form: UseFormReturn<CreateCountryValues>;
  channels: ReturnType<typeof useFieldArray<CreateCountryValues, "payment_channels">>;
  flag: string;
  name: string;
  isoCode: string;
  currencyCode: string;
}) {
  const errors = form.formState.errors;
  const channelError =
    errors.payment_channels?.root?.message ?? errors.payment_channels?.message;

  return (
    <div className="space-y-4">
      <div className="border border-border px-3 py-3">
        <p className="text-sm font-medium text-navy">
          {flag} {name}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {isoCode} · {currencyCode}
        </p>
      </div>

      <div className="space-y-3">
        {channels.fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-3 border border-border p-3 sm:grid-cols-[minmax(0,1fr)_10rem_auto]"
          >
            <Field
              label="Channel name"
              htmlFor={`payment_channels.${index}.name`}
              required
              error={errors.payment_channels?.[index]?.name?.message}
            >
              <Input
                {...form.register(`payment_channels.${index}.name`)}
                placeholder="e.g. MTN, Ecobank"
                autoComplete="off"
              />
            </Field>

            <Controller
              control={form.control}
              name={`payment_channels.${index}.channel_type`}
              render={({ field: typeField }) => (
                <Field
                  label="Type"
                  htmlFor={`payment_channels.${index}.channel_type`}
                  required
                  error={
                    errors.payment_channels?.[index]?.channel_type?.message
                  }
                >
                  <Select
                    value={typeField.value}
                    onValueChange={typeField.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MOBILE_MONEY">Mobile money</SelectItem>
                      <SelectItem value="BANK">Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />

            <div className="flex items-end">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Remove channel"
                disabled={channels.fields.length <= 1}
                onClick={() => channels.remove(index)}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {channelError ? (
        <p role="alert" className="text-sm font-medium text-brand">
          {channelError}
        </p>
      ) : null}

      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          channels.append({ name: "", channel_type: "MOBILE_MONEY" })
        }
      >
        <Plus className="size-4" aria-hidden />
        Add channel
      </Button>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-border px-3 py-2.5 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium break-words text-navy">{value}</dd>
    </div>
  );
}
