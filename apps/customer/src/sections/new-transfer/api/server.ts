import "server-only";

import { request } from "@/utils/request";
import { API_ENDPOINTS } from "@/constants/endpoints";
import type { TransferOptions } from "@repo/types";
import { getTransferOptionsTag } from "@/utils/cache";

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
