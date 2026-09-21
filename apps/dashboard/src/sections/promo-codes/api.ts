import type {
  CreatePromoCodePayload,
  PromoCode,
  UpdatePromoCodePayload,
} from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";

export function listPromoCodes() {
  return request<PromoCode[]>({
    endpoint: API_ENDPOINTS.promoCodes.list(),
  });
}

export function createPromoCode(body: CreatePromoCodePayload) {
  return request<PromoCode>({
    endpoint: API_ENDPOINTS.promoCodes.create(),
    method: "POST",
    body,
  });
}

export function updatePromoCode(id: string, body: UpdatePromoCodePayload) {
  return request<PromoCode>({
    endpoint: API_ENDPOINTS.promoCodes.update(id),
    method: "PATCH",
    body,
  });
}

export function deletePromoCode(id: string) {
  return request<null>({
    endpoint: API_ENDPOINTS.promoCodes.remove(id),
    method: "DELETE",
  });
}

export function loadPromoCodesPage() {
  return listPromoCodes().then((promoCodes) => ({ promoCodes }));
}
