import axios from "axios";
import { z } from "zod";

import { api, getApiErrorMessage } from "@/lib/api";

const ACCOUNT_REQUEST_TIMEOUT_MS = 10_000;

const instantSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Expected an ISO-8601 instant"
);

const identitySchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string().trim().min(2).max(100),
  role: z.string().trim().min(1).max(50),
  status: z.string().trim().min(1).max(50),
  createdAt: instantSchema,
  updatedAt: instantSchema,
});

const preferenceTagSchema = z.object({
  tagCode: z
    .string()
    .trim()
    .regex(/^[A-Za-z][A-Za-z0-9_]{1,49}$/)
    .transform((value) => value.toUpperCase()),
  weight: z.number().min(0).max(1),
});

const nullablePhoneSchema = z
  .string()
  .regex(/^0\d{9}$/)
  .nullable();

const nullableAvatarSchema = z
  .string()
  .max(2048)
  .refine((value) => getSafeAvatarUrl(value) !== null, "Expected a safe HTTPS avatar URL")
  .nullable();

const profileSchema = z
  .object({
    userId: z.string().uuid(),
    phone: nullablePhoneSchema,
    avatarUrl: nullableAvatarSchema,
    preferenceTags: z.array(preferenceTagSchema).max(12),
  })
  .superRefine((profile, context) => {
    const tagCodes = profile.preferenceTags.map((item) => item.tagCode);
    if (new Set(tagCodes).size !== tagCodes.length) {
      context.addIssue({
        code: "custom",
        message: "Preference tag codes must be unique",
        path: ["preferenceTags"],
      });
    }
  });

export type AccountIdentity = z.infer<typeof identitySchema>;
export type AccountPreferenceTag = z.infer<typeof preferenceTagSchema>;
export type AccountProfile = z.infer<typeof profileSchema>;

export interface AccountOverview {
  identity: AccountIdentity;
  profile: AccountProfile;
}

export interface UpdateAccountIdentityInput {
  fullName: string;
}

export interface UpdateAccountProfileInput {
  phone: string;
  avatarUrl: string;
  preferenceTags: AccountPreferenceTag[];
}

export const ACCOUNT_PREFERENCE_OPTIONS = [
  { code: "CULTURE", label: "Văn hóa bản địa" },
  { code: "HISTORY", label: "Lịch sử & di sản" },
  { code: "FOOD", label: "Ẩm thực vùng miền" },
  { code: "NATURE", label: "Thiên nhiên" },
  { code: "MOUNTAIN", label: "Núi & cao nguyên" },
  { code: "BEACH", label: "Biển & hải đảo" },
  { code: "ADVENTURE", label: "Khám phá mạo hiểm" },
  { code: "RELAX", label: "Nghỉ dưỡng" },
  { code: "FAMILY", label: "Gia đình" },
  { code: "PHOTOGRAPHY", label: "Nhiếp ảnh" },
  { code: "FESTIVAL", label: "Lễ hội" },
  { code: "CRAFT_VILLAGE", label: "Làng nghề" },
] as const;

export function parseAccountIdentity(value: unknown): AccountIdentity {
  return identitySchema.parse(value);
}

export function parseAccountProfile(value: unknown): AccountProfile {
  return profileSchema.parse(value);
}

export async function getAccountOverview(signal?: AbortSignal): Promise<AccountOverview> {
  const [identityResponse, profileResponse] = await Promise.all([
    api.get("/v1/auth/me", { signal, timeout: ACCOUNT_REQUEST_TIMEOUT_MS }),
    api.get("/v1/users/me", { signal, timeout: ACCOUNT_REQUEST_TIMEOUT_MS }),
  ]);
  const identity = parseAccountIdentity(identityResponse.data);
  const profile = parseAccountProfile(profileResponse.data);

  if (identity.userId !== profile.userId) {
    throw new Error("ACCOUNT_IDENTITY_MISMATCH");
  }

  return { identity, profile };
}

export async function updateAccountIdentity(
  input: UpdateAccountIdentityInput
): Promise<AccountIdentity> {
  const response = await api.patch(
    "/v1/auth/me",
    { fullName: input.fullName },
    { timeout: ACCOUNT_REQUEST_TIMEOUT_MS }
  );
  return parseAccountIdentity(response.data);
}

export async function updateAccountProfile(
  input: UpdateAccountProfileInput
): Promise<AccountProfile> {
  const response = await api.patch(
    "/v1/users/me",
    input,
    { timeout: ACCOUNT_REQUEST_TIMEOUT_MS }
  );
  return parseAccountProfile(response.data);
}

export function getSafeAvatarUrl(value: string | null | undefined): string | null {
  if (!value || value.length > 2048) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function getAccountInitials(fullName: string | null | undefined, email?: string): string {
  const normalizedName = fullName?.trim().replace(/\s+/g, " ");
  if (normalizedName) {
    const parts = normalizedName.split(" ");
    const initials = parts.length === 1
      ? parts[0].slice(0, 2)
      : `${parts[0][0]}${parts.at(-1)?.[0] ?? ""}`;
    return initials.toLocaleUpperCase("vi-VN");
  }

  return (email?.trim().slice(0, 2) || "VK").toLocaleUpperCase("vi-VN");
}

export function getAccountRequestErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError || (error instanceof Error && error.message === "ACCOUNT_IDENTITY_MISMATCH")) {
    return "Dữ liệu tài khoản từ hệ thống chưa đồng nhất. Vui lòng thử lại sau.";
  }
  return getApiErrorMessage(error);
}

export function isCanceledAccountRequest(error: unknown): boolean {
  return axios.isCancel(error);
}
