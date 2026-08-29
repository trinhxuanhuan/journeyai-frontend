"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { ImageOff, MapPinned } from "lucide-react";
import { useState } from "react";

import { getSafeTourImageUrl } from "@/lib/tours";
import { cn } from "@/lib/utils";

function directImageLoader({ src }: ImageLoaderProps): string {
  return src;
}

function getFallbackImage(alt: string): string {
  const normalized = alt
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

  if (normalized.includes("ha giang")) return "/images/destination-ha-giang-v1.webp";
  if (normalized.includes("hue")) return "/images/destination-hue-v1.webp";
  if (normalized.includes("hoi an") || normalized.includes("quang nam")) {
    return "/images/destination-hoi-an-v1.webp";
  }
  if (normalized.includes("phu quoc")) return "/images/destination-phu-quoc-v1.webp";

  return "/images/viet-kham-pha-hero-v1.png";
}

export function TourImage({
  src,
  alt,
  className,
  eager = false,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
}) {
  const safeSrc = getSafeTourImageUrl(src);

  if (!safeSrc) {
    return <TourImageFallback alt={alt} className={className} failed={false} />;
  }

  return (
    <LoadableTourImage
      key={safeSrc}
      src={safeSrc}
      alt={alt}
      className={className}
      eager={eager}
    />
  );
}

function LoadableTourImage({
  src,
  alt,
  className,
  eager,
}: {
  src: string;
  alt: string;
  className?: string;
  eager: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <TourImageFallback alt={alt} className={className} failed />;
  }

  return (
    <Image
      loader={directImageLoader}
      unoptimized
      fill
      src={src}
      alt={alt}
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
      loading={eager ? "eager" : "lazy"}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}

function TourImageFallback({
  alt,
  className,
  failed,
}: {
  alt: string;
  className?: string;
  failed: boolean;
}) {
  const fallbackImage = getFallbackImage(alt);

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-slate-900 text-white",
        className
      )}
      role="img"
      aria-label={failed ? `Không tải được ảnh ${alt}` : `Chưa có ảnh ${alt}`}
    >
      <Image
        src={fallbackImage}
        alt=""
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        className="object-cover opacity-70"
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,23,40,0.14),rgba(3,23,40,0.72))]" />
      <div className="relative flex flex-col items-center gap-2 rounded-2xl border border-white/15 bg-slate-950/28 px-4 py-3 text-center shadow-lg backdrop-blur-md">
        {failed ? (
          <ImageOff className="h-6 w-6 text-sky-100" aria-hidden="true" />
        ) : (
          <MapPinned className="h-6 w-6 text-sky-100" aria-hidden="true" />
        )}
        <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase">
          Ảnh đang cập nhật
        </span>
      </div>
    </div>
  );
}
