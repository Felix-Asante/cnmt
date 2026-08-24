import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getCountryByIso,
  getCountryPickerOptions,
} from "@repo/utils/countries";
import type { AdminCountry } from "@repo/types";
import { Button } from "@repo/ui/button";
import { CountryPicker } from "@repo/ui/country-picker";
import {
  updateCountrySchema,
  valuesFromCatalog,
  type UpdateCountryValues,
} from "./schema";

const COUNTRY_FIELDS = [
  "iso_code",
  "name",
  "flag",
  "currency_code",
  "currency_name",
  "currency_symbol",
] as const;

export function EditCountryForm({
  country,
  existingIsoCodes,
  pending = false,
  onSubmit,
  onCancel,
}: {
  country: AdminCountry;
  existingIsoCodes: Iterable<string>;
  pending?: boolean;
  onSubmit: (values: UpdateCountryValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<UpdateCountryValues>({
    resolver: zodResolver(updateCountrySchema),
    defaultValues: {
      name: country.name,
      iso_code: country.iso_code,
      flag: country.flag,
      currency_name: country.currency_name,
      currency_code: country.currency_code,
      currency_symbol: country.currency_symbol,
    },
    mode: "onTouched",
  });
  const selected = useWatch({
    control: form.control,
    name: COUNTRY_FIELDS,
  });
  const [isoCode, name, flag, currencyCode, currencyName, currencySymbol] =
    selected;
  const excluded = [...existingIsoCodes].filter(
    (code) => code.trim().toUpperCase() !== country.iso_code.toUpperCase(),
  );
  const options = getCountryPickerOptions(excluded);
  if (!options.some((option) => option.code === country.iso_code)) {
    options.unshift({
      code: country.iso_code,
      name: country.name,
      flag: country.flag,
      meta: `${country.iso_code} · ${country.currency_code}`,
    });
  }
  const errors = form.formState.errors;

  function selectCountry(code: string) {
    const entry = getCountryByIso(code);
    if (!entry) return;
    form.reset(valuesFromCatalog(entry), { keepDirtyValues: false });
  }

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <Controller
        control={form.control}
        name="iso_code"
        render={({ field }) => (
          <CountryPicker
            id="iso_code"
            label="Country"
            value={field.value}
            options={options}
            placeholder="Search country"
            error={errors.iso_code?.message}
            onChange={selectCountry}
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

      <div className="flex justify-end gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" loading={pending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-4 border-b border-border px-3 py-2.5 last:border-b-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium wrap-break-word text-navy">{value}</dd>
    </div>
  );
}
