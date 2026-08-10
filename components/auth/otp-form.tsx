"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api, getApiErrorMessage } from "@/lib/api";
import { saveTokens } from "@/lib/auth-storage";
import type { AuthTokenResponse } from "@/types/auth";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export function OtpForm({
  userId,
  email,
  onBack,
  onSuccess,
}: {
  userId: string;
  email: string;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // chỉ cho phép số
    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== "") && next.join("").length === OTP_LENGTH) {
      handleVerify(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setDigits(pasted.split(""));
      handleVerify(pasted);
    }
  };

  const handleVerify = async (otpCode: string) => {
    setLoading(true);
    try {
      const res = await api.post<AuthTokenResponse>("/v1/auth/verify-otp", {
        userId,
        otpCode,
      });
      saveTokens(res.data);
      toast.success("Xác thực thành công! Chào mừng bạn đến với JourneyAI.");
      onSuccess();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
      setDigits(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Backend hiện chưa có endpoint resend riêng — để sẵn UI, nối logic khi có API
    toast.info("Chức năng gửi lại mã sẽ sớm được hỗ trợ.");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <MailCheck className="h-6 w-6 text-slate-700" />
        </div>
        <h3 className="text-lg font-semibold">Xác thực email</h3>
        <p className="text-sm text-slate-500">
          Mã gồm 6 chữ số đã được gửi tới <br />
          <span className="font-medium text-slate-800">{email}</span>
        </p>
      </div>

      <div className="flex justify-center gap-2">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputRefs.current[i] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={loading}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className="h-14 w-12 rounded-lg border border-slate-300 text-center text-xl font-semibold outline-none transition focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 disabled:opacity-50"
          />
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang xác thực...
        </div>
      )}

      <div className="text-center text-sm text-slate-500">
        Không nhận được mã?{" "}
        {cooldown > 0 ? (
          <span className="text-slate-400">Gửi lại sau {cooldown}s</span>
        ) : (
          <button onClick={handleResend} className="font-medium text-slate-800 underline underline-offset-2">
            Gửi lại mã
          </button>
        )}
      </div>
    </motion.div>
  );
}