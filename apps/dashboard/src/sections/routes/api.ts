import type {
  CreateRoutePayload,
  TransferRoute,
  UpdateRoutePayload,
} from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";
import { listCountries } from "@/sections/countries/api";
import type { RoutesSearch } from "./search";

export function listRoutes(search: RoutesSearch) {
  return request<TransferRoute[]>({
    endpoint: API_ENDPOINTS.routes.list({
      source_country_id: search.source,
      dest_country_id: search.dest,
      is_active: search.active,
    }),
  });
}

export function createRoute(body: CreateRoutePayload) {
  return request<TransferRoute>({
    endpoint: API_ENDPOINTS.routes.create(),
    method: "POST",
    body,
  });
}

export function updateRoute(id: string, body: UpdateRoutePayload) {
  return request<TransferRoute>({
    endpoint: API_ENDPOINTS.routes.update(id),
    method: "PATCH",
    body,
  });
}

export function deleteRoute(id: string) {
  return request<null>({
    endpoint: API_ENDPOINTS.routes.remove(id),
    method: "DELETE",
  });
}

export function toggleRouteActive(id: string) {
  return request<TransferRoute>({
    endpoint: API_ENDPOINTS.routes.toggleActive(id),
    method: "POST",
  });
}

export async function loadRoutesPage(search: RoutesSearch) {
  const [routes, countries] = await Promise.all([
    listRoutes(search),
    listCountries(),
  ]);
  return { routes, countries };
}
