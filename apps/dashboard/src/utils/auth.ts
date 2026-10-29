import type { AuthUser } from "@repo/types";

const STORAGE_KEY = "cn_connect_auth";

type StoredAuth = {
  accessToken: string;
  user: AuthUser;
};

function decodeJwtPayload(token: string): { exp?: unknown } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2 || !parts[1]) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    return JSON.parse(atob(padded)) as { exp?: unknown };
  } catch {
    return null;
  }
}

function isAccessTokenExpired(token: string) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 <= Date.now();
}

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

    if (isAccessTokenExpired(parsed.accessToken)) {
      localStorage.removeItem(STORAGE_KEY);
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
  if (isAccessTokenExpired(accessToken)) {
    clearAuth();
    return;
  }

  const auth: StoredAuth = { accessToken, user };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}
