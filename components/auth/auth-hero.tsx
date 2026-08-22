"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Compass,
  MapPin,
  Mountain,
  UtensilsCrossed,
  Waves,
} from "lucide-react";

// Country geometry adapted from Natural Earth 1:110m (public domain).
// It is intentionally rendered without administrative boundaries: this visual
// represents a journey through Vietnam, not an administrative map.
const VIETNAM_SILHOUETTE =
  "M100 473.5L130.5 459.3L167.5 456.7L152 435.4L211.3 408.3L215.6 366L207.5 342.5L213.9 307.3L205 282.4L178.3 257.9L156.1 226.8L126.8 185.1L84.6 164.1L94.7 151.4L117.2 142.2L103.5 111.4L60.2 111.1L44.3 79.1L23.7 51.3L42.6 42.7L70.7 42.9L105 38.8L135.1 20L152.1 33.2L184.3 39.7L178.7 60L195.5 74.3L231 83.4L183.9 113.6L154.5 146.9L146.8 171.4L173.8 208.5L206.7 254.6L238.7 276.3L260.1 304.6L276.3 369.9L271.5 431.9L242.1 455.1L201.7 477.8L173 507.2L129 540L116.2 517.4L126.1 493.5L100 473.5Z";

const experiences = [
  { label: "Núi rừng", icon: Mountain },
  { label: "Biển đảo", icon: Waves },
  { label: "Ẩm thực", icon: UtensilsCrossed },
];

const journeyStops = [
  { name: "Hà Nội", x: 152.9, y: 101.9 },
  { name: "Huế", x: 214.8, y: 262.8 },
  { name: "Cần Thơ", x: 149.8, y: 489.1 },
];

