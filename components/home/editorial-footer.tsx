import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";

export function EditorialFooter() {
  return (
    <footer className="overflow-hidden bg-[#041d33] text-white">
      <div className="mx-auto max-w-7xl px-5 pt-16 pb-8 sm:px-8 sm:pt-20">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(120deg,#0a64ad,#0788b8_58%,#0b9b8c)] px-6 py-9 shadow-2xl transition-shadow duration-500 hover:shadow-[0_28px_70px_rgba(8,145,178,0.24)] sm:px-9 lg:flex lg:items-center lg:justify-between lg:gap-12">
          <div className="pointer-events-none absolute -top-28 -right-20 h-64 w-64 rounded-full border border-white/15" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold tracking-[0.16em] text-cyan-100 uppercase">Việt Nam đang chờ bạn</p>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Biến một nơi muốn đến thành một hành trình đẹp.
            </h2>
          </div>
          <Link
            href="/#tour-results"
            className="relative mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-[#075fa8] shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white lg:mt-0"
          >
            Chọn tour ngay
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
              <BrandMark />
              <span>
                <span className="block text-lg font-bold">Việt Khám Phá</span>
                <span className="mt-1 block text-[0.62rem] font-bold tracking-[0.18em] text-sky-200 uppercase">Hành trình đẹp từ Việt Nam</span>
              </span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
              Nền tảng khám phá và đặt tour nội địa, đưa vẻ đẹp thiên nhiên và văn hóa Việt Nam đến gần hơn với mỗi người đi.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase">Khám phá</h3>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-slate-300">
              <li><Link href="/#tour-results" className="transition hover:text-white">Tour đang mở</Link></li>
              <li><Link href="/#destinations" className="transition hover:text-white">Điểm đến Việt Nam</Link></li>
              <li><Link href="/lap-lich-trinh" className="transition hover:text-white">Lập lịch trình bằng AI</Link></li>
              <li><Link href="/hanh-trinh" className="transition hover:text-white">Hành trình đã lưu</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase">Tài khoản</h3>
            <ul className="mt-5 space-y-3 text-sm font-semibold text-slate-300">
              <li><Link href="/dang-nhap" className="transition hover:text-white">Đăng nhập</Link></li>
              <li><Link href="/dang-nhap" className="transition hover:text-white">Tạo tài khoản</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Việt Khám Phá. Bảo lưu mọi quyền.</p>
          <p>Thiết kế và phát triển tại Việt Nam.</p>
        </div>
      </div>
    </footer>
  );
}
