import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Thư điện tử không được để trống")
    .email("Địa chỉ thư điện tử không đúng định dạng"),
  password: z.string().min(1, "Mật khẩu không được để trống"),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Họ tên không được để trống"),
  email: z
    .string()
    .trim()
    .min(1, "Thư điện tử không được để trống")
    .email("Địa chỉ thư điện tử không đúng định dạng"),
  password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
});

export const otpSchema = z.object({
  otpCode: z.string().length(6, "Mã OTP gồm 6 chữ số"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
