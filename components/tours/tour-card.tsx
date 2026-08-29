import Link from "next/link";
import {
  ArrowUpRight,
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

  return (
    <article className="group relative overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:border-sky-200 hover:shadow-[0_22px_50px_rgba(15,73,110,0.15)]">
      <Link
        href={`/tours/${encodeURIComponent(tour.tourId)}`}
        className="flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary"
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
                    ? "bg-slate-800/80 text-white backdrop-blur-md"
                    : "bg-[#075fa8] text-white"
              }`}
            >
              {isGroupTour
                ? tour.hasAvailableSlot
                  ? "Đang còn chỗ"
                  : "Đang cập nhật lịch"
                : "Lịch riêng theo nhóm"}
            </span>
          </div>
        </div>

        <div className="flex flex-col flex-1 p-4 sm:p-5">
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

            <h2 className="line-clamp-2 text-lg font-bold leading-snug tracking-[-0.02em] text-slate-900 transition-colors group-hover:text-primary">
              {tour.name}
            </h2>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2 text-sm text-slate-500">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <span>Khởi hành từ {tour.departureLocation}</span>
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

          <div className="mt-4 flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
            <div>
              <span className="block text-xs font-medium text-slate-500">Giá niêm yết từ</span>
              <strong className="text-xl font-bold text-[#e84f35]">
                {formatTourPrice(tour.basePrice)}
              </strong>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition duration-400 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