export function AuthHero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <aside
      className="relative hidden min-h-screen overflow-hidden bg-[#171310] text-[#fffaf3] lg:block"
      aria-label="Cảm hứng khám phá Việt Nam"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(180,69,46,0.38),transparent_34%),radial-gradient(circle_at_86%_80%,rgba(30,105,99,0.34),transparent_38%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(255,250,243,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,250,243,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute -top-32 -right-28 h-96 w-96 rounded-full border border-[#fffaf3]/8" />
      <div className="absolute -right-12 -bottom-40 h-[34rem] w-[34rem] rounded-full border border-[#fffaf3]/6" />

      <div className="relative z-10 flex min-h-screen flex-col px-9 py-8 xl:px-12 xl:py-10 2xl:px-16 2xl:py-12">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#fffaf3]/20 bg-[#fffaf3]/8 backdrop-blur-sm">
            <Compass className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-[-0.02em]">
              Việt Khám Phá
            </p>
            <p className="text-[0.68rem] tracking-[0.22em] text-[#fffaf3]/55 uppercase">
              Đi để hiểu hơn
            </p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-[minmax(0,0.92fr)_minmax(250px,0.78fr)] items-center gap-5 xl:gap-10">
          <div className="max-w-[31rem] pb-4">
            <p className="mb-5 flex items-center gap-2 text-sm font-medium text-[#e6b83d]">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Một hành trình xuyên Việt
            </p>
            <h2 className="text-[clamp(2.55rem,4.2vw,4.7rem)] leading-[0.98] font-semibold tracking-[-0.055em] text-balance">
              Đi qua Việt Nam bằng những câu chuyện.
            </h2>
            <p className="mt-6 max-w-md text-[0.98rem] leading-7 text-[#fffaf3]/68 xl:text-lg xl:leading-8">
              Từ miền đá nở hoa đến nhịp sông phương Nam — mỗi chuyến đi là
              một cách chạm gần hơn vào đất nước và con người Việt.
            </p>

            <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Trải nghiệm nổi bật">
              {experiences.map(({ label, icon: Icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-[#fffaf3]/12 bg-[#fffaf3]/7 px-3.5 py-2 text-xs font-medium text-[#fffaf3]/78 backdrop-blur-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-[#e6b83d]" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <motion.figure
            className="relative mx-auto h-[min(72vh,43rem)] min-h-[31rem] w-full max-w-[24rem]"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut" }}
          >
            <div className="absolute inset-[8%_2%] rounded-[50%] bg-[#d79b32]/8 blur-3xl" />
            <svg
              viewBox="0 0 300 560"
              className="relative h-full w-full overflow-visible drop-shadow-[0_30px_45px_rgba(0,0,0,0.3)]"
              role="img"
              aria-labelledby="vietnam-map-title vietnam-map-description"
            >
              <title id="vietnam-map-title">Silhouette Việt Nam</title>
              <desc id="vietnam-map-description">
                Hành trình gợi ý từ Hà Nội qua Huế đến Cần Thơ
              </desc>
              <defs>
                <linearGradient id="vietnam-overlay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#6f2d20" stopOpacity="0.12" />
                  <stop offset="0.48" stopColor="#1a1714" stopOpacity="0.06" />
                  <stop offset="1" stopColor="#082f2d" stopOpacity="0.3" />
                </linearGradient>
                <clipPath id="vietnam-clip">
                  <path d={VIETNAM_SILHOUETTE} />
                </clipPath>
              </defs>

              <motion.g
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.9, ease: "easeOut" }}
                style={{ transformOrigin: "center" }}
              >
                <path d={VIETNAM_SILHOUETTE} fill="#2a211b" />
                <g clipPath="url(#vietnam-clip)">
                  <image
                    href="/images/auth-vietnam-journey-v1.webp"
                    x="20"
                    y="20"
                    width="260"
                    height="520"
                    preserveAspectRatio="xMidYMid slice"
                  />
                  <rect
                    x="0"
                    y="0"
                    width="300"
                    height="560"
                    fill="url(#vietnam-overlay)"
                  />
                  <path
                    d="M152.9 101.9C171 150 188 205 214.8 262.8C237 322 217 407 149.8 489.1"
                    fill="none"
                    stroke="rgba(255,250,243,0.9)"
                    strokeWidth="1.6"
                    strokeDasharray="4 8"
                    strokeLinecap="round"
                  />
                </g>
                <path
                  d={VIETNAM_SILHOUETTE}
                  fill="none"
                  stroke="rgba(255,250,243,0.82)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </motion.g>

              {journeyStops.map((stop, index) => (
                <motion.g
                  key={stop.name}
                  initial={shouldReduceMotion ? false : { opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: shouldReduceMotion ? 0 : 0.45 + index * 0.16,
                    duration: shouldReduceMotion ? 0 : 0.35,
                  }}
                  style={{ transformOrigin: `${stop.x}px ${stop.y}px` }}
                >
                  <circle cx={stop.x} cy={stop.y} r="9" fill="rgba(23,19,16,0.46)" />
                  <circle cx={stop.x} cy={stop.y} r="4.5" fill="#fffaf3" />
                  <circle cx={stop.x} cy={stop.y} r="2" fill="#b5442e" />
                  <text
                    x={stop.x + (index === 1 ? 12 : -12)}
                    y={stop.y + 4}
                    textAnchor={index === 1 ? "start" : "end"}
                    fill="#fffaf3"
                    fontSize="11"
                    fontWeight="600"
                    letterSpacing="0.02em"
                    stroke="rgba(23,19,16,0.62)"
                    strokeWidth="2"
                    paintOrder="stroke"
                  >
                    {stop.name}
                  </text>
                </motion.g>
              ))}
            </svg>

            <figcaption className="absolute right-1 bottom-2 rounded-full border border-[#fffaf3]/12 bg-[#171310]/55 px-3 py-1.5 text-[0.65rem] tracking-[0.16em] text-[#fffaf3]/56 uppercase backdrop-blur-md">
              Bắc · Trung · Nam
            </figcaption>
          </motion.figure>
        </div>

        <p className="text-xs tracking-[0.13em] text-[#fffaf3]/38 uppercase">
          Di sản · Thiên nhiên · Đời sống địa phương
        </p>
      </div>
    </aside>
  );
}
