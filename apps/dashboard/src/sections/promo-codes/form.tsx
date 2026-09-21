import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@repo/ui/button";
import { Field } from "@repo/ui/field";
import { Input } from "@repo/ui/input";
import {
  defaultPromoCodeFormValues,
  promoCodeFormSchema,
  type PromoCodeFormValues,
} from "./schema";

export function PromoCodeForm({
  defaultValues,
  lockCode = false,
  pending = false,
  submitLabel,
  onSubmit,
  onCancel,
}: {
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
        description="Percentage off, from 0 to 100."
      >
        <Input
          id="discount_percentage"
          inputMode="decimal"
          placeholder="10"
          {...form.register("discount_percentage")}
        />
      </Field>

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
