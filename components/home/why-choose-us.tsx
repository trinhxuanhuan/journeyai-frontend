"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { CalendarCheck2, HeartHandshake, MapPinned, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: CalendarCheck2,
    title: "Lịch đi có thật",
    description: "Ngày khởi hành và số chỗ còn lại được lấy trực tiếp từ hệ thống đặt tour.",
  },
  {
    icon: MapPinned,
    title: "Trải nghiệm có chiều sâu",
    description: "Mỗi hành trình đặt cảnh sắc, văn hóa và câu chuyện địa phương vào đúng trung tâm.",
  },
  {
    icon: ShieldCheck,
    title: "Thông tin minh bạch",
    description: "Giá, lịch trình và trạng thái tour được trình bày rõ ràng trước khi bạn quyết định.",
  },
] as const;

export function WhyChooseUs() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="why-us" className="relative scroll-mt-24 overflow-hidden bg-[#f2f8fc] py-20 sm:py-24">
      <div className="surface-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-[0_12px_28px_rgba(11,116,209,0.24)]">
            <HeartHandshake className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-6 text-xs font-bold tracking-[0.18em] text-primary uppercase">Lời hứa Việt Khám Phá</p>
          <motion.h2
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
            className="mt-3 text-4xl leading-[1.05] font-bold tracking-[-0.05em] text-slate-950 sm:text-5xl"
          >
            Công nghệ gọn gàng.
            <span className="mt-1 block text-primary">Hành trình giàu cảm xúc.</span>
          </motion.h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600">
            Chúng tôi dùng công nghệ để việc tìm và chọn tour nhẹ nhàng hơn, để bạn dành sự chú ý cho điều đáng nhớ nhất: Việt Nam.
          </p>

          <motion.figure
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-70px" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.55, delay: shouldReduceMotion ? 0 : 0.08 }}
            className="group relative mt-8 aspect-[4/3] overflow-hidden rounded-[1.65rem] bg-slate-900 shadow-[0_22px_55px_rgba(15,73,110,0.16)]"
          >
            <Image
              src="/images/destination-hoi-an-v1.webp"
              alt="Một con phố Hội An trong ánh đèn lồng buổi tối"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(2,17,29,0.86)_100%)]" />
            <figcaption className="absolute right-0 bottom-0 left-0 p-6 text-base leading-6 font-semibold text-white sm:p-7">
              “Văn hóa không phải phông nền. Đó là lý do để lên đường.”
            </figcaption>
          </motion.figure>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.title}
                initial={shouldReduceMotion ? false : { opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: index * 0.07 }}
                className="group flex flex-col gap-4 rounded-[1.35rem] border border-sky-100 bg-white/95 p-5 shadow-[0_12px_36px_rgba(15,73,110,0.06)] backdrop-blur-sm transition duration-400 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_20px_48px_rgba(15,73,110,0.12)] sm:p-6 lg:flex-row lg:items-start"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-primary transition duration-400 group-hover:-rotate-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-500">{feature.description}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
