import { z } from "zod";
import type {
  CreatePaymentAccountPayload,
  ReceivingMethod,
  UpdatePaymentAccountPayload,
} from "@repo/types";

const e164 = /^\+[1-9]\d{1,14}$/;

export const paymentAccountFormSchema = z
  .object({
    country_id: z.string().min(1, "Select a country."),
    payment_method: z.enum(["BANK", "MOBILE_MONEY"], {
      message: "Select a payment method.",
    }),
    name: z.string().trim().min(1, "Enter a display name.").max(255),
    account_name: z.string().trim().min(1, "Enter the account name.").max(255),
    account_number: z.string().trim().max(100).optional().or(z.literal("")),
    phone_number: z.string().trim().max(20).optional().or(z.literal("")),
    sort_code: z.string().trim().max(32).optional().or(z.literal("")),
    iban: z.string().trim().max(34).optional().or(z.literal("")),
    payment_channel_id: z.string().min(1, "Select a payment channel."),
    currency_code: z
      .string()
      .trim()
      .length(3, "Currency must be a 3-letter code."),
  })
  .superRefine((values, ctx) => {
    if (values.payment_method === "BANK") {
      if (!values.account_number?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["account_number"],
          message: "Account number is required for bank accounts.",
        });
      }
      if (values.phone_number?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["phone_number"],
          message: "Phone number is not used for bank accounts.",
        });
      }
    }

    if (values.payment_method === "MOBILE_MONEY") {
      if (!values.phone_number?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["phone_number"],
          message: "Phone number is required for mobile money.",
        });
      } else if (!e164.test(values.phone_number.trim())) {
        ctx.addIssue({
          code: "custom",
          path: ["phone_number"],
          message: "Use E.164 format, e.g. +447700900123.",
        });
      }
      if (values.account_number?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["account_number"],
          message: "Account number is not used for mobile money.",
        });
      }
      if (values.sort_code?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["sort_code"],
          message: "Sort code is not used for mobile money.",
        });
      }
      if (values.iban?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["iban"],
          message: "IBAN is not used for mobile money.",
        });
      }
    }
  });

export type PaymentAccountFormValues = z.infer<typeof paymentAccountFormSchema>;

export function defaultPaymentAccountFormValues(
  values?: Partial<PaymentAccountFormValues>,
): PaymentAccountFormValues {
  return {
    country_id: "",
    payment_method: "BANK",
    name: "",
    account_name: "",
    account_number: "",
    phone_number: "",
    sort_code: "",
    iban: "",
    payment_channel_id: "",
    currency_code: "",
    ...values,
  };
}

function optionalField(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function sharedPayload(values: PaymentAccountFormValues) {
  const method = values.payment_method as ReceivingMethod;
  const base = {
    name: values.name.trim(),
    account_name: values.account_name.trim(),
    payment_channel_id: values.payment_channel_id,
    currency_code: values.currency_code.trim().toUpperCase(),
  };

  if (method === "BANK") {
    return {
      ...base,
      account_number: optionalField(values.account_number),
      sort_code: optionalField(values.sort_code),
      iban: optionalField(values.iban),
    };
  }

  return {
    ...base,
    phone_number: optionalField(values.phone_number),
  };
}

export function toCreatePayload(
  values: PaymentAccountFormValues,
): CreatePaymentAccountPayload {
  return {
    country_id: Number(values.country_id),
    payment_method: values.payment_method,
    ...sharedPayload(values),
  };
}

export function toUpdatePayload(
  values: PaymentAccountFormValues,
): UpdatePaymentAccountPayload {
  return sharedPayload(values);
}

export function paymentMethodLabel(method: ReceivingMethod) {
  return method === "MOBILE_MONEY" ? "Mobile money" : "Bank";
}
