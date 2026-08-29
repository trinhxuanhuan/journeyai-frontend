"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Landmark, MountainSnow, Soup, Waves } from "lucide-react";

const destinations = [
  {
    name: "Hà Giang",
    queryValue: "Hà Giang",
    eyebrow: "Miền đá nở hoa",
    story: "Đèo cao, bản nhỏ và những mùa sắc màu trên cao nguyên.",
    icon: MountainSnow,
    image: "/images/destination-ha-giang-v1.webp",
    imagePosition: "center",
    wash: "bg-cyan-950/15",
    accent: "text-cyan-200",
  },
  {
    name: "Huế",
    queryValue: "Huế",
    eyebrow: "Nhịp chậm cố đô",
    story: "Di sản, ẩm thực và những lớp ký ức bên dòng Hương.",
    icon: Landmark,
    image: "/images/destination-hue-v1.webp",
    imagePosition: "center",
    wash: "bg-indigo-950/20",
    accent: "text-indigo-200",
  },
  {
    name: "Hội An",
    queryValue: "Hội An",
    eyebrow: "Phố kể chuyện",
    story: "Nếp nhà xưa, bến sông và một miền văn hóa luôn rộng mở.",
    icon: Soup,
    image: "/images/destination-hoi-an-v1.webp",
    imagePosition: "center",
    wash: "bg-orange-950/10",
    accent: "text-orange-100",
  },
  {
    name: "Phú Quốc",
    queryValue: "Phú Quốc",
    eyebrow: "Chạm miền biển xanh",
    story: "Ngày nắng trong, rừng xanh và nhịp sống của đảo ngọc.",
    icon: Waves,
    image: "/images/destination-phu-quoc-v1.webp",
    imagePosition: "center",
    wash: "bg-teal-950/15",
    accent: "text-emerald-100",
  },
] as const;

export function DestinationCards() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="destinations" className="relative scroll-mt-24 overflow-hidden bg-[linear-gradient(180deg,#ffffff,#f8fbfe)] py-16 sm:py-20">
      <div className="surface-grid pointer-events-none absolute inset-0 opacity-45" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Bốn hướng lên đường</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Mỗi điểm đến, một cách yêu Việt Nam
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-500 sm:text-right">
            Chọn một nơi để lọc trực tiếp những tour đang có trong hệ thống.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination, index) => {
            const Icon = destination.icon;
            const href = `/?destination=${encodeURIComponent(destination.queryValue)}#tour-results`;

            return (
              <motion.article
                key={destination.name}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.45, delay: index * 0.06 }}
                className="group relative isolate min-h-[24rem] overflow-hidden rounded-[1.5rem] bg-slate-900 text-white shadow-[0_18px_45px_rgba(15,23,42,0.14)] transition-shadow duration-500 hover:shadow-[0_28px_65px_rgba(15,73,110,0.24)]"
              >
                <Image
                  src={destination.image}
                  alt={`Khung cảnh ${destination.name}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.085]"
                  style={{ objectPosition: destination.imagePosition }}
                />
                <div className={`absolute inset-0 ${destination.wash} mix-blend-multiply`} />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,15,28,0.16)_0%,rgba(2,15,28,0.04)_38%,rgba(2,15,28,0.88)_100%)] transition duration-500 group-hover:bg-[linear-gradient(180deg,rgba(2,15,28,0.08)_0%,rgba(2,15,28,0.02)_38%,rgba(2,15,28,0.9)_100%)]" />
                <div className="absolute inset-0 ring-1 ring-inset ring-white/15" />
                <Link
                  href={href}
                  className="relative z-10 flex h-full min-h-[24rem] flex-col justify-between p-6 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white"
                  aria-label={`Xem tour tại ${destination.name}`}
                >
                  <div className="relative flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-slate-950/25 shadow-lg backdrop-blur-md transition duration-500 group-hover:-rotate-3 group-hover:scale-105 group-hover:bg-white/18">
                      <Icon className={`h-6 w-6 ${destination.accent}`} aria-hidden="true" />
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-slate-950/20 backdrop-blur-md transition duration-500 group-hover:rotate-6 group-hover:scale-110 group-hover:border-white group-hover:bg-white group-hover:text-slate-900">
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="relative transition-transform duration-500 group-hover:-translate-y-1.5">
                    <p className={`text-xs font-bold tracking-[0.14em] uppercase ${destination.accent}`}>
                      {destination.eyebrow}
                    </p>
                    <h3 className="mt-2 text-3xl font-bold tracking-[-0.04em] drop-shadow-sm">{destination.name}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/80">{destination.story}</p>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
