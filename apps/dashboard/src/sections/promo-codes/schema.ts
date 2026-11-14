import { z } from "zod";
import type {
  CreatePromoCodePayload,
  PromoCode,
  PromoDiscountTarget,
  UpdatePromoCodePayload,
} from "@repo/types";

export const DISCOUNT_TARGET_LABELS: Record<PromoDiscountTarget, string> = {
  SEND_AMOUNT: "Off the transfer amount",
  RECIPIENT_AMOUNT: "Added to recipient amount",
};

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
    return amount > 0 && amount <= 100;
  }, "Discount must be greater than 0 and at most 100.");

const targetSchema = z.enum(["SEND_AMOUNT", "RECIPIENT_AMOUNT"]);

const routeRuleSchema = z.object({
  route_id: z.string().min(1, "Choose a route."),
  discount_target: targetSchema,
  // Empty = use the code's discount.
  discount_percentage: z.union([z.literal(""), percentSchema]),
});

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
    discount_target: targetSchema,
    applies_to_all_routes: z.boolean(),
    routes: z.array(routeRuleSchema),
  })
  .superRefine((values, ctx) => {
    if (!values.applies_to_all_routes && values.routes.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["routes"],
        message: "Add at least one route, or allow all routes.",
      });
    }
    const ids = values.routes.map((r) => r.route_id).filter(Boolean);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: "custom",
        path: ["routes"],
        message: "Each route can only be added once.",
      });
    }
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
    discount_target: "SEND_AMOUNT",
    applies_to_all_routes: true,
    routes: [],
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
    discount_target: promo.discount_target,
    applies_to_all_routes: promo.applies_to_all_routes,
    routes: promo.routes.map((rule) => ({
      route_id: rule.route_id,
      discount_target: rule.discount_target,
      discount_percentage:
        rule.discount_percentage == null ? "" : String(rule.discount_percentage),
    })),
  };
}

export function toUpdatePayload(
  values: PromoCodeFormValues,
): UpdatePromoCodePayload {
  return {
    discount_percentage: values.discount_percentage.trim(),
    discount_target: values.discount_target,
    applies_to_all_routes: values.applies_to_all_routes,
    routes: values.routes.map((rule) => ({
      route_id: rule.route_id,
      discount_target: rule.discount_target,
      discount_percentage: rule.discount_percentage.trim() || undefined,
    })),
    start_date: toIsoStart(values.start_date),
    end_date: toIsoEnd(values.end_date),
    max_uses: Number(values.max_uses),
    max_uses_per_user: Number(values.max_uses_per_user),
  };
}

export function toCreatePayload(
  values: PromoCodeFormValues,
): CreatePromoCodePayload {
  return {
    code: values.code.trim().toUpperCase(),
    ...toUpdatePayload(values),
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
