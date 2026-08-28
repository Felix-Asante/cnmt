import type { AuthUser } from "@repo/types";

const STORAGE_KEY = "cn_connect_auth";

type StoredAuth = {
  accessToken: string;
  user: AuthUser;
};

function readStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (
      typeof parsed.accessToken !== "string" ||
      !parsed.accessToken ||
      !parsed.user ||
      typeof parsed.user.email !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return readStoredAuth()?.accessToken ?? null;
}

export function getAuthUser() {
  return readStoredAuth()?.user ?? null;
}

export function isAuthenticated() {
  return getAccessToken() !== null;
}

export function setAuth(accessToken: string, user: AuthUser) {
  const auth: StoredAuth = { accessToken, user };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}
