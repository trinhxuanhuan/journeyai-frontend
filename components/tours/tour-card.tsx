import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Star,
  UsersRound,
} from "lucide-react";

import { TourImage } from "@/components/tours/tour-image";
import {
  formatTourPrice,
  formatVietnamInstant,
  getTourTypeLabel,
  type TourSearchItem,
} from "@/lib/tours";

export function TourCard({ tour }: { tour: TourSearchItem }) {
  const hasRating = tour.avgRating > 0;
  const isGroupTour = tour.tourType === "GROUP";
  const detailHref = `/tours/${encodeURIComponent(tour.tourId)}`;
  const actionHref = `${detailHref}#${isGroupTour ? "lich-khoi-hanh" : "dat-tour"}`;
  const actionLabel = isGroupTour
    ? tour.hasAvailableSlot
      ? "Xem lịch và đặt"
      : "Xem chi tiết tour"
    : "Xem và đặt tour riêng";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:border-sky-200 hover:shadow-[0_22px_50px_rgba(15,73,110,0.15)]">
      <Link
        href={detailHref}
        className="relative block focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
        aria-label={`Xem tour ${tour.name}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <TourImage
            src={tour.coverImageUrl}
            alt={`Cảnh đẹp trong tour ${tour.name}`}
            className="transition-transform duration-[900ms] ease-out group-hover:scale-[1.09]"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(2,18,32,0.2))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-md transition duration-500 group-hover:-translate-y-0.5 ${
                isGroupTour && tour.hasAvailableSlot
                  ? "bg-[#0a9b83] text-white"
                  : isGroupTour
                    ? "bg-slate-800/80 text-white"
                    : "bg-[#075fa8] text-white"
              }`}
            >
              {isGroupTour
                ? tour.hasAvailableSlot
                  ? "Đang còn chỗ"
                  : "Lịch sắp mở"
                : "Lịch riêng theo nhóm"}
            </span>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Star
                className={`h-4 w-4 ${hasRating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                aria-hidden="true"
              />
              <span className={hasRating ? "text-slate-700" : "text-slate-400"}>
                {hasRating ? `${tour.avgRating.toFixed(1)}/5` : "Chưa có đánh giá"}
              </span>
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-xs font-bold tracking-[0.08em] text-primary uppercase">
            <UsersRound className="h-3.5 w-3.5" aria-hidden="true" />
            {getTourTypeLabel(tour.tourType)}
          </p>

          <h2 className="line-clamp-2 text-lg font-bold leading-snug tracking-[-0.02em] text-slate-900">
            <Link
              href={detailHref}
              className="transition-colors hover:text-primary focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {tour.name}
            </Link>
          </h2>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
              aria-hidden="true"
            />
            <span>
              {tour.destinationName
                ? `${tour.departureLocation} → ${tour.destinationName}`
                : `Khởi hành từ ${tour.departureLocation}`}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span>
              {isGroupTour
                ? tour.nearestDepartureDate
                  ? `Sắp khởi hành: ${formatVietnamInstant(tour.nearestDepartureDate)}`
                  : "Lịch khởi hành đang được cập nhật"
                : "Ngày đi do nhóm của bạn lựa chọn"}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <span className="block text-xs font-medium text-slate-500">Giá niêm yết từ</span>
              <strong className="text-xl font-bold text-[#e84f35]">
                {formatTourPrice(tour.basePrice)}
              </strong>
              <span className="ml-1 text-xs font-semibold text-slate-400">
                {isGroupTour ? "/ khách" : "/ nhóm"}
              </span>
            </div>
          </div>

          <Link
            href={actionHref}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(11,116,209,0.18)] transition hover:bg-[#075fae] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label={`${actionLabel}: ${tour.name}`}
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
