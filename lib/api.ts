import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

import {
  getAuthenticatedUser,
  InvalidAuthSessionError,
} from "@/lib/auth-session";
import { translateErrorMessage } from "@/lib/error-messages";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "@/lib/auth-storage";
import { emitAuthLogout } from "@/lib/auth-events";
import { createSingleFlight } from "@/lib/single-flight";
import type { AuthTokenResponse } from "@/types/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

const refreshClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const NO_REFRESH_PATHS = [
  "/v1/auth/login",
  "/v1/auth/register",
  "/v1/auth/verify-otp",
  "/v1/auth/resend-otp",
  "/v1/auth/refresh",
  "/v1/auth/logout",
  "/v1/auth/logout-all",
];

function shouldSkipRefresh(url?: string): boolean {
  if (!url) return false;
  const path = url.split("?")[0];
  return NO_REFRESH_PATHS.some((p) => path === p || path.endsWith(p));
}

function invalidateLocalSession(): void {
  const hadSession = Boolean(getAccessToken() || getRefreshToken());
  clearTokens();
  if (hadSession) emitAuthLogout();
}

function isRejectedSession(error: unknown): boolean {
  return (
    error instanceof InvalidAuthSessionError ||
    (axios.isAxiosError(error) && error.response?.status === 401)
  );
}

const runRefresh = createSingleFlight(async (): Promise<AuthTokenResponse> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new InvalidAuthSessionError("Không có mã làm mới phiên đăng nhập");
  }

  const response = await refreshClient.post<AuthTokenResponse>(
    "/v1/auth/refresh",
    { refreshToken }
  );
  getAuthenticatedUser(response.data);
  saveTokens(response.data);
  return response.data;
});

export async function refreshAccessToken(): Promise<AuthTokenResponse> {
  try {
    return await runRefresh();
  } catch (error) {
    if (isRejectedSession(error)) invalidateLocalSession();
    throw error;
  }
}

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    const isUnauthorized = error.response?.status === 401;
    const canRetry = originalRequest && !originalRequest._retry;
    const eligibleForRefresh = !shouldSkipRefresh(originalRequest?.url);

    if (isUnauthorized && canRetry && eligibleForRefresh) {
      originalRequest._retry = true;

      try {
        const newTokens = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization =
          `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { error?: string; message?: string }
      | undefined;
    if (data?.message) return translateErrorMessage(data.message);
    if (!err.response) {
      return "Không thể kết nối tới hệ thống. Vui lòng kiểm tra mạng và thử lại.";
    }
  }
  return "Đã có lỗi xảy ra, vui lòng thử lại.";
}
