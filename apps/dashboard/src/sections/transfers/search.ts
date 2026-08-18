import { TRANSFER_STATUSES, type TransferStatus } from "@repo/types";

export const TRANSFER_PAGE_SIZE = 20;

export type TransfersSearch = {
  page?: number;
  status?: TransferStatus;
  reference?: string;
  sender_phone?: string;
  recipient_phone?: string;
};

function optionalString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function optionalStatus(value: unknown): TransferStatus | undefined {
  if (typeof value !== "string") return undefined;
  return TRANSFER_STATUSES.includes(value as TransferStatus)
    ? (value as TransferStatus)
    : undefined;
}

export function parseTransfersSearch(
  search: Record<string, unknown>,
): TransfersSearch {
  const page = Number(search.page);

  return compactTransfersSearch({
    page: Number.isInteger(page) && page > 0 ? page : undefined,
    status: optionalStatus(search.status),
    reference: optionalString(search.reference),
    sender_phone: optionalString(search.sender_phone),
    recipient_phone: optionalString(search.recipient_phone),
  });
}

export function compactTransfersSearch(
  search: TransfersSearch,
): TransfersSearch {
  return {
    ...(search.page && search.page > 1 ? { page: search.page } : {}),
    ...(search.status ? { status: search.status } : {}),
    ...(search.reference ? { reference: search.reference } : {}),
    ...(search.sender_phone ? { sender_phone: search.sender_phone } : {}),
    ...(search.recipient_phone
      ? { recipient_phone: search.recipient_phone }
      : {}),
  };
}

export function hasTransferFilters(search: TransfersSearch) {
  return Boolean(
    search.status ||
      search.reference ||
      search.sender_phone ||
      search.recipient_phone,
  );
}
