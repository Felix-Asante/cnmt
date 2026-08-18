import type { AdminCountry } from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";

export function listCountries() {
  return request<AdminCountry[]>({
    endpoint: API_ENDPOINTS.countries.list(),
  });
}
