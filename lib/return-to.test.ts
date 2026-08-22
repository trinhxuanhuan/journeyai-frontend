import { describe, expect, it } from "vitest";

import { createLoginHref, sanitizeReturnTo } from "./return-to";

describe("sanitizeReturnTo", () => {
  it("preserves an internal path, query string and fragment", () => {
    expect(sanitizeReturnTo("/dat-cho?slot=abc%20123#participants")).toBe(
      "/dat-cho?slot=abc%20123#participants"
    );
  });

  it.each([
    "https://attacker.example/steal",
    "//attacker.example/steal",
    "/\\attacker.example/steal",
    "javascript:alert(1)",
    "/tour\u0000/secret",
  ])("rejects an external or ambiguous redirect target", (returnTo) => {
    expect(sanitizeReturnTo(returnTo)).toBe("/");
  });

  it("prevents an authenticated user from looping back to the auth page", () => {
    expect(sanitizeReturnTo("/dang-nhap?returnTo=%2Fdat-cho")).toBe("/");
    expect(sanitizeReturnTo("/dang-nhap/optional-segment")).toBe("/");
  });
});

describe("createLoginHref", () => {
  it("encodes the complete protected location as a single query value", () => {
    expect(createLoginHref("/dat-cho?slot=abc#participants")).toBe(
      "/dang-nhap?returnTo=%2Fdat-cho%3Fslot%3Dabc%23participants"
    );
  });
});
