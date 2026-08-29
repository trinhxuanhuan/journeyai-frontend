"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck2, MapPinned, ShieldCheck } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";

const proofPoints = [
  { icon: MapPinned, label: "Tour nội địa chọn lọc" },
  { icon: CalendarCheck2, label: "Lịch khởi hành trực tiếp" },
  { icon: ShieldCheck, label: "Thông tin rõ ràng" },
] as const;

export function AuthHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <aside
      className="relative hidden min-h-screen overflow-hidden bg-[#042847] text-white lg:block"
      aria-label="Cảm hứng khám phá Việt Nam"
    >
      <Image
        src="/images/viet-kham-pha-hero-v1.png"
        alt="Non nước Việt Nam trong buổi sớm xanh trong"
        fill
        loading="eager"
        sizes="58vw"
        className="hero-drift object-cover object-[62%_center]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,26,47,0.36),rgba(2,28,51,0.28)_40%,rgba(2,23,42,0.94))]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,25,45,0.3),transparent_65%)]" />
      <div className="visual-noise pointer-events-none absolute inset-0 opacity-[0.07]" />

      <div className="relative z-10 flex min-h-screen flex-col justify-between px-10 py-10 xl:px-14 xl:py-12">
        <div className="flex items-center gap-3">
          <BrandMark />
          <div>
            <p className="text-lg font-bold tracking-[-0.025em]">Việt Khám Phá</p>
            <p className="mt-1 text-[0.62rem] font-bold tracking-[0.18em] text-sky-200 uppercase">
              Hành trình đẹp từ Việt Nam
            </p>
          </div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.7 }}
          className="mb-4 max-w-2xl"
        >
          <p className="text-xs font-bold tracking-[0.16em] text-[#79e5d1] uppercase">Bắt đầu từ một lần đăng nhập</p>
          <h2 className="mt-4 max-w-xl text-5xl leading-[1.02] font-bold tracking-[-0.055em] xl:text-6xl">
            Giữ lại những chuyến đi bạn muốn nhớ.
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-sky-50/80">
            Một tài khoản để khám phá tour, theo dõi hành trình và tiếp tục trải nghiệm Việt Nam theo cách của riêng bạn.
          </p>

          <div className="mt-8 grid gap-2.5 xl:grid-cols-3">
            {proofPoints.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/8 px-3 py-3 text-xs font-semibold text-white/85 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/14">
                <Icon className="h-4 w-4 shrink-0 text-[#79e5d1]" aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </motion.div>

        <p className="border-t border-white/12 pt-5 text-xs text-white/48">
          © {new Date().getFullYear()} Việt Khám Phá · Thiết kế và phát triển tại Việt Nam
        </p>
      </div>
    </aside>
  );
}
