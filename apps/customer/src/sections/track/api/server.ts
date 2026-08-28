"use server";

import "server-only";

import type { Transfer } from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";

type TrackTransferResult =
  | { ok: true; transfer: Transfer }
  | { ok: false; error: string };

function readErrorMessage(error: unknown) {
  if (
    error !== null &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "string" &&
    error.error.trim()
  ) {
    return error.error;
  }

  return "Unable to find that transfer. Check the reference and try again.";
}

export async function getTransferByReference(
  reference: string,
): Promise<TrackTransferResult> {
  const trimmed = reference.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter your transfer reference." };
  }

  try {
    const transfer = await request<Transfer>({
      endpoint: API_ENDPOINTS.transfers.getByReference(trimmed),
      method: "GET",
      cache: "no-store",
    });

    return { ok: true, transfer };
  } catch (error) {
    return { ok: false, error: readErrorMessage(error) };
  }
}
