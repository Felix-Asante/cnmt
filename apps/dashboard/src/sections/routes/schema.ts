import { z } from "zod";
import { FEE_TYPES, type FeeType } from "@repo/types";

const amountSchema = z
  .string()
  .trim()
  .min(1, "Enter an amount.")
  .refine((value) => Number.isFinite(Number(value)), "Enter a valid number.");

export const routeFormSchema = z
  .object({
    source_country_id: z.string().min(1, "Select a source country."),
    dest_country_id: z.string().min(1, "Select a destination country."),
    exchange_rate: amountSchema,
    fee_type: z.enum(FEE_TYPES),
    fee: amountSchema,
    min_transfer_amount: amountSchema,
    max_transfer_amount: amountSchema,
  })
  .superRefine((values, ctx) => {
    const rate = Number(values.exchange_rate);
    const fee = Number(values.fee);
    const min = Number(values.min_transfer_amount);
    const max = Number(values.max_transfer_amount);

    if (values.source_country_id === values.dest_country_id) {
      ctx.addIssue({
        code: "custom",
        path: ["dest_country_id"],
        message: "Destination must be different from source.",
      });
    }
    if (rate <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["exchange_rate"],
        message: "Exchange rate must be greater than 0.",
      });
    }
    if (fee < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["fee"],
        message: "Fee cannot be negative.",
      });
    }
    if (values.fee_type === "percentage" && fee > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["fee"],
        message: "Percentage fee cannot be greater than 100.",
      });
    }
    if (min < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["min_transfer_amount"],
        message: "Amount cannot be negative.",
      });
    }
    if (max < 0) {
      ctx.addIssue({
        code: "custom",
        path: ["max_transfer_amount"],
        message: "Amount cannot be negative.",
      });
    }
    if (min > max) {
      ctx.addIssue({
        code: "custom",
        path: ["min_transfer_amount"],
        message: "Minimum cannot be greater than maximum.",
      });
    }
  });

export type RouteFormValues = z.infer<typeof routeFormSchema>;

export function defaultRouteFormValues(
  values?: Partial<RouteFormValues>,
): RouteFormValues {
  return {
    source_country_id: "",
    dest_country_id: "",
    exchange_rate: "",
    fee_type: "fixed",
    fee: "",
    min_transfer_amount: "",
    max_transfer_amount: "",
    ...values,
  };
}

export function toCreatePayload(values: RouteFormValues) {
  return {
    source_country_id: Number(values.source_country_id),
    dest_country_id: Number(values.dest_country_id),
    exchange_rate: values.exchange_rate,
    fee_type: values.fee_type as FeeType,
    fee: values.fee,
    min_transfer_amount: values.min_transfer_amount,
    max_transfer_amount: values.max_transfer_amount,
  };
}

export function toUpdatePayload(values: RouteFormValues) {
  return {
    exchange_rate: values.exchange_rate,
    fee_type: values.fee_type,
    fee: values.fee,
    min_transfer_amount: values.min_transfer_amount,
    max_transfer_amount: values.max_transfer_amount,
  };
}
