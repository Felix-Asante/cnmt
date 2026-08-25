import type { DashboardResponse } from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";
import type { DashboardSearch } from "./search";

export function getDashboard(search: DashboardSearch) {
  return request<DashboardResponse>({
    endpoint: API_ENDPOINTS.dashboard.get({
      from: search.from,
      to: search.to,
    }),
  });
}
