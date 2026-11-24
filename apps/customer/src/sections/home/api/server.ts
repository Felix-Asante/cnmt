import "server-only";
import type { TransferOptions } from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";

const EMPTY: TransferOptions = { sources: [], destinations: [] };

/**
 * Corridors, rates and fees for the hero calculator. Cached for 5 minutes so
 * the home page stays static and fast while rates stay current.
 */
export async function getHomeTransferOptions(): Promise<TransferOptions> {
  try {
    const options = await request<TransferOptions>({
      endpoint: API_ENDPOINTS.transfers.getTransferOptions(),
      method: "GET",
      next: { revalidate: 300 },
    });
    return options ?? EMPTY;
  } catch (error) {
    console.error("Error fetching home transfer options:", error);
    return EMPTY;
  }
}
