import type {
  AdminCountry,
  AdminCountryDetail,
  AdminPaymentChannel,
  CreateCountryPayload,
  UpdateCountryPayload,
  UpdatePaymentChannelPayload,
} from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";

export function listCountries() {
  return request<AdminCountry[]>({
    endpoint: API_ENDPOINTS.countries.list(),
  });
}

export function getCountry(id: string | number) {
  return request<AdminCountryDetail>({
    endpoint: API_ENDPOINTS.countries.get(id),
  });
}

export function createCountry(body: CreateCountryPayload) {
  return request<AdminCountry>({
    endpoint: API_ENDPOINTS.countries.create(),
    method: "POST",
    body,
  });
}

export function updateCountry(id: string | number, body: UpdateCountryPayload) {
  return request<AdminCountry>({
    endpoint: API_ENDPOINTS.countries.update(id),
    method: "PATCH",
    body,
  });
}

export function deleteCountry(id: string | number) {
  return request<null>({
    endpoint: API_ENDPOINTS.countries.remove(id),
    method: "DELETE",
  });
}

export function updatePaymentChannel(
  id: string,
  body: UpdatePaymentChannelPayload,
) {
  return request<AdminPaymentChannel>({
    endpoint: API_ENDPOINTS.paymentChannels.update(id),
    method: "PATCH",
    body,
  });
}

export function deletePaymentChannel(id: string) {
  return request<null>({
    endpoint: API_ENDPOINTS.paymentChannels.remove(id),
    method: "DELETE",
  });
}
