import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { PromoDiscountTarget } from "@repo/types";
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
import type { RouteOption } from "./api";
import {
  DISCOUNT_TARGET_LABELS,
  defaultPromoCodeFormValues,
  promoCodeFormSchema,
  type PromoCodeFormValues,
} from "./schema";

export function PromoCodeForm({
  routeOptions,
  defaultValues,
  lockCode = false,
  pending = false,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  routeOptions: RouteOption[];
  defaultValues?: Partial<PromoCodeFormValues>;
  lockCode?: boolean;
  pending?: boolean;
  submitLabel: string;
  onSubmit: (values: PromoCodeFormValues) => void;
  onCancel: () => void;
}) {
  const form = useForm<PromoCodeFormValues>({
    resolver: zodResolver(promoCodeFormSchema),
    defaultValues: defaultPromoCodeFormValues(defaultValues),
    mode: "onTouched",
  });

  const errors = form.formState.errors;
  const routes = useFieldArray({ control: form.control, name: "routes" });
  const appliesToAllRoutes = useWatch({
    control: form.control,
    name: "applies_to_all_routes",
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <Field
        label="Code"
        htmlFor="code"
        required
        error={errors.code?.message}
        description="Stored uppercase. Customers enter this during checkout."
      >
        <Input
          id="code"
          className="font-mono uppercase tracking-wide"
          autoComplete="off"
          spellCheck={false}
          disabled={lockCode}
          {...form.register("code")}
        />
      </Field>

      <Field
        label="Discount"
        htmlFor="discount_percentage"
        required
        error={errors.discount_percentage?.message}
        description="Percentage of the transfer amount, up to 100."
      >
        <Input
          id="discount_percentage"
          inputMode="decimal"
          placeholder="10"
          {...form.register("discount_percentage")}
        />
      </Field>

      <Controller
        control={form.control}
        name="discount_target"
        render={({ field }) => (
          <Field
            label="Apply discount"
            htmlFor="discount_target"
            required
            description={
              appliesToAllRoutes
                ? "Default behaviour on every route. Routes below can override it."
                : "Default for the routes below."
            }
          >
            <TargetSelect
              id="discount_target"
              value={field.value}
              onChange={field.onChange}
            />
          </Field>
        )}
      />

      <div className="space-y-3 border border-border p-3">
        <label className="flex items-center gap-2 text-sm font-medium text-navy">
          <input type="checkbox" {...form.register("applies_to_all_routes")} />
          Valid on all routes
        </label>
        <p className="text-xs text-muted">
          {appliesToAllRoutes
            ? "Add a route only to change how the code behaves on it."
            : "The code only works on the routes below."}
        </p>

        {routes.fields.map((item, index) => (
          <div
            key={item.id}
            className="grid gap-2 border-t border-border pt-3 sm:grid-cols-[1fr_1fr_5rem_auto]"
          >
            <Controller
              control={form.control}
              name={`routes.${index}.route_id`}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger aria-label="Route">
                    <SelectValue placeholder="Route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routeOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Controller
              control={form.control}
              name={`routes.${index}.discount_target`}
              render={({ field }) => (
                <TargetSelect value={field.value} onChange={field.onChange} />
              )}
            />
            <Input
              aria-label="Discount override"
              inputMode="decimal"
              placeholder="% (opt.)"
              {...form.register(`routes.${index}.discount_percentage`)}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => routes.remove(index)}
            >
              Remove
            </Button>
            {errors.routes?.[index] ? (
              <p className="text-sm font-medium text-brand sm:col-span-4">
                {errors.routes[index]?.route_id?.message ??
                  errors.routes[index]?.discount_percentage?.message}
              </p>
            ) : null}
          </div>
        ))}

        {errors.routes?.message || errors.routes?.root?.message ? (
          <p className="text-sm font-medium text-brand">
            {errors.routes?.message ?? errors.routes?.root?.message}
          </p>
        ) : null}

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            routes.append({
              route_id: "",
              discount_target: form.getValues("discount_target"),
              discount_percentage: "",
            })
          }
        >
          Add route
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Start date"
          htmlFor="start_date"
          required
          error={errors.start_date?.message}
        >
          <Input
            id="start_date"
            type="date"
            {...form.register("start_date")}
          />
        </Field>
        <Field
          label="End date"
          htmlFor="end_date"
          required
          error={errors.end_date?.message}
        >
          <Input id="end_date" type="date" {...form.register("end_date")} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Max uses"
          htmlFor="max_uses"
          required
          error={errors.max_uses?.message}
          description="Total redemptions allowed."
        >
          <Input
            id="max_uses"
            type="number"
            min={1}
            step={1}
            {...form.register("max_uses")}
          />
        </Field>
        <Field
          label="Max uses per user"
          htmlFor="max_uses_per_user"
          required
          error={errors.max_uses_per_user?.message}
          description="Limit per sender phone number."
        >
          <Input
            id="max_uses_per_user"
            type="number"
            min={1}
            step={1}
            {...form.register("max_uses_per_user")}
          />
        </Field>
      </div>

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

function TargetSelect({
  id,
  value,
  onChange,
}: {
  id?: string;
  value: PromoDiscountTarget;
  onChange: (value: PromoDiscountTarget) => void;
}) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as PromoDiscountTarget)}
    >
      <SelectTrigger id={id} aria-label="Apply discount">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(DISCOUNT_TARGET_LABELS).map(([target, label]) => (
          <SelectItem key={target} value={target}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
