import { z } from "zod";
import { isUuid } from "@/utils/id";
import {
  isAllowedMimeType,
  PAYMENT_PROOF_UPLOAD,
} from "@repo/utils/file";
import { validatePhoneNumber } from "@repo/utils/phone";

const receivingMethodSchema = z.enum(["mobile_money", "bank"]);

export type ValidationMessageKey =
  | "senderCountryRequired"
  | "recipientCountryRequired"
  | "sendAmountRequired"
  | "sendAmountInvalid"
  | "sendAmountPositive"
  | "phoneInvalid"
  | "recipientNameMin"
  | "recipientNameMax"
  | "recipientPhoneMax"
  | "recipientPhoneRequired"
  | "networkRequired"
  | "bankRequired"
  | "bankAccountNameRequired"
  | "bankAccountNameMax"
  | "bankAccountNumberRequired"
  | "bankAccountNumberInvalid"
  | "bankAccountNumberMax"
  | "noteMax"
  | "promoCodeMax"
  | "proofRequired"
  | "proofType"
  | "proofSize";

export type ValidationTranslator = (key: ValidationMessageKey) => string;

export function createTransferRequestPayloadSchema(t: ValidationTranslator) {
  return z
    .object({
      senderCountryCode: z.string().min(1, t("senderCountryRequired")),
      recipientCountryCode: z.string().min(1, t("recipientCountryRequired")),
      sendAmount: z
        .string()
        .min(1, t("sendAmountRequired"))
        .regex(/^\d+(\.\d{1,2})?$/, t("sendAmountInvalid"))
        .refine((value) => Number(value) > 0, {
          message: t("sendAmountPositive"),
        }),
      sendCurrency: z.string(),
      senderWhatsApp: z.string().trim(),
      recipientName: z
        .string()
        .trim()
        .min(2, t("recipientNameMin"))
        .max(80, t("recipientNameMax")),
      recipientPhone: z.string().trim().max(20, t("recipientPhoneMax")),
      receivingMethod: receivingMethodSchema,
      network: z.string().optional(),
      bank: z.string().optional(),
      bankAccountName: z.string().trim().max(80, t("bankAccountNameMax")),
      bankAccountNumber: z
        .string()
        .trim()
        .max(34, t("bankAccountNumberMax")),
      note: z.string().max(160, t("noteMax")).optional(),
      promoCode: z
        .string()
        .trim()
        .max(64, t("promoCodeMax"))
        .optional()
        .or(z.literal("")),
    })
    .superRefine((data, ctx) => {
      const senderPhone = validatePhoneNumber(data.senderWhatsApp);
      if (!senderPhone.isValid) {
        ctx.addIssue({
          code: "custom",
          path: ["senderWhatsApp"],
          message: t("phoneInvalid"),
        });
      }

      if (data.receivingMethod === "mobile_money") {
        const recipientPhone = validatePhoneNumber(data.recipientPhone);
        if (!recipientPhone.isValid) {
          ctx.addIssue({
            code: "custom",
            path: ["recipientPhone"],
            message: t("recipientPhoneRequired"),
          });
        }

        if (!data.network || !isUuid(data.network)) {
          ctx.addIssue({
            code: "custom",
            path: ["network"],
            message: t("networkRequired"),
          });
        }
        return;
      }

      if (!data.bank || !isUuid(data.bank)) {
        ctx.addIssue({
          code: "custom",
          path: ["bank"],
          message: t("bankRequired"),
        });
      }

      if (data.bankAccountName.trim().length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["bankAccountName"],
          message: t("bankAccountNameRequired"),
        });
      }

      if (data.bankAccountNumber.length < 5) {
        ctx.addIssue({
          code: "custom",
          path: ["bankAccountNumber"],
          message: t("bankAccountNumberRequired"),
        });
      } else if (!/^[A-Za-z0-9]+$/.test(data.bankAccountNumber)) {
        ctx.addIssue({
          code: "custom",
          path: ["bankAccountNumber"],
          message: t("bankAccountNumberInvalid"),
        });
      }
    });
}

export function createTransferRequestSchema(t: ValidationTranslator) {
  return createTransferRequestPayloadSchema(t).safeExtend({
    proofFile: z.custom<File | null>(
      (value) => value === null || value instanceof File,
    ),
  });
}

export function createProofSchema(t: ValidationTranslator) {
  return z.object({
    proofFile: z
      .custom<File | null>((value) => value === null || value instanceof File)
      .superRefine((value, ctx) => {
        if (!(value instanceof File)) {
          ctx.addIssue({ code: "custom", message: t("proofRequired") });
          return;
        }
        if (
          value.size <= 0 ||
          value.size > PAYMENT_PROOF_UPLOAD.maxSizeBytes
        ) {
          ctx.addIssue({ code: "custom", message: t("proofSize") });
          return;
        }
        if (!isAllowedMimeType(value.type, PAYMENT_PROOF_UPLOAD.accept)) {
          ctx.addIssue({ code: "custom", message: t("proofType") });
        }
      }),
  });
}

/** English fallback for server-side structural checks (errors are not shown). */
const serverMessages: ValidationTranslator = (key) => key;

export const transferRequestPayloadSchema =
  createTransferRequestPayloadSchema(serverMessages);

export type TransferFormValues = z.input<
  ReturnType<typeof createTransferRequestSchema>
>;
export type TransferRequestValues = z.input<
  ReturnType<typeof createTransferRequestPayloadSchema>
>;

export const defaultTransferValues: TransferFormValues = {
  senderCountryCode: "",
  recipientCountryCode: "",
  sendAmount: "",
  sendCurrency: "GBP",
  senderWhatsApp: "",
  recipientName: "",
  recipientPhone: "",
  receivingMethod: "mobile_money",
  network: "",
  bank: "",
  bankAccountName: "",
  bankAccountNumber: "",
  note: "",
  promoCode: "",
  proofFile: null,
};

/** Step indices: 0 Transfer · 1 Recipient · 2 Submitted · 3 Pay · 4 Proof · 5 Done */
export const stepFieldMap = [
  ["senderCountryCode", "recipientCountryCode", "sendAmount", "sendCurrency"],
  [
    "senderWhatsApp",
    "recipientName",
    "recipientPhone",
    "receivingMethod",
    "network",
    "bank",
    "bankAccountName",
    "bankAccountNumber",
  ],
  [],
  [],
  ["proofFile"],
] as const satisfies ReadonlyArray<ReadonlyArray<keyof TransferFormValues>>;
