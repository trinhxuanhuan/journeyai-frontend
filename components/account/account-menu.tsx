"use client";

import {
  Bell,
  ChevronDown,
  ClipboardList,
  Loader2,
  LogOut,
  Route,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { AccountAvatar } from "@/components/account/account-avatar";
import { useAccount } from "@/context/account-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

const menuLinks = [
  { href: "/tai-khoan", label: "Hồ sơ của tôi", icon: UserRound },
  { href: "/bookings", label: "Đơn đặt tour", icon: ClipboardList },
  { href: "/hanh-trinh", label: "Hành trình AI", icon: Route },
  { href: "/thong-bao", label: "Trung tâm thông báo", icon: Bell },
] as const;

export function AccountMenu() {
  const { logout } = useAuth();
  const { state } = useAccount();
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const account = state.status === "success" ? state.data : null;

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const openWithKeyboard = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setOpen(true);
    window.setTimeout(() => {
      containerRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
    });
  };

  const moveMenuFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;

    const items = Array.from(
      containerRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']:not([disabled])") ?? []
    );
    if (items.length === 0) return;

    event.preventDefault();
    const currentIndex = event.target instanceof HTMLElement ? items.indexOf(event.target) : -1;
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : event.key === "ArrowUp"
          ? (currentIndex <= 0 ? items.length - 1 : currentIndex - 1)
          : (currentIndex + 1) % items.length;
    items[nextIndex]?.focus();
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      setOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="account-menu"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={openWithKeyboard}
        className={cn(
          "flex h-10 items-center gap-2 rounded-xl border px-1.5 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:pr-2.5",
          open
            ? "border-sky-200 bg-sky-50 text-primary"
            : "border-transparent bg-sky-50 text-slate-700 hover:border-sky-200 hover:text-primary"
        )}
        aria-label="Mở menu tài khoản"
      >
        <AccountAvatar
          fullName={account?.identity.fullName}
          email={account?.identity.email}
          avatarUrl={account?.profile.avatarUrl}
          className="h-7 w-7 text-[0.62rem]"
        />
        <span className="hidden max-w-28 truncate text-sm font-semibold sm:block">
          {account?.identity.fullName ?? "Tài khoản"}
        </span>
        <ChevronDown
          className={cn("hidden h-3.5 w-3.5 transition-transform sm:block", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          id="account-menu"
          role="menu"
          aria-label="Menu tài khoản"
          onKeyDown={moveMenuFocus}
          className="absolute top-[calc(100%+0.75rem)] right-0 z-60 w-[min(19rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.16)] animate-in fade-in zoom-in-95 duration-150 motion-reduce:animate-none"
        >
          <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#eff8ff,#ffffff)] px-4 py-4">
            <div className="flex items-center gap-3">
              <AccountAvatar
                fullName={account?.identity.fullName}
                email={account?.identity.email}
                avatarUrl={account?.profile.avatarUrl}
                className="h-11 w-11 text-xs shadow-sm"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-950">
                  {account?.identity.fullName ?? "Thành viên Việt Khám Phá"}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {account?.identity.email ?? "Hồ sơ cá nhân của bạn"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-2">
            {menuLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-sky-50 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-slate-100 p-2">
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-600 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-red-500 disabled:opacity-60"
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : (
                <LogOut className="h-4 w-4" aria-hidden="true" />
              )}
              {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
