"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/auth-context";

export function GuestGuard({
  children,
  returnTo,
}: {
  children: React.ReactNode;
  returnTo: string;
}) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(returnTo);
    }
  }, [status, router, returnTo]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#faf6f0] text-[#786b61]"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="mr-2 h-5 w-5 animate-spin motion-reduce:animate-none" />
        Đang mở hành trình của bạn...
      </div>
    );
  }

  return <>{children}</>;
}
