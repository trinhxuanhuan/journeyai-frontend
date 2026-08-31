import { Compass, Home, Search } from "lucide-react";
import Link from "next/link";

import { BrandMark } from "@/components/brand/brand-mark";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f8fc] px-5 py-14 text-center">
      <div className="surface-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-sky-300/20 blur-3xl" />
      <section className="relative w-full max-w-2xl rounded-[2rem] border border-sky-100 bg-white/95 px-6 py-10 shadow-[0_24px_70px_rgba(15,73,110,0.12)] sm:px-12 sm:py-14" aria-labelledby="not-found-heading">
        <div className="mx-auto flex w-fit items-center gap-3">
          <BrandMark className="h-11 w-11 rounded-2xl" />
          <span className="text-left">
            <strong className="block text-base text-slate-950">Việt Khám Phá</strong>
            <span className="block text-[0.62rem] font-bold tracking-[0.17em] text-primary uppercase">Hành trình đẹp từ Việt Nam</span>
          </span>
        </div>

        <div className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-primary">
          <Compass className="h-8 w-8" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold tracking-[0.18em] text-primary uppercase">Lạc khỏi hành trình · 404</p>
        <h1 id="not-found-heading" className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Trang này không còn trên bản đồ</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-500 sm:text-base">Liên kết có thể đã thay đổi hoặc nội dung không tồn tại. Bạn có thể quay về trang chủ và bắt đầu một hành trình khác.</p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-[0_10px_24px_rgba(11,116,209,0.22)] transition hover:-translate-y-0.5 hover:bg-[#075fae] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary">
            <Home className="h-4 w-4" aria-hidden="true" />
            Về trang chủ
          </Link>
          <Link href="/#tour-results" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-primary">
            <Search className="h-4 w-4" aria-hidden="true" />
            Xem tour đang mở
          </Link>
        </div>
      </section>
    </main>
  );
}
