"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, LogOut, User } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";

export function SiteHeader() {
  const { status, user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Việt Khám Phá
        </Link>

        <div className="flex items-center gap-3">
          {status === "loading" && (
            <span className="flex items-center gap-2 text-sm text-slate-500" role="status">
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              <span className="sr-only">Đang kiểm tra phiên đăng nhập</span>
            </span>
          )}

          {status === "unauthenticated" && (
            <Link href="/dang-nhap" className={buttonVariants({ size: "sm" })}>
              Đăng nhập
            </Link>
          )}

          {status === "authenticated" && user && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-sm text-slate-600">
                <User className="h-4 w-4" />
                Tài khoản
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  <LogOut className="mr-1.5 h-4 w-4" />
                )}
                {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
