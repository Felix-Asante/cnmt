"use server";
import "server-only";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/constants/endpoints";
import type { PaymentAccount, TransferOptions } from "@repo/types";
import { getTransferOptionsTag } from "@/utils/cache";
import {
  transferRequestPayloadSchema,
  type TransferRequestValues,
} from "../schema";
import {
  isAllowedMimeType,
  normalizeMimeType,
  PAYMENT_PROOF_UPLOAD,
} from "@repo/utils/file";
import { isE164, toE164 } from "@/utils/phone";
import { isUuid } from "@/utils/id";
import { cleanDeep } from "@/utils/clean-deep";

type CreateTransferResponse = {
  transfer_id: string;
  reference: string;
  expires_in: number;
};

type CreateUploadPaymentProofSignedUrlResponse = {
  signed_url: string;
  key: string;
  content_type: string;
};

export const getTransferOptions = async () => {
  try {
    const response = await request<TransferOptions>({
      endpoint: API_ENDPOINTS.transfers.getTransferOptions(),
      method: "GET",
      next: {
        tags: [getTransferOptionsTag()],
      },
    });
    return response;
  } catch (error) {
    console.error("Error fetching transfer options:", error);
    return { sources: [], destinations: [] };
  }
};

export async function getPaymentAccounts(countryId: string | number) {
  const id = Number(countryId);
  if (!Number.isInteger(id) || id <= 0) {
    return [] as PaymentAccount[];
  }

  try {
    return await request<PaymentAccount[]>({
      endpoint: API_ENDPOINTS.paymentAccounts.listByCountry(id),
      method: "GET",
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error fetching payment accounts:", error);
    return [] as PaymentAccount[];
  }
}

export const createTransfer = async (
  transferData: TransferRequestValues,
  idempotencyKey: string,
) => {
  try {
    if (!isUuid(idempotencyKey)) {
      throw new Error("Invalid idempotency key");
    }

    const parsed = transferRequestPayloadSchema.safeParse(transferData);
    if (!parsed.success) {
      throw new Error("Invalid transfer data");
    }

    const data = parsed.data;
    const sourceCountryId = Number(data.senderCountryCode);
    const destinationCountryId = Number(data.recipientCountryCode);
    if (
      !Number.isInteger(sourceCountryId) ||
      sourceCountryId <= 0 ||
      !Number.isInteger(destinationCountryId) ||
      destinationCountryId <= 0
    ) {
      throw new Error("Invalid transfer data");
    }

    const senderPhone = toE164(data.senderWhatsApp);
    if (!isE164(senderPhone)) {
      throw new Error("Invalid transfer data");
    }

    const isBank = data.receivingMethod === "bank";
    const recipientPhone = data.recipientPhone
      ? toE164(data.recipientPhone)
      : "";

    if (isBank) {
      if (!data.bank || !isUuid(data.bank)) {
        throw new Error("Invalid transfer data");
      }
    } else {
      if (!data.network || !isUuid(data.network)) {
        throw new Error("Invalid transfer data");
      }
      if (!isE164(recipientPhone)) {
        throw new Error("Invalid transfer data");
      }
    }

    const payload = {
      source_country_id: sourceCountryId,
      destination_country_id: destinationCountryId,
      amount_sent: data.sendAmount,
      sender_phone: senderPhone,
      recipient: {
        recipient_name: isBank
          ? data.bankAccountName.trim()
          : data.recipientName.trim(),
        receiving_method: isBank ? "BANK" : "MOBILE_MONEY",
        bank_id: isBank ? data.bank : undefined,
        account_number: isBank ? data.bankAccountNumber : undefined,
        receiving_network_id: isBank ? undefined : data.network,
        recipient_phone: isBank ? undefined : recipientPhone,
      },
      notes: data.note || undefined,
    };

    return await request<CreateTransferResponse>({
      endpoint: API_ENDPOINTS.transfers.create(),
      method: "POST",
      body: cleanDeep(payload),
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
  } catch (error) {
    console.error("Error creating transfer:", error);
    return null;
  }
};

export const createUploadPaymentProofSignedUrl = async (
  reference: string,
  contentType: string,
) => {
  try {
    const type = normalizeMimeType(contentType);
    if (
      !reference.trim() ||
      !isAllowedMimeType(type, PAYMENT_PROOF_UPLOAD.accept)
    ) {
      throw new Error("Invalid proof upload request");
    }

    return await request<CreateUploadPaymentProofSignedUrlResponse>({
      endpoint: API_ENDPOINTS.transfers.createUploadPaymentProofSignedUrl(),
      method: "POST",
      body: { reference: reference.trim(), content_type: type },
    });
  } catch (error) {
    console.error("Error creating upload payment proof signed url:", error);
    return null;
  }
};

export const confirmPaymentProofUploaded = async (
  reference: string,
  key: string,
) => {
  try {
    if (!reference.trim() || !key.trim()) {
      throw new Error("Invalid proof confirmation");
    }

    await request({
      endpoint: API_ENDPOINTS.transfers.confirmPaymentProofUploaded(),
      method: "PATCH",
      body: { reference: reference.trim(), key },
    });
    return true;
  } catch (error) {
    console.error("Error confirming payment proof uploaded:", error);
    return false;
  }
};
