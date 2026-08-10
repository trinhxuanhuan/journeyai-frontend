"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthHero } from "@/components/auth/auth-hero";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { OtpForm } from "@/components/auth/otp-form";

type AuthStep =
  | { mode: "login" }
  | { mode: "register" }
  | { mode: "otp"; userId: string; email: string };

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>({ mode: "login" });

  const handleSuccess = () => {
    router.push("/");
  };

  return (
    <div className="grid min-h-screen font-sans lg:grid-cols-2">
      <AuthHero />

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12 lg:bg-white">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <Card className="border-slate-200/80 p-10 shadow-sm">
            <AnimatePresence mode="wait">
              {step.mode === "otp" ? (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <OtpForm
                    userId={step.userId}
                    email={step.email}
                    onBack={() => setStep({ mode: "register" })}
                    onSuccess={handleSuccess}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="tabs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="mb-6 text-center">
                    <h1 className="text-3xl font-semibold text-slate-900">
                      {step.mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
                    </h1>
                    <p className="mt-1.5 text-base text-slate-500">
                      {step.mode === "login"
                        ? "Đăng nhập để tiếp tục hành trình của bạn"
                        : "Bắt đầu khám phá cùng Việt Khám Phá"}
                    </p>
                  </div>

                  <Tabs
                    value={step.mode}
                    onValueChange={(v) => setStep({ mode: v as "login" | "register" })}
                    className="mb-6"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Đăng nhập</TabsTrigger>
                      <TabsTrigger value="register">Đăng ký</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <AnimatePresence mode="wait">
                    {step.mode === "login" ? (
                      <LoginForm key="login-form" onSuccess={handleSuccess} />
                    ) : (
                      <RegisterForm
                        key="register-form"
                        onRegistered={(userId, email) =>
                          setStep({ mode: "otp", userId, email })
                        }
                      />
                    )}
                  </AnimatePresence>

                  <p className="mt-5 w-full text-center text-sm text-slate-500">
                    {step.mode === "login" ? (
                      <>
                        Chưa có tài khoản?{" "}
                        <button
                          onClick={() => setStep({ mode: "register" })}
                          className="font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700"
                        >
                          Đăng ký ngay
                        </button>
                      </>
                    ) : (
                      <>
                        Đã có tài khoản?{" "}
                        <button
                          onClick={() => setStep({ mode: "login" })}
                          className="font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700"
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
  );
}