"use client";

import Link from "next/link";
import { ClipboardList, Loader2, Sparkles } from "lucide-react";

import { AccountMenu } from "@/components/account/account-menu";
import { BrandMark } from "@/components/brand/brand-mark";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/#tour-results", label: "Tour đang mở" },
  { href: "/#destinations", label: "Điểm đến" },
  { href: "/#why-us", label: "Vì sao chọn chúng tôi" },
] as const;

export function SiteHeader() {
  const { status, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-9">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            aria-label="Việt Khám Phá — về trang chủ"
          >
            <BrandMark className="transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-[1.03]" />
            <span className="min-w-0">
              <span className="block text-[1.05rem] leading-none font-bold tracking-[-0.025em] text-slate-950">
                Việt Khám Phá
              </span>
              <span className="mt-1.5 hidden text-[0.58rem] font-bold tracking-[0.2em] text-slate-500 uppercase sm:block">
                Hành trình đẹp từ Việt Nam
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Điều hướng chính">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md text-sm font-semibold text-slate-600 transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            href="/lap-lich-trinh"
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-sky-100 bg-sky-50 px-3 text-sm font-bold text-primary transition hover:border-sky-200 hover:bg-sky-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Lập lịch trình tự túc bằng AI"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span className="hidden xl:inline">Lập lịch AI</span>
          </Link>

          {status === "loading" && (
            <span className="flex h-9 items-center gap-2 px-2 text-sm text-slate-500" role="status">
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              <span className="sr-only">Đang kiểm tra phiên đăng nhập</span>
            </span>
          )}

          {status === "unauthenticated" && (
            <Link
              href="/dang-nhap"
              className={cn(
                buttonVariants({ size: "sm" }),
                "h-10 rounded-xl bg-primary px-4 font-semibold text-white shadow-[0_8px_22px_rgba(11,116,209,0.22)] hover:bg-[#075fae]"
              )}
            >
              Đăng nhập
            </Link>
          )}

          {status === "authenticated" && user && (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Link
                href="/bookings"
                className="hidden h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-sky-50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:inline-flex"
                aria-label="Xem đơn đặt tour của tôi"
              >
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                <span className="hidden xl:inline">Đơn của tôi</span>
              </Link>
              <AccountMenu />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
