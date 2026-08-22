"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, refreshAccessToken } from "@/lib/api";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  isAuthStorageKey,
  saveTokens,
} from "@/lib/auth-storage";
import { onAuthLogout } from "@/lib/auth-events";
import {
  getAuthenticatedUser,
  getUserFromUsableAccessToken,
  type AuthUser,
} from "@/lib/auth-session";
import type { AuthTokenResponse } from "@/types/auth";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  login: (tokens: AuthTokenResponse) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const markUnauthenticated = useCallback(() => {
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  const login = useCallback((tokens: AuthTokenResponse) => {
    const authenticatedUser = getAuthenticatedUser(tokens);
    saveTokens(tokens);
    setUser(authenticatedUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();

    clearTokens();
    markUnauthenticated();

    if (refreshToken && accessToken) {
      try {
        await api.post(
          "/v1/auth/logout",
          { refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      } catch {
        // Local logout remains authoritative for the browser even if revocation
        // cannot reach the server. The short-lived access token expires there.
      }
    }
  }, [markUnauthenticated]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken || !refreshToken) {
        clearTokens();
        if (!cancelled) markUnauthenticated();
        return;
      }

      const authenticatedUser = getUserFromUsableAccessToken(accessToken);
      if (authenticatedUser) {
        if (!cancelled) {
          setUser(authenticatedUser);
          setStatus("authenticated");
        }
        return;
      }

      try {
        const newTokens = await refreshAccessToken();
        const refreshedUser = getAuthenticatedUser(newTokens);
        if (!cancelled) {
          setUser(refreshedUser);
          setStatus("authenticated");
        }
      } catch {
        if (!cancelled) markUnauthenticated();
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [markUnauthenticated]);

  useEffect(() => {
    return onAuthLogout(markUnauthenticated);
  }, [markUnauthenticated]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (
        event.storageArea === localStorage &&
        isAuthStorageKey(event.key) &&
        event.newValue === null
      ) {
        markUnauthenticated();
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [markUnauthenticated]);

  const value = useMemo(
    () => ({ status, user, login, logout }),
    [status, user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() phai duoc goi ben trong <AuthProvider>");
  }
  return ctx;
}
