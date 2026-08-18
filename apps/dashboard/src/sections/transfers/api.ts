import type {
  Transfer,
  TransferAdminActionResponse,
  TransferListResponse,
} from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";
import { TRANSFER_PAGE_SIZE, type TransfersSearch } from "./search";

export function listTransfers(search: TransfersSearch) {
  return request<TransferListResponse>({
    endpoint: API_ENDPOINTS.transfers.list({
      page: search.page ?? 1,
      limit: TRANSFER_PAGE_SIZE,
      status: search.status,
      reference: search.reference,
      sender_phone: search.sender_phone,
      recipient_phone: search.recipient_phone,
    }),
  });
}

export function getTransfer(reference: string) {
  return request<Transfer>({
    endpoint: API_ENDPOINTS.transfers.getByReference(reference),
  });
}

export function verifyPayment(id: string) {
  return request<TransferAdminActionResponse>({
    endpoint: API_ENDPOINTS.transfers.verifyPayment(id),
    method: "POST",
  });
}

export function rejectPayment(id: string, reason: string) {
  return request<TransferAdminActionResponse>({
    endpoint: API_ENDPOINTS.transfers.rejectPayment(id),
    method: "POST",
    body: { reason },
  });
}

export function processTransfer(id: string) {
  return request<TransferAdminActionResponse>({
    endpoint: API_ENDPOINTS.transfers.process(id),
    method: "POST",
  });
}

export function completeTransfer(id: string) {
  return request<TransferAdminActionResponse>({
    endpoint: API_ENDPOINTS.transfers.complete(id),
    method: "POST",
  });
}

export function cancelTransfer(id: string, reason: string) {
  return request<TransferAdminActionResponse>({
    endpoint: API_ENDPOINTS.transfers.cancel(id),
    method: "POST",
    body: { reason },
  });
}
