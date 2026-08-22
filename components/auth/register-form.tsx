"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, getApiErrorMessage } from "@/lib/api";
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth";
import type { RegisterResponse } from "@/types/auth";

export function RegisterForm({
  onRegistered,
}: {
  onRegistered: (userId: string, email: string, otpExpiresAt: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      const res = await api.post<RegisterResponse>("/v1/auth/register", values);
      toast.success("Đăng ký thành công! Vui lòng nhập mã OTP.");
      onRegistered(res.data.userId, values.email, res.data.otpExpiresAt);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit(onSubmit)}
      initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
      className="space-y-6"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="register-fullname">Họ và tên</Label>
        <Input
          id="register-fullname"
          placeholder="Nguyễn Văn A"
          autoComplete="name"
          disabled={loading}
          aria-invalid={Boolean(errors.fullName)}
          aria-describedby={errors.fullName ? "register-fullname-error" : undefined}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p id="register-fullname-error" className="text-sm text-red-600" role="alert">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="ban@email.com"
          autoComplete="email"
          disabled={loading}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="register-email-error" className="text-sm text-red-600" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Mật khẩu</Label>
        <div className="relative">
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="Tối thiểu 8 ký tự"
            autoComplete="new-password"
            disabled={loading}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "register-password-error" : undefined}
            className="pr-11"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            disabled={loading}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6f6b] disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="register-password-error" className="text-sm text-red-600" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="h-11 w-full rounded-xl bg-[#b5442e] font-semibold text-white shadow-[0_10px_24px_rgba(181,68,46,0.2)] hover:bg-[#9f3827] focus-visible:ring-[#b5442e]/35"
        size="lg"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
            Đang đăng ký...
          </>
        ) : (
          "Tạo tài khoản"
        )}
      </Button>

      <p className="text-center text-xs leading-5 text-slate-500">
        Chúng tôi chỉ sử dụng thông tin này để tạo và bảo vệ tài khoản của bạn.
      </p>
    </motion.form>
  );
}
