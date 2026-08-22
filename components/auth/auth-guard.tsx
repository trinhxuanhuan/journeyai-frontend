"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { createLoginHref } from "@/lib/return-to";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      const currentLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      router.replace(createLoginHref(currentLocation));
    }
  }, [status, router, pathname]);

  if (status !== "authenticated") {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-[#786b61]"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="mr-2 h-5 w-5 animate-spin motion-reduce:animate-none" />
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  return <>{children}</>;
}
