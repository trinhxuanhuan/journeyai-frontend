"use client";

import { CircleAlert, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { BrandMark } from "@/components/brand/brand-mark";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Lỗi giao diện chưa được xử lý", error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f8fc] px-5 py-14 text-center" role="alert">
      <div className="surface-grid pointer-events-none absolute inset-0 opacity-70" />
      <section className="relative w-full max-w-2xl rounded-[2rem] border border-red-100 bg-white px-6 py-10 shadow-[0_24px_70px_rgba(15,73,110,0.12)] sm:px-12 sm:py-14" aria-labelledby="error-heading">
        <div className="mx-auto flex w-fit items-center gap-3">
          <BrandMark className="h-11 w-11 rounded-2xl" />
          <strong className="text-base text-slate-950">Việt Khám Phá</strong>
        </div>
        <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <CircleAlert className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold tracking-[0.18em] text-red-600 uppercase">Hành trình vừa bị gián đoạn</p>
        <h1 id="error-heading" className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Chúng tôi chưa thể mở trang này</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">Đây có thể là lỗi tạm thời. Hãy thử tải lại nội dung; nếu vẫn gặp lỗi, bạn có thể quay về trang chủ mà không mất thông tin tài khoản.</p>
        {error.digest && (
          <p className="mt-3 text-xs text-slate-400">Mã đối chiếu: {error.digest}</p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={() => retry()} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(11,116,209,0.22)] transition hover:-translate-y-0.5 hover:bg-[#075fae] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Thử tải lại
          </button>
          <Link href="/" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary">
            <Home className="h-4 w-4" aria-hidden="true" />
            Về trang chủ
          </Link>
        </div>
      </section>
    </main>
  );
}
