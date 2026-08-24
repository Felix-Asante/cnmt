import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AdminCountry } from "@repo/types";
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
import {
  defaultRouteFormValues,
  routeFormSchema,
  type RouteFormValues,
} from "./schema";

export function RouteForm({
  countries,
  defaultValues,
  lockCountries = false,
  pending = false,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  countries: AdminCountry[];
  defaultValues?: Partial<RouteFormValues>;
  lockCountries?: boolean;
  pending?: boolean;
  submitLabel: string;
  onSubmit: (values: RouteFormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: defaultRouteFormValues(defaultValues),
    mode: "onTouched",
  });

  const errors = form.formState.errors;
  const sourceId = form.watch("source_country_id");
  const destinations = countries.filter(
    (country) => String(country.id) !== sourceId,
  );

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <Controller
        control={form.control}
        name="source_country_id"
        render={({ field }) => (
          <Field
            label="Source country"
            htmlFor="source_country_id"
            required
            error={errors.source_country_id?.message}
          >
            <Select
              value={field.value || undefined}
              onValueChange={(value) => {
                field.onChange(value);
                if (form.getValues("dest_country_id") === value) {
                  form.setValue("dest_country_id", "");
                }
              }}
              disabled={lockCountries}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
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
        name="dest_country_id"
        render={({ field }) => (
          <Field
            label="Destination country"
            htmlFor="dest_country_id"
            required
            error={errors.dest_country_id?.message}
            description="This does not create the reverse corridor."
          >
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
              disabled={lockCountries}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((country) => (
                  <SelectItem key={country.id} value={String(country.id)}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      />

      <Field
        label="Exchange rate"
        htmlFor="exchange_rate"
        required
        error={errors.exchange_rate?.message}
        description="How many destination units one source unit buys."
      >
        <Input
          {...form.register("exchange_rate")}
          inputMode="decimal"
          autoComplete="off"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="fee_type"
          render={({ field }) => (
            <Field
              label="Fee type"
              htmlFor="fee_type"
              required
              error={errors.fee_type?.message}
            >
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />
        <Field
          label="Fee"
          htmlFor="fee"
          required
          error={errors.fee?.message}
        >
          <Input {...form.register("fee")} inputMode="decimal" autoComplete="off" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Minimum send"
          htmlFor="min_transfer_amount"
          required
          error={errors.min_transfer_amount?.message}
        >
          <Input
            {...form.register("min_transfer_amount")}
            inputMode="decimal"
            autoComplete="off"
          />
        </Field>
        <Field
          label="Maximum send"
          htmlFor="max_transfer_amount"
          required
          error={errors.max_transfer_amount?.message}
        >
          <Input
            {...form.register("max_transfer_amount")}
            inputMode="decimal"
            autoComplete="off"
          />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" disabled={pending} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
