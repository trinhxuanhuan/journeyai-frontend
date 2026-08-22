import { describe, expect, it } from "vitest";

import {
  getAuthenticatedUser,
  getUserFromUsableAccessToken,
  InvalidAuthSessionError,
} from "./auth-session";
import type { AuthTokenResponse } from "../types/auth";

function createUnsignedToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url"
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.test-signature`;
}

function createTokens(exp: number): AuthTokenResponse {
  return {
    accessToken: createUnsignedToken({ sub: "customer-1", role: "CUSTOMER", exp }),
    refreshToken: "opaque-refresh-token",
    expiresIn: 900,
  };
}

describe("getAuthenticatedUser", () => {
  it("creates UI identity only from a complete, usable token response", () => {
    const nowMilliseconds = 1_700_000_000_000;

    expect(getAuthenticatedUser(createTokens(1_700_000_900), nowMilliseconds)).toEqual({
      id: "customer-1",
      role: "CUSTOMER",
    });
  });

  it("rejects an expired access token", () => {
    const nowMilliseconds = 1_700_000_000_000;

    expect(() =>
      getAuthenticatedUser(createTokens(1_699_999_999), nowMilliseconds)
    ).toThrow(InvalidAuthSessionError);
  });

  it("rejects an incomplete refresh response before it can be persisted", () => {
    const nowMilliseconds = 1_700_000_000_000;
    const tokens = { ...createTokens(1_700_000_900), refreshToken: "" };

    expect(() => getAuthenticatedUser(tokens, nowMilliseconds)).toThrow(
      InvalidAuthSessionError
    );
  });

  it.each([null, undefined, "not-a-response", {}])(
    "rejects a non-object or structurally invalid response",
    (tokens) => {
      expect(() => getAuthenticatedUser(tokens)).toThrow(InvalidAuthSessionError);
    }
  );
});

describe("getUserFromUsableAccessToken", () => {
  it("returns null for malformed local storage data", () => {
    expect(getUserFromUsableAccessToken("corrupted-token")).toBeNull();
  });
});
