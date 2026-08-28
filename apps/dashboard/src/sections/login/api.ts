import type { LoginPayload, LoginResponse } from "@repo/types";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { request } from "@/utils/request";

export function login(payload: LoginPayload) {
  return request<LoginResponse>({
    endpoint: API_ENDPOINTS.auth.login(),
    method: "POST",
    body: payload,
  });
}
