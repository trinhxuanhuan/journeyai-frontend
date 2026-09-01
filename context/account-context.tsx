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

import { useAuth } from "@/context/auth-context";
import {
  getAccountOverview,
  getAccountRequestErrorMessage,
  isCanceledAccountRequest,
  updateAccountIdentity,
  updateAccountProfile,
  type AccountIdentity,
  type AccountOverview,
  type AccountProfile,
  type UpdateAccountIdentityInput,
  type UpdateAccountProfileInput,
} from "@/lib/account";

type AccountState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: AccountOverview };

type AccountResult =
  | { requestKey: string; status: "error"; message: string }
  | { requestKey: string; status: "success"; data: AccountOverview };

interface AccountContextValue {
  state: AccountState;
  reload: () => void;
  saveIdentity: (input: UpdateAccountIdentityInput) => Promise<AccountIdentity>;
  saveProfile: (input: UpdateAccountProfileInput) => Promise<AccountProfile>;
}

const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountProvider({ children }: { children: ReactNode }) {
  const { status: authStatus } = useAuth();
  const [result, setResult] = useState<AccountResult | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = authStatus === "authenticated" ? `account:${reloadKey}` : null;
  const state = useMemo<AccountState>(() => requestKey === null
    ? { status: "idle" }
    : result?.requestKey === requestKey
      ? result
      : { status: "loading" }, [requestKey, result]);

  useEffect(() => {
    if (!requestKey) return;

    const controller = new AbortController();

    getAccountOverview(controller.signal)
      .then((data) => setResult({ requestKey, status: "success", data }))
      .catch((error: unknown) => {
        if (!isCanceledAccountRequest(error)) {
          setResult({
            requestKey,
            status: "error",
            message: getAccountRequestErrorMessage(error),
          });
        }
      });

    return () => controller.abort();
  }, [requestKey]);

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  const saveIdentity = useCallback(async (input: UpdateAccountIdentityInput) => {
    const identity = await updateAccountIdentity(input);
    setResult((current) => current?.status === "success"
      ? { ...current, data: { ...current.data, identity } }
      : current
    );
    return identity;
  }, []);

  const saveProfile = useCallback(async (input: UpdateAccountProfileInput) => {
    const profile = await updateAccountProfile(input);
    setResult((current) => current?.status === "success"
      ? { ...current, data: { ...current.data, profile } }
      : current
    );
    return profile;
  }, []);

  const value = useMemo(
    () => ({ state, reload, saveIdentity, saveProfile }),
    [state, reload, saveIdentity, saveProfile]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): AccountContextValue {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount() phải được gọi bên trong <AccountProvider>");
  }
  return context;
}
