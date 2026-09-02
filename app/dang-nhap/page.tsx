"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthHero } from "@/components/auth/auth-hero";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { OtpForm } from "@/components/auth/otp-form";
import { GuestGuard } from "@/components/auth/guest-guard";
import { sanitizeReturnTo } from "@/lib/return-to";

type AuthStep =
  | { mode: "login" }
  | { mode: "register" }
  | {
      mode: "otp";
      userId: string;
      email: string;
      otpExpiresAt: string;
      otpResendAvailableAt: string;
      backTo: "login" | "register";
    };

function AuthPageFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="mr-2 h-5 w-5 animate-spin motion-reduce:animate-none" />
      Đang kiểm tra phiên đăng nhập...
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageFallback />}>
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<AuthStep>({ mode: "login" });
  const shouldReduceMotion = useReducedMotion();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));

  const handleSuccess = () => {
    router.replace(returnTo);
  };

  return (
    <GuestGuard returnTo={returnTo}>
      <div className="grid min-h-screen font-sans lg:grid-cols-[minmax(0,1.08fr)_minmax(29rem,0.92fr)]">
        <AuthHero />

        <div className="relative flex items-center justify-center overflow-hidden bg-[#f5fafe] px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full border border-sky-100" />
          <div className="absolute -bottom-52 -left-52 h-[30rem] w-[30rem] rounded-full bg-sky-300/15 blur-3xl" />
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
            className="relative z-10 w-full max-w-[28rem]"
          >
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <BrandMark className="h-10 w-10 rounded-xl" />
              <div>
                <p className="font-semibold tracking-[-0.02em] text-zinc-900">
                  Việt Khám Phá
                </p>
                <p className="text-[0.62rem] tracking-[0.2em] text-zinc-500 uppercase">
                  Đi để hiểu hơn
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="mb-4 inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-500 transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Về trang khám phá
            </Link>

            <Card className="rounded-[1.75rem] border-sky-100 bg-white/94 p-7 shadow-[0_24px_70px_rgba(14,76,118,0.13)] backdrop-blur-xl transition-shadow duration-500 hover:shadow-[0_30px_82px_rgba(14,76,118,0.18)] sm:p-9">
              <AnimatePresence mode="wait" initial={!shouldReduceMotion}>
                {step.mode === "otp" ? (
                  <motion.div
                    key="otp"
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  >
                    <OtpForm
                      userId={step.userId}
                      email={step.email}
                      otpExpiresAt={step.otpExpiresAt}
                      otpResendAvailableAt={step.otpResendAvailableAt}
                      onBack={() => setStep({ mode: step.backTo })}
                      onSuccess={handleSuccess}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="tabs"
                    initial={shouldReduceMotion ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                  >
                    <div className="mb-7 text-center">
                      <p className="mb-2 text-[0.68rem] font-bold tracking-[0.18em] text-primary uppercase">
                        Tài khoản hành trình
                      </p>
                      <h1 className="text-[1.95rem] leading-tight font-bold tracking-[-0.04em] text-slate-950">
                        {step.mode === "login"
                          ? "Chào mừng trở lại"
                          : "Tạo tài khoản mới"}
                      </h1>
                      <p className="mt-2 text-[0.95rem] leading-6 text-slate-500">
                        {step.mode === "login"
                          ? "Đăng nhập để tiếp tục hành trình của bạn"
                          : "Bắt đầu khám phá cùng Việt Khám Phá"}
                      </p>
                    </div>

                    <Tabs
                      value={step.mode}
                      onValueChange={(value) =>
                        setStep({ mode: value as "login" | "register" })
                      }
                      className="mb-6"
                    >
                      <TabsList className="grid h-12 w-full grid-cols-2 rounded-xl bg-sky-50 p-1">
                        <TabsTrigger
                          value="login"
                          className="rounded-lg text-slate-500 data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                          Đăng nhập
                        </TabsTrigger>
                        <TabsTrigger
                          value="register"
                          className="rounded-lg text-slate-500 data-[state=active]:bg-white data-[state=active]:font-bold data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                          Đăng ký
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <AnimatePresence mode="wait" initial={!shouldReduceMotion}>
                      {step.mode === "login" ? (
                        <LoginForm
                          key="login-form"
                          onSuccess={handleSuccess}
                          onVerificationRequired={(
                            userId,
                            email,
                            otpExpiresAt,
                            otpResendAvailableAt
                          ) =>
                            setStep({
                              mode: "otp",
                              userId,
                              email,
                              otpExpiresAt,
                              otpResendAvailableAt,
                              backTo: "login",
                            })
                          }
                        />
                      ) : (
                        <RegisterForm
                          key="register-form"
                          onRegistered={(
                            userId,
                            email,
                            otpExpiresAt,
                            otpResendAvailableAt
                          ) =>
                            setStep({
                              mode: "otp",
                              userId,
                              email,
                              otpExpiresAt,
                              otpResendAvailableAt,
                              backTo: "register",
                            })
                          }
                        />
                      )}
                    </AnimatePresence>

                    <p className="mt-5 w-full text-center text-sm text-zinc-500">
                      {step.mode === "login" ? (
                        <>
                          Chưa có tài khoản?{" "}
                          <button
                            type="button"
                            onClick={() => setStep({ mode: "register" })}
                            className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                          >
                            Đăng ký ngay
                          </button>
                        </>
                      ) : (
                        <>
                          Đã có tài khoản?{" "}
                          <button
                            type="button"
                            onClick={() => setStep({ mode: "login" })}
                            className="font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                          >
                            Đăng nhập
                          </button>
                        </>
                      )}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </div>
    </GuestGuard>
  );
}
