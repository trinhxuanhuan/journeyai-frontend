"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { onNotificationCount } from "@/lib/notification-events";
import { getUnreadNotificationCount } from "@/lib/notifications";

const REFRESH_INTERVAL_MS = 60_000;

export function NotificationBell() {
  const { status, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      setUnreadCount(await getUnreadNotificationCount(signal));
    } catch {
      // The bell remains usable even when the badge cannot be refreshed.
    }
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !user) return;

    const controller = new AbortController();
    const refreshOnFocus = () => void refresh(controller.signal);
    const initialRefresh = window.setTimeout(refreshOnFocus, 0);
    const interval = window.setInterval(refreshOnFocus, REFRESH_INTERVAL_MS);
    window.addEventListener("focus", refreshOnFocus);
    const unsubscribe = onNotificationCount(setUnreadCount);

    return () => {
      controller.abort();
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
      unsubscribe();
    };
  }, [refresh, status, user]);

  if (status !== "authenticated" || !user) return null;

  const visibleUnreadCount = status === "authenticated" && user ? unreadCount : 0;
  const badgeLabel = visibleUnreadCount > 99 ? "99+" : String(visibleUnreadCount);
  const accessibleLabel = visibleUnreadCount > 0
    ? `Thông báo, ${visibleUnreadCount} chưa đọc`
    : "Thông báo";

  return (
    <Link
      href="/thong-bao"
      aria-label={accessibleLabel}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-sky-50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <Bell className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
      {visibleUnreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-[#e84f35] px-1 text-[0.62rem] leading-none font-bold text-white"
          aria-hidden="true"
        >
          {badgeLabel}
        </span>
      )}
    </Link>
  );
}
