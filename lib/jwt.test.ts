import { describe, expect, it } from "vitest";

import { decodeAccessToken, isTokenExpired } from "./jwt";

function createUnsignedToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
    "base64url"
  );
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.test-signature`;
}

describe("decodeAccessToken", () => {
  it("decodes the customer identity claims used by the Gateway", () => {
    const token = createUnsignedToken({
      sub: "00000000-0000-0000-0000-000000000001",
      role: "CUSTOMER",
      exp: 2_000_000_000,
      iat: 1_999_999_100,
    });

    expect(decodeAccessToken(token)).toEqual({
      sub: "00000000-0000-0000-0000-000000000001",
      role: "CUSTOMER",
      exp: 2_000_000_000,
      iat: 1_999_999_100,
    });
  });

  it.each([
    "not-a-jwt",
    createUnsignedToken({ role: "CUSTOMER", exp: 2_000_000_000 }),
    createUnsignedToken({ sub: "user-1", role: "", exp: 2_000_000_000 }),
    createUnsignedToken({ sub: "user-1", role: "CUSTOMER", exp: "tomorrow" }),
  ])("rejects malformed or incomplete identity claims", (token) => {
    expect(decodeAccessToken(token)).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("treats a token inside the clock-skew window as expired", () => {
    const nowMilliseconds = 1_700_000_000_000;
    const claims = {
      sub: "user-1",
      role: "CUSTOMER",
      exp: nowMilliseconds / 1000 + 9,
    };

    expect(isTokenExpired(claims, 10, nowMilliseconds)).toBe(true);
  });

  it("keeps a token outside the clock-skew window usable", () => {
    const nowMilliseconds = 1_700_000_000_000;
    const claims = {
      sub: "user-1",
      role: "CUSTOMER",
      exp: nowMilliseconds / 1000 + 11,
    };

    expect(isTokenExpired(claims, 10, nowMilliseconds)).toBe(false);
  });
});
