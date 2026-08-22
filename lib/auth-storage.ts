import type { AuthTokenResponse } from "@/types/auth";

const ACCESS_KEY = "journeyai_access_token";
const REFRESH_KEY = "journeyai_refresh_token";

export function saveTokens(tokens: AuthTokenResponse): void {
  localStorage.setItem(ACCESS_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function isAuthStorageKey(key: string | null): boolean {
  return key === ACCESS_KEY || key === REFRESH_KEY;
}
