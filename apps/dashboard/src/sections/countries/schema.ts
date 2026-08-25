import { z } from "zod";
import type { CountryCatalogEntry } from "@repo/utils/countries";
import type {
  CreateCountryPayload,
  CreatePaymentChannelPayload,
  PaymentChannelType,
  UpdateCountryPayload,
  UpdatePaymentChannelPayload,
} from "@repo/types";

export const PAYMENT_CHANNEL_TYPES = ["BANK", "MOBILE_MONEY"] as const;

const countryFields = {
  iso_code: z.string().trim().min(2, "ISO code is required.").max(3),
  name: z
    .string()
    .trim()
    .min(3, "Enter at least 3 characters.")
    .max(255, "Name is too long."),
  flag: z.string().trim().min(1, "Flag is required.").max(16),
  currency_name: z.string().trim().min(1, "Currency name is required."),
  currency_code: z
    .string()
    .trim()
    .length(3, "Currency code must be 3 letters."),
  currency_symbol: z
    .string()
    .trim()
    .min(1, "Currency symbol is required.")
    .max(3, "Currency symbol is too long."),
};

export const createCountrySchema = z.object({
  ...countryFields,
  iso_code: z.string().trim().min(2, "Select a country.").max(3),
  payment_channels: z
    .array(
      z.object({
        name: z
          .string()
          .trim()
          .min(3, "Enter at least 3 characters.")
          .max(255, "Name is too long."),
        channel_type: z.enum(PAYMENT_CHANNEL_TYPES),
      }),
    )
    .min(1, "Add at least one payment channel."),
});

export const updateCountrySchema = z.object({
  ...countryFields,
  iso_code: z.string().trim().min(2, "Select a country.").max(3),
});

export const updatePaymentChannelSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Enter at least 3 characters.")
    .max(255, "Name is too long."),
  channel_type: z.enum(PAYMENT_CHANNEL_TYPES),
});

export type CreateCountryValues = z.infer<typeof createCountrySchema>;
export type UpdateCountryValues = z.infer<typeof updateCountrySchema>;
export type UpdatePaymentChannelValues = z.infer<
  typeof updatePaymentChannelSchema
>;

export function defaultCreateCountryValues(): CreateCountryValues {
  return {
    iso_code: "",
    name: "",
    flag: "",
    currency_name: "",
    currency_code: "",
    currency_symbol: "",
    payment_channels: [{ name: "", channel_type: "MOBILE_MONEY" }],
  };
}

export function valuesFromCatalog(
  entry: CountryCatalogEntry,
): Pick<
  CreateCountryValues,
  | "iso_code"
  | "name"
  | "flag"
  | "currency_name"
  | "currency_code"
  | "currency_symbol"
> {
  return {
    iso_code: entry.iso_code,
    name: entry.name,
    flag: entry.flag,
    currency_name: entry.currency_name,
    currency_code: entry.currency_code,
    currency_symbol: entry.currency_symbol,
  };
}

export function toCreateCountryPayload(
  values: CreateCountryValues,
): CreateCountryPayload {
  return {
    name: values.name,
    iso_code: values.iso_code,
    flag: values.flag,
    currency_name: values.currency_name,
    currency_code: values.currency_code,
    currency_symbol: values.currency_symbol,
    payment_channels: values.payment_channels.map((channel) => ({
      name: channel.name.trim(),
      channel_type: channel.channel_type as PaymentChannelType,
    })),
  };
}

export function toUpdateCountryPayload(
  values: UpdateCountryValues,
): UpdateCountryPayload {
  return {
    name: values.name.trim(),
    iso_code: values.iso_code.trim().toUpperCase(),
    flag: values.flag.trim(),
    currency_name: values.currency_name.trim(),
    currency_code: values.currency_code.trim().toUpperCase(),
    currency_symbol: values.currency_symbol.trim(),
  };
}

export function toUpdatePaymentChannelPayload(
  values: UpdatePaymentChannelValues,
): UpdatePaymentChannelPayload {
  return {
    name: values.name.trim(),
    channel_type: values.channel_type as PaymentChannelType,
  };
}

export function toCreatePaymentChannelPayload(
  values: UpdatePaymentChannelValues,
): CreatePaymentChannelPayload {
  return toUpdatePaymentChannelPayload(values);
}

export const CREATE_COUNTRY_STEPS = [
  { id: "country", label: "Country" },
  { id: "channels", label: "Payment channels" },
] as const;

export function channelTypeLabel(type: PaymentChannelType) {
  return type === "BANK" ? "Bank" : "Mobile money";
}
