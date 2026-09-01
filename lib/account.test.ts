import { describe, expect, it } from "vitest";

import {
  getAccountInitials,
  getSafeAvatarUrl,
  parseAccountIdentity,
  parseAccountProfile,
} from "./account";

const userId = "8f277e7b-4ed4-4830-a98a-3974a784fe1c";

describe("account contract", () => {
  it("parses identity and normalizes profile preference codes", () => {
    const identity = parseAccountIdentity({
      userId,
      email: "khach@example.com",
      fullName: "Nguyễn Minh An",
      role: "CUSTOMER",
      status: "ACTIVE",
      createdAt: "2026-09-01T08:00:00Z",
      updatedAt: "2026-09-01T08:00:00Z",
    });
    const profile = parseAccountProfile({
      userId,
      phone: "0912345678",
      avatarUrl: "https://cdn.example.com/avatar.jpg",
      preferenceTags: [{ tagCode: "culture", weight: 0.8 }],
    });

    expect(identity.fullName).toBe("Nguyễn Minh An");
    expect(profile.preferenceTags).toEqual([{ tagCode: "CULTURE", weight: 0.8 }]);
  });

  it("rejects unsafe avatars, invalid phones and duplicate preferences", () => {
    const baseProfile = {
      userId,
      phone: "0912345678",
      avatarUrl: null,
      preferenceTags: [],
    };

    expect(() => parseAccountProfile({ ...baseProfile, phone: "123" })).toThrow();
    expect(() => parseAccountProfile({ ...baseProfile, avatarUrl: "http://example.com/a.jpg" })).toThrow();
    expect(() => parseAccountProfile({
      ...baseProfile,
      preferenceTags: [
        { tagCode: "FOOD", weight: 1 },
        { tagCode: "food", weight: 0.5 },
      ],
    })).toThrow();
  });

  it("accepts only credential-free HTTPS avatar URLs", () => {
    expect(getSafeAvatarUrl("https://cdn.example.com/avatar.jpg"))
      .toBe("https://cdn.example.com/avatar.jpg");
    expect(getSafeAvatarUrl("http://cdn.example.com/avatar.jpg")).toBeNull();
    expect(getSafeAvatarUrl("https://user:secret@cdn.example.com/avatar.jpg")).toBeNull();
    expect(getSafeAvatarUrl("javascript:alert(1)")).toBeNull();
  });

  it("creates stable Vietnamese initials with an email fallback", () => {
    expect(getAccountInitials("  Trịnh   Xuân Huấn  ", "khach@example.com")).toBe("TH");
    expect(getAccountInitials("An", "khach@example.com")).toBe("AN");
    expect(getAccountInitials(null, "khach@example.com")).toBe("KH");
  });
});
