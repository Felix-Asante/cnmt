import { z } from "zod";
import { isUuid } from "@/utils/id";
import { PAYMENT_PROOF_UPLOAD, createFileValidator } from "@repo/utils/file";
import { validatePhoneNumber } from "@repo/utils/phone";

const validateProofFile = createFileValidator(PAYMENT_PROOF_UPLOAD);

const receivingMethodSchema = z.enum(["mobile_money", "bank"]);

export const transferRequestPayloadSchema = z
  .object({
    senderCountryCode: z
      .string()
      .min(1, "Please select where you are sending from."),
    recipientCountryCode: z
      .string()
      .min(1, "Please select a recipient country."),
    sendAmount: z
      .string()
      .min(1, "Enter how much you want to send.")
      .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount.")
      .refine((value) => Number(value) > 0, {
        message: "Amount must be greater than zero.",
      }),
    sendCurrency: z.string(),
    senderWhatsApp: z.string().trim(),
    recipientName: z
      .string()
      .trim()
      .min(2, "Enter the recipient’s full name.")
      .max(80, "Name is too long."),
    recipientPhone: z.string().trim().max(20, "Phone number is too long."),
    receivingMethod: receivingMethodSchema,
    network: z.string().optional(),
    bank: z.string().optional(),
    bankAccountName: z.string().trim().max(80, "Account name is too long."),
    bankAccountNumber: z.string().trim().max(34, "Account number is too long."),
    note: z
      .string()
      .max(160, "Note must be 160 characters or fewer.")
      .optional(),
    promoCode: z
      .string()
      .trim()
      .max(64, "Promo code is too long.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const senderPhone = validatePhoneNumber(data.senderWhatsApp);
    if (!senderPhone.isValid) {
      ctx.addIssue({
        code: "custom",
        path: ["senderWhatsApp"],
        message: senderPhone.error ?? "Enter a valid phone number.",
      });
    }

    if (data.receivingMethod === "mobile_money") {
      const recipientPhone = validatePhoneNumber(data.recipientPhone);
      if (!recipientPhone.isValid) {
        ctx.addIssue({
          code: "custom",
          path: ["recipientPhone"],
          message: recipientPhone.error ?? "Enter the mobile money number.",
        });
      }

      if (!data.network || !isUuid(data.network)) {
        ctx.addIssue({
          code: "custom",
          path: ["network"],
          message: "Select a mobile money network.",
        });
      }
      return;
    }

    if (!data.bank || !isUuid(data.bank)) {
      ctx.addIssue({
        code: "custom",
        path: ["bank"],
        message: "Select a receiving bank.",
      });
    }

    if (data.bankAccountName.trim().length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["bankAccountName"],
        message: "Enter the account holder’s name.",
      });
    }

    if (data.bankAccountNumber.length < 5) {
      ctx.addIssue({
        code: "custom",
        path: ["bankAccountNumber"],
        message: "Enter a valid account number.",
      });
    } else if (!/^[A-Za-z0-9]+$/.test(data.bankAccountNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["bankAccountNumber"],
        message: "Use letters and numbers only.",
      });
    }
  });

export const transferRequestSchema = transferRequestPayloadSchema.safeExtend({
  proofFile: z.custom<File | null>(
    (value) => value === null || value instanceof File,
  ),
});

export const proofSchema = z.object({
  proofFile: z
    .custom<File | null>((value) => value === null || value instanceof File)
    .superRefine((value, ctx) => {
      const message = validateProofFile(value);
      if (message) {
        ctx.addIssue({ code: "custom", message });
      }
    }),
});

export type TransferFormValues = z.input<typeof transferRequestSchema>;
export type TransferRequestValues = z.input<
  typeof transferRequestPayloadSchema
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
