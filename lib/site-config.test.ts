import { describe, expect, it } from "vitest";

import { resolveSiteUrl } from "@/lib/site-config";

describe("resolveSiteUrl", () => {
  it("uses localhost when the deployment URL is missing", () => {
    expect(resolveSiteUrl("").toString()).toBe("http://localhost:3000/");
  });

  it("keeps a valid HTTPS origin and removes path data", () => {
    expect(
      resolveSiteUrl("https://vietkhampha.vn/preview?source=cv#top").toString()
    ).toBe("https://vietkhampha.vn/");
  });

  it("falls back safely for unsupported or malformed URLs", () => {
    expect(resolveSiteUrl("javascript:alert(1)").toString()).toBe(
      "http://localhost:3000/"
    );
    expect(resolveSiteUrl("not-a-url").toString()).toBe(
      "http://localhost:3000/"
    );
  });
});
