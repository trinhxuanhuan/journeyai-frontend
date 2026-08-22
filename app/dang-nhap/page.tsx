"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Compass, Loader2 } from "lucide-react";

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
    };

function AuthPageFallback() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#faf6f0] text-[#6f6258]"
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
      <div className="grid min-h-screen font-sans lg:grid-cols-[minmax(0,1.15fr)_minmax(27rem,0.85fr)]">
        <AuthHero />

        <div className="relative flex items-center justify-center overflow-hidden bg-[#f7f2eb] px-5 py-8 sm:px-8 lg:px-12 xl:px-16">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full border border-[#2b241e]/5" />
          <div className="absolute -bottom-52 -left-52 h-[30rem] w-[30rem] rounded-full bg-[#1f6f6b]/5 blur-3xl" />
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
            className="relative z-10 w-full max-w-[27rem]"
          >
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2b241e] text-[#fffaf3]">
                <Compass className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold tracking-[-0.02em] text-[#2b241e]">
                  Việt Khám Phá
                </p>
                <p className="text-[0.62rem] tracking-[0.2em] text-[#786b61] uppercase">
                  Đi để hiểu hơn
                </p>
              </div>
            </div>

            <Card className="rounded-[1.75rem] border-[#2b241e]/8 bg-white/95 p-7 shadow-[0_28px_80px_rgba(55,42,31,0.11)] backdrop-blur-sm sm:p-9">
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
                      onBack={() => setStep({ mode: "register" })}
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
                      <p className="mb-2 text-[0.68rem] font-semibold tracking-[0.18em] text-[#b5442e] uppercase">
                        Tài khoản hành trình
                      </p>
                      <h1 className="text-[1.85rem] leading-tight font-semibold tracking-[-0.035em] text-[#2b241e]">
                        {step.mode === "login"
                          ? "Chào mừng trở lại"
                          : "Tạo tài khoản mới"}
                      </h1>
                      <p className="mt-2 text-[0.95rem] leading-6 text-[#786b61]">
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
                      <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-[#f0e9e1] p-1">
                        <TabsTrigger
                          value="login"
                          className="rounded-lg text-[#75675d] data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:text-[#2b241e] data-[state=active]:shadow-sm"
                        >
                          Đăng nhập
                        </TabsTrigger>
                        <TabsTrigger
                          value="register"
                          className="rounded-lg text-[#75675d] data-[state=active]:bg-white data-[state=active]:font-semibold data-[state=active]:text-[#2b241e] data-[state=active]:shadow-sm"
                        >
                          Đăng ký
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <AnimatePresence mode="wait" initial={!shouldReduceMotion}>
                      {step.mode === "login" ? (
                        <LoginForm key="login-form" onSuccess={handleSuccess} />
                      ) : (
                        <RegisterForm
                          key="register-form"
                          onRegistered={(userId, email, otpExpiresAt) =>
                            setStep({
                              mode: "otp",
                              userId,
                              email,
                              otpExpiresAt,
                            })
                          }
                        />
                      )}
                    </AnimatePresence>

                    <p className="mt-5 w-full text-center text-sm text-[#786b61]">
                      {step.mode === "login" ? (
                        <>
                          Chưa có tài khoản?{" "}
                          <button
                            type="button"
                            onClick={() => setStep({ mode: "register" })}
                            className="font-medium text-[#2b241e] underline underline-offset-4 hover:text-[#b5442e]"
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
                            className="font-medium text-[#2b241e] underline underline-offset-4 hover:text-[#b5442e]"
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
