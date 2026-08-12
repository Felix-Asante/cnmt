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
