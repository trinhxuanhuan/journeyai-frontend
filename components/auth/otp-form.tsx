"use client";

import { useMemo, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { api, getApiErrorMessage } from "@/lib/api";
import { otpSchema } from "@/lib/validations/auth";
import type { AuthTokenResponse } from "@/types/auth";

function formatOtpExpiry(value: string): string | null {
  const expiresAt = new Date(value);
  if (Number.isNaN(expiresAt.getTime())) return null;

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(expiresAt);
}

export function OtpForm({
  userId,
  email,
  otpExpiresAt,
  onBack,
  onSuccess,
}: {
  userId: string;
  email: string;
  otpExpiresAt: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [otpCode, setOtpCode] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const expiryLabel = useMemo(
    () => formatOtpExpiry(otpExpiresAt),
    [otpExpiresAt]
  );

  const handleChange = (value: string) => {
    setOtpCode(value.replace(/\D/g, "").slice(0, 6));
    if (validationError) setValidationError(null);
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;

    const result = otpSchema.safeParse({ otpCode });
    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message ?? "Mã xác thực không hợp lệ"
      );
      return;
    }

    setLoading(true);
    setValidationError(null);
    try {
      const response = await api.post<AuthTokenResponse>("/v1/auth/verify-otp", {
        userId,
        otpCode: result.data.otpCode,
      });
      login(response.data);
      toast.success("Xác thực thành công. Chào mừng bạn đến với Việt Khám Phá!");
      onSuccess();
    } catch (error) {
      const message = getApiErrorMessage(error);
      setValidationError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3 }}
      className="space-y-6"
    >
      <button
        type="button"
        onClick={onBack}
        disabled={loading}
        className="flex items-center gap-1 rounded-sm text-sm font-semibold text-slate-500 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-50"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Dùng thư điện tử khác
      </button>

      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900">Xác thực thư điện tử</h1>
        <p className="text-sm leading-6 text-zinc-500">
          Nhập mã 6 chữ số đã gửi tới
          <br />
          <strong className="font-medium text-zinc-900">{email}</strong>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="otp-code" className="font-semibold text-slate-700">Mã xác thực</Label>
          <Input
            id="otp-code"
            name="otpCode"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            value={otpCode}
            disabled={loading}
            onChange={(event) => handleChange(event.target.value)}
            autoFocus
            aria-invalid={Boolean(validationError)}
            aria-describedby={
              validationError ? "otp-code-error otp-code-help" : "otp-code-help"
            }
            className="h-14 rounded-xl border-slate-200 bg-slate-50 text-center text-xl font-semibold tracking-[0.55em] tabular-nums focus-visible:bg-white"
          />
          <p id="otp-code-help" className="text-xs leading-5 text-zinc-500">
            {expiryLabel
              ? `Mã có hiệu lực đến ${expiryLabel} (giờ Việt Nam).`
              : "Mã có hiệu lực trong 5 phút kể từ khi đăng ký."}
            {" "}
            Hãy kiểm tra cả thư mục thư rác nếu chưa thấy thư điện tử.
          </p>
          {validationError && (
            <p id="otp-code-error" className="text-sm text-red-600" role="alert">
              {validationError}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-primary font-bold text-white shadow-lg shadow-primary/20 hover:bg-[#075fae]"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
              Đang xác thực...
            </>
          ) : (
            "Xác thực và tiếp tục"
          )}
        </Button>
      </form>

      <p className="text-center text-xs leading-5 text-zinc-500">
        Mỗi mã chỉ sử dụng được một lần để bảo vệ tài khoản của bạn.
      </p>
    </motion.div>
  );
}
