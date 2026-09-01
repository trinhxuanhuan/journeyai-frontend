import { z } from "zod";

import { getSafeAvatarUrl } from "@/lib/account";

export const accountIdentityFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được vượt quá 100 ký tự"),
});

export const accountProfileFormSchema = z.object({
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^0\d{9}$/.test(value),
      "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0"
    ),
  avatarUrl: z
    .string()
    .trim()
    .max(2048, "URL ảnh đại diện không được vượt quá 2048 ký tự")
    .refine(
      (value) => value === "" || getSafeAvatarUrl(value) !== null,
      "Ảnh đại diện phải là URL HTTPS hợp lệ"
    ),
  preferenceCodes: z
    .array(z.string())
    .max(12, "Bạn chỉ được chọn tối đa 12 sở thích"),
});

export type AccountIdentityFormValues = z.infer<typeof accountIdentityFormSchema>;
export type AccountProfileFormValues = z.infer<typeof accountProfileFormSchema>;
