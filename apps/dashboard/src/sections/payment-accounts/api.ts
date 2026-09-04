import type {
  CreatePaymentAccountPayload,
  PaymentAccount,
  UpdatePaymentAccountPayload,
} from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";
import { listCountries, getCountry } from "@/sections/countries/api";
import type { PaymentAccountsSearch } from "./search";

export function listPaymentAccounts(search: PaymentAccountsSearch = {}) {
  return request<PaymentAccount[]>({
    endpoint: API_ENDPOINTS.paymentAccounts.list({
      country_id: search.country,
      payment_method: search.method,
      is_active: search.active,
    }),
  });
}

export function createPaymentAccount(body: CreatePaymentAccountPayload) {
  return request<PaymentAccount>({
    endpoint: API_ENDPOINTS.paymentAccounts.create(),
    method: "POST",
    body,
  });
}

export function updatePaymentAccount(
  id: string,
  body: UpdatePaymentAccountPayload,
) {
  return request<PaymentAccount>({
    endpoint: API_ENDPOINTS.paymentAccounts.update(id),
    method: "PATCH",
    body,
  });
}

export function deletePaymentAccount(id: string) {
  return request<null>({
    endpoint: API_ENDPOINTS.paymentAccounts.remove(id),
    method: "DELETE",
  });
}

export function activatePaymentAccount(id: string) {
  return request<PaymentAccount>({
    endpoint: API_ENDPOINTS.paymentAccounts.activate(id),
    method: "POST",
  });
}

export function deactivatePaymentAccount(id: string) {
  return request<PaymentAccount>({
    endpoint: API_ENDPOINTS.paymentAccounts.deactivate(id),
    method: "POST",
  });
}

export async function loadPaymentAccountsPage(search: PaymentAccountsSearch) {
  const [countries, accounts] = await Promise.all([
    listCountries(),
    listPaymentAccounts(search),
  ]);

  return {
    countries,
    accounts,
    countryId: search.country ?? null,
  };
}

export function loadCountryChannels(countryId: string | number) {
  return getCountry(countryId);
}
