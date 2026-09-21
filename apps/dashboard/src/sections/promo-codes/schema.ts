import { z } from "zod";
import type {
  CreatePromoCodePayload,
  PromoCode,
  UpdatePromoCodePayload,
} from "@repo/types";

const dateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.");

const percentSchema = z
  .string()
  .trim()
  .min(1, "Enter a discount percentage.")
  .refine((value) => Number.isFinite(Number(value)), "Enter a valid number.")
  .refine((value) => {
    const amount = Number(value);
    return amount >= 0 && amount <= 100;
  }, "Discount must be between 0 and 100.");

const usesSchema = z
  .string()
  .trim()
  .min(1, "Enter a whole number.")
  .refine((value) => /^\d+$/.test(value), "Enter a whole number.")
  .refine((value) => Number(value) >= 1, "Must be at least 1.");

export const promoCodeFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Enter a promo code.")
      .max(64, "Code must be 64 characters or fewer."),
    discount_percentage: percentSchema,
    start_date: dateSchema,
    end_date: dateSchema,
    max_uses: usesSchema,
    max_uses_per_user: usesSchema,
  })
  .superRefine((values, ctx) => {
    if (values.end_date < values.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "End date must be on or after the start date.",
      });
    }
    if (Number(values.max_uses_per_user) > Number(values.max_uses)) {
      ctx.addIssue({
        code: "custom",
        path: ["max_uses_per_user"],
        message: "Per-user limit cannot exceed total uses.",
      });
    }
  });

export type PromoCodeFormValues = z.infer<typeof promoCodeFormSchema>;

export function defaultPromoCodeFormValues(
  values?: Partial<PromoCodeFormValues>,
): PromoCodeFormValues {
  return {
    code: "",
    discount_percentage: "",
    start_date: "",
    end_date: "",
    max_uses: "1",
    max_uses_per_user: "1",
    ...values,
  };
}

function toIsoStart(date: string) {
  return new Date(`${date}T00:00:00`).toISOString();
}

function toIsoEnd(date: string) {
  return new Date(`${date}T23:59:59.999`).toISOString();
}

export function toDateInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function valuesFromPromoCode(promo: PromoCode): PromoCodeFormValues {
  return {
    code: promo.code,
    discount_percentage: String(promo.discount_percentage),
    start_date: toDateInputValue(promo.start_date),
    end_date: toDateInputValue(promo.end_date),
    max_uses: String(promo.max_uses),
    max_uses_per_user: String(promo.max_uses_per_user),
  };
}

export function toCreatePayload(
  values: PromoCodeFormValues,
): CreatePromoCodePayload {
  return {
    code: values.code.trim().toUpperCase(),
    discount_percentage: values.discount_percentage.trim(),
    start_date: toIsoStart(values.start_date),
    end_date: toIsoEnd(values.end_date),
    max_uses: Number(values.max_uses),
    max_uses_per_user: Number(values.max_uses_per_user),
  };
}

export function toUpdatePayload(
  values: PromoCodeFormValues,
): UpdatePromoCodePayload {
  return {
    discount_percentage: values.discount_percentage.trim(),
    start_date: toIsoStart(values.start_date),
    end_date: toIsoEnd(values.end_date),
    max_uses: Number(values.max_uses),
    max_uses_per_user: Number(values.max_uses_per_user),
  };
}

export type PromoWindowStatus = "upcoming" | "active" | "expired";

export function promoWindowStatus(
  startDate: string,
  endDate: string,
): PromoWindowStatus {
  const now = Date.now();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "expired";
  if (now < start) return "upcoming";
  if (now > end) return "expired";
  return "active";
}

export function promoWindowLabel(status: PromoWindowStatus) {
  switch (status) {
    case "upcoming":
      return "Upcoming";
    case "active":
      return "Active";
    case "expired":
      return "Expired";
  }
}

export function promoWindowBadgeVariant(status: PromoWindowStatus) {
  switch (status) {
    case "upcoming":
      return "gold" as const;
    case "active":
      return "success" as const;
    case "expired":
      return "neutral" as const;
  }
}

export function formatDiscountPercent(value: string | number) {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `${amount}%`;
}
