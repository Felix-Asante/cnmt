import type {
  CreatePromoCodePayload,
  PromoCode,
  UpdatePromoCodePayload,
} from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";
import { listCountries } from "@/sections/countries/api";
import { listRoutes } from "@/sections/routes/api";

export type RouteOption = { id: string; label: string };

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

export async function loadPromoCodesPage() {
  const [promoCodes, routes, countries] = await Promise.all([
    listPromoCodes(),
    listRoutes({}),
    listCountries(),
  ]);
  const countryName = new Map(countries.map((c) => [c.id, c.name]));
  const routeOptions: RouteOption[] = routes.map((route) => ({
    id: route.id,
    label: `${countryName.get(route.source_country_id) ?? "?"} → ${countryName.get(route.destination_country_id) ?? "?"}`,
  }));
  return { promoCodes, routeOptions };
}
