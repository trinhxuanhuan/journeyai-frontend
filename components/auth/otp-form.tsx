"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Loader2, MailCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { api, getApiErrorMessage } from "@/lib/api";
import { otpSchema } from "@/lib/validations/auth";
import type { AuthTokenResponse, ResendOtpResponse } from "@/types/auth";

function formatOtpExpiry(value: string): string | null {
  const expiresAt = new Date(value);
  if (Number.isNaN(expiresAt.getTime())) return null;

  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(expiresAt);
}

function getSecondsUntil(value: string, now: number | null): number | null {
  if (now === null) return null;
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.ceil((target - now) / 1_000));
}

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function OtpForm({
  userId,
  email,
  otpExpiresAt,
  otpResendAvailableAt,
  onBack,
  onSuccess,
}: {
  userId: string;
  email: string;
  otpExpiresAt: string;
  otpResendAvailableAt: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [otpCode, setOtpCode] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [currentOtpExpiresAt, setCurrentOtpExpiresAt] = useState(otpExpiresAt);
  const [resendAvailableAt, setResendAvailableAt] = useState(otpResendAvailableAt);
  const [now, setNow] = useState<number | null>(null);
  const { login } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const expiryLabel = useMemo(
    () => formatOtpExpiry(currentOtpExpiresAt),
    [currentOtpExpiresAt]
  );
  const resendSeconds = getSecondsUntil(resendAvailableAt, now);
  const busy = verifying || resending;

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const intervalId = window.setInterval(tick, 1_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const handleChange = (value: string) => {
    setOtpCode(value.replace(/\D/g, "").slice(0, 6));
    if (validationError) setValidationError(null);
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;

    const result = otpSchema.safeParse({ otpCode });
    if (!result.success) {
      setValidationError(
        result.error.issues[0]?.message ?? "Mã xác thực không hợp lệ"
      );
      return;
    }

    setVerifying(true);
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
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (busy || resendSeconds === null || resendSeconds > 0) return;

    setResending(true);
    setValidationError(null);
    try {
      const response = await api.post<ResendOtpResponse>("/v1/auth/resend-otp", {
        userId,
      });
      setCurrentOtpExpiresAt(response.data.otpExpiresAt);
      setResendAvailableAt(response.data.otpResendAvailableAt);
      setNow(Date.now());
      setOtpCode("");
      toast.success("Mã xác thực mới đã được gửi. Mã cũ không còn hiệu lực.");
    } catch (error) {
      const message = getApiErrorMessage(error);
      setValidationError(message);
      toast.error(message);
    } finally {
      setResending(false);
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
        disabled={busy}
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
            disabled={busy}
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
          disabled={busy}
        >
          {verifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
              Đang xác thực...
            </>
          ) : (
            "Xác thực và tiếp tục"
          )}
        </Button>
      </form>

      <div className="rounded-xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-center">
        <p className="text-xs leading-5 text-slate-600" aria-live="polite">
          {resendSeconds === null
            ? "Đang kiểm tra thời gian gửi lại mã..."
            : resendSeconds > 0
              ? `Bạn có thể yêu cầu mã mới sau ${formatCountdown(resendSeconds)}.`
              : "Bạn chưa nhận được thư? Hãy yêu cầu một mã xác thực mới."}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={busy || resendSeconds === null || resendSeconds > 0}
          className="mt-1 min-h-10 font-bold text-primary hover:bg-sky-100 hover:text-[#075fae]"
        >
          {resending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />
              Đang gửi mã mới...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Gửi lại mã xác thực
            </>
          )}
        </Button>
      </div>

      <p className="text-center text-xs leading-5 text-zinc-500">
        Mỗi mã chỉ sử dụng được một lần. Hệ thống giới hạn số lần gửi để bảo vệ tài khoản của bạn.
      </p>
    </motion.div>
  );
}
