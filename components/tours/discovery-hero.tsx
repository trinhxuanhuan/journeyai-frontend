"use client";

import Image from "next/image";
import { type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  CalendarCheck2,
  Compass,
  MapPin,
  Route,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TourTypeFilter } from "@/lib/tours";

const destinations = [
  { value: "", label: "Tất cả Việt Nam" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "Hà Giang", label: "Hà Giang" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
  { value: "Thừa Thiên Huế", label: "Huế" },
  { value: "Quảng Nam", label: "Hội An - Quảng Nam" },
  { value: "Kiên Giang", label: "Phú Quốc - Kiên Giang" },
] as const;

const tourTypes: ReadonlyArray<{ value: TourTypeFilter; label: string }> = [
  { value: "", label: "Tất cả hình thức" },
  { value: "GROUP", label: "Tour ghép trọn gói" },
  { value: "PRIVATE", label: "Tour riêng" },
];

const experiences = [
  { label: "Di sản", keyword: "di sản" },
  { label: "Biển đảo", keyword: "biển" },
  { label: "Núi rừng", keyword: "núi" },
  { label: "Ẩm thực", keyword: "ẩm thực" },
] as const;

type SearchValue = {
  q: string;
  destination: string;
  tourType: TourTypeFilter;
};

type DiscoveryHeroProps = {
  query: string;
  destination: string;
  tourType: TourTypeFilter;
  onSearch: (value: SearchValue) => void;
  onExplore: (keyword: string) => void;
};

export function DiscoveryHero({
  query,
  destination,
  tourType,
  onSearch,
  onExplore,
}: DiscoveryHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    onSearch({
      q: String(formData.get("q") ?? ""),
      destination: String(formData.get("destination") ?? ""),
      tourType: String(formData.get("tourType") ?? "") as TourTypeFilter,
    });
  };

  return (
    <section className="relative isolate overflow-hidden bg-[#042847] text-white">
      <Image
        src="/images/viet-kham-pha-hero-v1.png"
        alt="Non nước Việt Nam với núi đá vôi, sông xanh và mái đình bên bờ"
        fill
        loading="eager"
        sizes="100vw"
        className="hero-drift object-cover object-[64%_center]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,24,43,0.97)_0%,rgba(3,39,69,0.88)_36%,rgba(2,35,64,0.42)_68%,rgba(2,28,51,0.15)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(3,29,51,0.78)_0%,transparent_48%,rgba(2,23,42,0.18)_100%)]" />
      <div className="visual-noise pointer-events-none absolute inset-0 opacity-[0.08]" />

      <div className="relative mx-auto flex min-h-[650px] max-w-7xl flex-col justify-center px-5 py-16 sm:px-8 sm:py-20 lg:min-h-[690px]">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: "easeOut" }}
          className="max-w-[49rem]"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold tracking-[0.11em] text-sky-100 uppercase backdrop-blur-md">
            <Compass className="h-4 w-4 text-[#69ddca]" aria-hidden="true" />
            Hành trình đẹp bắt đầu từ Việt Nam
          </div>

          <h1 className="max-w-[47rem] text-[clamp(2.8rem,5.5vw,5.2rem)] leading-[0.98] font-bold tracking-[-0.06em] text-balance">
            Đi một Việt Nam,
            <span className="mt-2 block bg-[linear-gradient(90deg,#8ee8ff,#74f0d2)] bg-clip-text text-transparent">
              nhớ cả một hành trình.
            </span>
          </h1>

          <p className="mt-6 max-w-[39rem] text-base leading-7 text-sky-50/82 sm:text-lg sm:leading-8">
            Tìm tour nội địa, xem giá và lịch khởi hành còn chỗ trực tiếp từ hệ thống Việt Khám Phá.
          </p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.65, delay: shouldReduceMotion ? 0 : 0.16, ease: "easeOut" }}
          className="mt-9 max-w-[67rem] rounded-[1.6rem] border border-white/25 bg-white/96 p-2.5 text-slate-900 shadow-[0_28px_75px_rgba(2,18,32,0.36)] backdrop-blur-xl transition-transform duration-500 hover:-translate-y-0.5 sm:p-3"
        >
          <div className="mb-2.5 flex items-center gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Loại dịch vụ">
            <button
              type="button"
              className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-sky-50 px-3.5 text-sm font-bold text-primary"
              aria-current="page"
            >
              <Route className="h-4 w-4" aria-hidden="true" />
              Tour trong nước
            </button>
            <button
              type="button"
              disabled
              title="Tính năng đang được hoàn thiện"
              className="flex h-10 shrink-0 cursor-not-allowed items-center gap-2 rounded-xl px-3.5 text-sm font-semibold text-slate-400"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Lịch trình AI
              <span className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-[0.62rem] font-bold uppercase min-[430px]:inline">
                Sắp ra mắt
              </span>
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-2 lg:grid-cols-[0.84fr_0.94fr_1.3fr_auto]"
            role="search"
          >
            <label className="group relative block rounded-xl border border-slate-200 bg-white px-4 py-2.5 focus-within:border-primary focus-within:ring-4 focus-within:ring-sky-100">
              <span className="flex items-center gap-1.5 text-[0.68rem] font-bold tracking-[0.08em] text-slate-500 uppercase">
                <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Điểm đến
              </span>
              <select
                key={destination}
                name="destination"
                defaultValue={destination}
                className="mt-1 w-full appearance-none bg-transparent pr-6 text-[0.95rem] font-semibold text-slate-900 outline-none"
                aria-label="Chọn điểm đến"
              >
                {destinations.map((item) => (
                  <option key={item.value || "all"} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="group relative block rounded-xl border border-slate-200 bg-white px-4 py-2.5 focus-within:border-primary focus-within:ring-4 focus-within:ring-sky-100">
              <span className="flex items-center gap-1.5 text-[0.68rem] font-bold tracking-[0.08em] text-slate-500 uppercase">
                <Route className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Hình thức
              </span>
              <select
                key={tourType}
                name="tourType"
                defaultValue={tourType}
                className="mt-1 w-full appearance-none bg-transparent pr-6 text-[0.95rem] font-semibold text-slate-900 outline-none"
                aria-label="Chọn hình thức tour"
              >
                {tourTypes.map((item) => (
                  <option key={item.value || "all"} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="group relative block rounded-xl border border-slate-200 bg-white px-4 py-2.5 focus-within:border-primary focus-within:ring-4 focus-within:ring-sky-100">
              <span className="flex items-center gap-1.5 text-[0.68rem] font-bold tracking-[0.08em] text-slate-500 uppercase">
                <Search className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                Bạn muốn trải nghiệm gì?
              </span>
              <Input
                id="tour-search"
                key={query}
                name="q"
                defaultValue={query}
                maxLength={100}
                placeholder="Ví dụ: phố cổ, biển, ẩm thực..."
                className="mt-0.5 h-7 border-0 bg-transparent px-0 text-[0.95rem] font-semibold text-slate-900 shadow-none placeholder:font-normal placeholder:text-slate-400 focus-visible:ring-0"
              />
            </label>

            <Button
              type="submit"
              className="h-full min-h-14 rounded-xl bg-[#ef5b3e] px-7 text-base font-bold text-white shadow-[0_12px_28px_rgba(239,91,62,0.3)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#da462b] hover:shadow-[0_16px_34px_rgba(239,91,62,0.38)] active:translate-y-0"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              Tìm tour
            </Button>
          </form>
        </motion.div>

        <div className="mt-5 flex max-w-[67rem] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold text-white/65">Gợi ý:</span>
            {experiences.map(({ label, keyword }) => (
              <button
                key={label}
                type="button"
                onClick={() => onExplore(keyword)}
                className="rounded-full border border-white/20 bg-[#062e50]/55 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-[#79e5d1] hover:bg-[#0b416e] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="hidden items-center gap-4 text-xs font-semibold text-white/75 md:flex">
            <span className="inline-flex items-center gap-1.5"><CalendarCheck2 className="h-4 w-4 text-[#72e4cf]" /> Lịch khởi hành thật</span>
            <span className="h-4 w-px bg-white/20" />
            <span>Giá hiển thị rõ ràng</span>
          </div>
        </div>

        <a
          href="#destinations"
          className="mt-10 inline-flex w-fit items-center gap-2 text-xs font-bold tracking-[0.12em] text-white/70 uppercase transition hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Khám phá theo điểm đến
          <ArrowDown className="h-4 w-4 animate-bounce" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
