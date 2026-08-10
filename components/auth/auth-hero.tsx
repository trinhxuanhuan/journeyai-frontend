"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { MapPin, Compass, Plane } from "lucide-react";

const destinations = [
  {
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200&auto=format&fit=crop",
    name: "Vịnh Hạ Long",
    tagline: "Kỳ quan thiên nhiên thế giới",
  },
  {
    image: "https://api.sovaba.travel/uploads/hoi_an_76f65a48c5.jpg",
    name: "Hội An",
    tagline: "Phố cổ lung linh ánh đèn lồng",
  },
  {
    image: "https://i2.ex-cdn.com/crystalbay.com/files/content/2024/08/06/sapa-lot-top-thi-tran-dep-nhat-the-gioi-1-1045.jpg",
    name: "Sa Pa",
    tagline: "Ruộng bậc thang giữa mây trời",
  },
];

export function AuthHero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % destinations.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const current = destinations[index];

  return (
    <div className="relative hidden h-full w-full overflow-hidden bg-slate-900 lg:block">
      <AnimatePresence mode="sync">
        <motion.div
          key={current.image}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={current.image}
            alt={current.name}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay để chữ dễ đọc */}
     <div className="absolute left-10 top-10 flex items-center gap-3 text-white">
  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">
    <Compass className="h-6 w-6" strokeWidth={1.5} />
  </div>
  <div>
    <span className="text-2xl font-semibold tracking-tight">Việt Khám Phá</span>
    <p className="text-xs font-medium tracking-wide text-white/60">
      Khám phá Việt Nam theo cách của bạn
    </p>
  </div>
</div>
      {/* Nội dung địa danh */}
      <div className="absolute bottom-16 left-10 right-10 text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
              <MapPin className="h-4 w-4" />
              <span>Việt Nam</span>
            </div>
            <h2 className="text-4xl font-semibold leading-tight">{current.name}</h2>
            <p className="mt-2 text-lg text-white/80">{current.tagline}</p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-3">
          {destinations.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === index ? "w-8 bg-white" : "w-1.5 bg-white/40"
              }`}
              aria-label={`Chuyển tới địa danh ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <motion.div
        className="absolute right-12 top-1/3 text-white/20"
        animate={{ y: [0, -20, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Plane className="h-16 w-16" strokeWidth={1} />
      </motion.div>
    </div>
  );
}