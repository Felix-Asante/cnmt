import { z } from "zod";

const receivingMethodSchema = z.enum(["mobile_money", "bank"]);

const phoneSchema = z
  .string()
  .trim()
  .min(8, "Enter a valid phone number.")
  .max(20, "Phone number is too long.")
  .regex(/^[+0-9\s()-]+$/, "Use digits and standard phone characters only.");

/** Validates the request itself — payment proof is deferred. */
export const transferRequestSchema = z
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
      .refine((value) => Number(value) > 0, {
        message: "Amount must be greater than zero.",
      })
      .refine((value) => Number(value) <= 25000, {
        message: "Maximum single transfer is 25,000.",
      }),
    sendCurrency: z.enum(["GBP", "EUR", "MAD"]),
    senderWhatsApp: phoneSchema,
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
    bankAccountNumber: z
      .string()
      .trim()
      .max(34, "Account number is too long."),
    note: z.string().max(160, "Note must be 160 characters or fewer.").optional(),
    proofFile: z.custom<File | null>(
      (value) => value === null || value instanceof File,
    ),
  })
  .superRefine((data, ctx) => {
    if (data.receivingMethod === "mobile_money") {
      const phoneResult = phoneSchema.safeParse(data.recipientPhone);
      if (!phoneResult.success) {
        ctx.addIssue({
          code: "custom",
          path: ["recipientPhone"],
          message:
            phoneResult.error.issues[0]?.message ??
            "Enter the mobile money number.",
        });
      }

      if (!data.network) {
        ctx.addIssue({
          code: "custom",
          path: ["network"],
          message: "Select a mobile money network.",
        });
      }
      return;
    }

    // Bank channel — no recipient phone
    if (!data.bank) {
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
    } else if (!/^[A-Za-z0-9-]+$/.test(data.bankAccountNumber)) {
      ctx.addIssue({
        code: "custom",
        path: ["bankAccountNumber"],
        message: "Use letters and numbers only.",
      });
    }
  });

export const proofSchema = z.object({
  proofFile: z
    .custom<File | null>((value) => value === null || value instanceof File)
    .refine((value) => value instanceof File, {
      message: "Upload a payment proof to continue.",
    }),
});

export const transferFormSchema = transferRequestSchema;

export type TransferFormValues = z.input<typeof transferRequestSchema>;

export const defaultTransferValues: TransferFormValues = {
  senderCountryCode: "GB",
  recipientCountryCode: "GH",
  sendAmount: "",
  sendCurrency: "GBP",
  senderWhatsApp: "",
  recipientName: "",
  recipientPhone: "",
  receivingMethod: "mobile_money",
  network: "MTN MoMo",
  bank: "",
  bankAccountName: "",
  bankAccountNumber: "",
  note: "",
  proofFile: null,
};

/** Step indices: 0 Transfer · 1 Recipient · 2 Submitted · 3 Pay · 4 Proof · 5 Done */
export const stepFieldMap = [
  [
    "senderCountryCode",
    "recipientCountryCode",
    "sendAmount",
    "sendCurrency",
  ],
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
