"use server";
import "server-only";
import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/constants/endpoints";
import type { TransferOptions } from "@repo/types";
import { getTransferOptionsTag } from "@/utils/cache";
import { transferRequestSchema, type TransferFormValues } from "../schema";
import z from "zod";
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
        revalidate: 60 * 3, // 3min
      },
      cache: "force-cache",
    });
    return response;
  } catch (error) {
    console.error("Error fetching transfer options:", error);
    return { sources: [], destinations: [] };
  }
};

export const createTransfer = async (
  transferData: TransferFormValues,
  idempotencyKey: string,
) => {
  try {
    const res = z.safeParse(transferRequestSchema, transferData);
    if (!res.success) {
      console.error("Invalid transfer data:", res.error);
      throw new Error("Invalid transfer data");
    }

    const payload = {
      source_country_id: Number(transferData.senderCountryCode),
      destination_country_id: Number(transferData.recipientCountryCode),
      amount_sent: transferData.sendAmount,
      sender_phone: transferData.senderWhatsApp,
      recipient: {
        recipient_name: transferData.recipientName,
        receiving_method: transferData.receivingMethod?.toUpperCase(),
        bank_id: transferData.bank,
        account_number: transferData.bankAccountNumber,
        receiving_network_id: transferData.network,
        recipient_phone: transferData.recipientPhone,
      },
      notes: transferData.note,
    };
    const cleanPayload = cleanDeep(payload);

    const response = await request<CreateTransferResponse>({
      endpoint: API_ENDPOINTS.transfers.create(),
      method: "POST",
      body: cleanPayload,
      headers: {
        "Idempotency-Key": idempotencyKey,
      },
    });
    return response;
  } catch (error) {
    console.error("Error creating transfer:", error);
    return null;
  }
};

const createUploadPaymentProofSignedUrl = async (
  reference: string,
  contentType: string,
) => {
  try {
    const response = await request<CreateUploadPaymentProofSignedUrlResponse>({
      endpoint: API_ENDPOINTS.transfers.createUploadPaymentProofSignedUrl(),
      method: "POST",
      body: { reference, content_type: contentType },
    });
    return response;
  } catch (error) {
    console.error("Error creating upload payment proof signed url:", error);
    return null;
  }
};

const confirmPaymentProofUploaded = async (reference: string, key: string) => {
  try {
    const response = await request({
      endpoint: API_ENDPOINTS.transfers.confirmPaymentProofUploaded(),
      method: "PATCH",
      body: { reference, key },
    });
    console.log({ confirm_response: JSON.stringify(response, null, 2) });
    return true;
  } catch (error) {
    console.error("Error confirming payment proof uploaded:", error);
    return false;
  }
};

export const uploadPaymentProof = async (
  proofFile: File,
  reference: string,
  contentType: string,
) => {
  try {
    if (!proofFile || !reference) {
      throw new Error("Proof file and reference are required");
    }
    const response = await createUploadPaymentProofSignedUrl(
      reference,
      contentType,
    );
    if (!response) {
      throw new Error("Failed to upload proof");
    }
    console.log({ signed_response: JSON.stringify(response, null, 2) });
    const { signed_url, key, content_type } = response;
    const uploadResponse = await fetch(signed_url, {
      method: "PUT",
      body: proofFile,
      headers: {
        "Content-Type": content_type,
      },
    });
    console.log({ upload_response: JSON.stringify(uploadResponse, null, 2) });
    if (!uploadResponse.ok) {
      throw new Error("Failed to upload proof");
    }

    const confirmResponse = await confirmPaymentProofUploaded(reference, key);

    if (!confirmResponse) {
      throw new Error("Failed to upload proof");
    }
    return true;
  } catch (error) {
    console.error("Error uploading proof:", error);
    return null;
  }
};
