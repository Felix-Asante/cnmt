"use server";

import "server-only";

import { getTranslations } from "next-intl/server";
import type { Transfer } from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";

type TrackTransferResult =
  | { ok: true; transfer: Transfer }
  | { ok: false; error: string };

function readErrorMessage(error: unknown, fallback: string) {
  if (
    error !== null &&
    typeof error === "object" &&
    "error" in error &&
    typeof error.error === "string" &&
    error.error.trim()
  ) {
    return error.error;
  }

  return fallback;
}

export async function getTransferByReference(
  reference: string,
): Promise<TrackTransferResult> {
  const t = await getTranslations("Track.errors");
  const trimmed = reference.trim();
  if (!trimmed) {
    return { ok: false, error: t("empty") };
  }

  try {
    const transfer = await request<Transfer>({
      endpoint: API_ENDPOINTS.transfers.getByReference(trimmed),
      method: "GET",
      cache: "no-store",
    });

    return { ok: true, transfer };
  } catch (error) {
    return { ok: false, error: readErrorMessage(error, t("notFound")) };
  }
}
