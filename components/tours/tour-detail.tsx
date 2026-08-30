"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Baby,
  BedDouble,
  BusFront,
  CalendarDays,
  Check,
  CircleCheck,
  CircleX,
  Clock3,
  Compass,
  ExternalLink,
  Hotel,
  Info,
  MapPin,
  RefreshCw,
  Route,
  ShieldCheck,
  Star,
  TicketCheck,
  UserRoundCheck,
  Users,
  Utensils,
  WalletCards,
} from "lucide-react";

import { TourImage } from "@/components/tours/tour-image";
import { Button, buttonVariants } from "@/components/ui/button";
import { buildBookingHref } from "@/lib/bookings";
import {
  formatDepartureDate,
  formatMeetingTime,
  formatTourDuration,
  formatTourPrice,
  getActivityMapUrl,
  getItineraryPeriod,
  getPriceUnitLabel,
  getPublicDepartures,
  getTourDetail,
  getTourRequestErrorMessage,
  getTourTypeLabel,
  isCanceledTourRequest,
  isTourNotFoundError,
  type PublicDeparture,
  type TourDetail,
} from "@/lib/tours";
import { cn } from "@/lib/utils";

type TourState =
  | { requestKey: string; status: "success"; data: TourDetail; error: null }
  | { requestKey: string; status: "not-found"; data: null; error: null }
  | { requestKey: string; status: "error"; data: null; error: string };

type DepartureState =
  | {
      requestKey: string;
      status: "success";
      data: PublicDeparture[];
      error: null;
    }
  | { requestKey: string; status: "error"; data: null; error: string };

type CurrentTourState =
  | TourState
  | { status: "loading"; data: null; error: null };

type CurrentDepartureState =
  | DepartureState
  | { status: "loading"; data: null; error: null }
  | { status: "not-applicable"; data: null; error: null };

export function TourDetailView({ tourId }: { tourId: string }) {
  const [tourReloadKey, setTourReloadKey] = useState(0);
  const [departureReloadKey, setDepartureReloadKey] = useState(0);
  const [tourResult, setTourResult] = useState<TourState | null>(null);
  const [departureResult, setDepartureResult] =
    useState<DepartureState | null>(null);
  const tourRequestKey = `${tourId}\u0000${tourReloadKey}`;
  const departureRequestKey = `${tourId}\u0000${departureReloadKey}`;
  const tourState: CurrentTourState =
    tourResult?.requestKey === tourRequestKey
      ? tourResult
      : { status: "loading", data: null, error: null };
  const loadedTour = tourState.status === "success" ? tourState.data : null;
  const departureState: CurrentDepartureState =
    loadedTour?.tourType === "PRIVATE"
      ? { status: "not-applicable", data: null, error: null }
      : departureResult?.requestKey === departureRequestKey
        ? departureResult
        : { status: "loading", data: null, error: null };

  useEffect(() => {
    const controller = new AbortController();

    getTourDetail(tourId, controller.signal)
      .then((data) =>
        setTourResult({
          requestKey: tourRequestKey,
          status: "success",
          data,
          error: null,
        })
      )
      .catch((error: unknown) => {
        if (controller.signal.aborted || isCanceledTourRequest(error)) return;
        if (isTourNotFoundError(error)) {
          setTourResult({
            requestKey: tourRequestKey,
            status: "not-found",
            data: null,
            error: null,
          });
          return;
        }
        setTourResult({
          requestKey: tourRequestKey,
          status: "error",
          data: null,
          error: getTourRequestErrorMessage(error),
        });
      });

    return () => controller.abort();
  }, [tourId, tourRequestKey]);

  useEffect(() => {
    if (!loadedTour || loadedTour.tourType !== "GROUP") return;

    const controller = new AbortController();

    getPublicDepartures(tourId, controller.signal)
      .then((data) =>
        setDepartureResult({
          requestKey: departureRequestKey,
          status: "success",
          data,
          error: null,
        })
      )
      .catch((error: unknown) => {
        if (controller.signal.aborted || isCanceledTourRequest(error)) return;
        setDepartureResult({
          requestKey: departureRequestKey,
          status: "error",
          data: null,
          error: getTourRequestErrorMessage(error),
        });
      });

    return () => controller.abort();
  }, [departureRequestKey, loadedTour, tourId]);

  if (tourState.status === "loading") return <TourDetailSkeleton />;

  if (tourState.status === "not-found") {
    return (
      <CenteredMessage
        icon={<Compass className="h-10 w-10" aria-hidden="true" />}
        title="Hành trình này không còn mở"
        description="Tour không tồn tại hoặc đã ngừng phục vụ. Bạn có thể quay lại khám phá những hành trình đang hoạt động."
      />
    );
  }

  if (tourState.status === "error") {
    return (
      <CenteredMessage
        icon={<RefreshCw className="h-10 w-10" aria-hidden="true" />}
        title="Chưa thể mở hành trình"
        description={tourState.error}
        onRetry={() => setTourReloadKey((value) => value + 1)}
      />
    );
  }

  return (
    <TourDetailContent
      tour={tourState.data}
      departureState={departureState}
      onRetryDepartures={() =>
        setDepartureReloadKey((value) => value + 1)
      }
    />
  );
}

function TourDetailContent({
  tour,
  departureState,
  onRetryDepartures,
}: {
  tour: TourDetail;
  departureState: CurrentDepartureState;
  onRetryDepartures: () => void;
}) {
  const gallery = useMemo(
    () =>
      Array.from(
        new Set(
          [tour.coverImageUrl, ...tour.images].filter(
            (image): image is string => Boolean(image)
          )
        )
      ).slice(0, 3),
    [tour.coverImageUrl, tour.images]
  );
  const hasRating = tour.reviewCount > 0 && tour.avgRating > 0;

  return (
    <main className="min-h-screen bg-[#f6f9fc] pb-20">
      <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-8">
        <Link
          href="/#tour-results"
          className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-500 transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Trở lại danh sách tour
        </Link>

        <div
          className={cn(
            "mt-6 grid gap-3 overflow-hidden rounded-[1.75rem]",
            gallery.length > 1 && "lg:grid-cols-[1.65fr_1fr] lg:grid-rows-2"
          )}
        >
          <div
            className={cn(
              "group relative aspect-[16/10] overflow-hidden bg-slate-200 lg:aspect-auto lg:min-h-[520px]",
              gallery.length > 1 && "lg:row-span-2"
            )}
          >
            <TourImage
              src={gallery[0] ?? null}
              alt={`Toàn cảnh ${tour.name}`}
              eager
              className="transition-transform duration-[1100ms] ease-out group-hover:scale-[1.045]"
            />
          </div>
          {gallery.slice(1).map((image, index) => (
            <div
              key={image}
              className={cn(
                "group relative hidden min-h-[254px] overflow-hidden bg-slate-200 lg:block",
                gallery.length === 2 && "lg:row-span-2"
              )}
            >
              <TourImage
                src={image}
                alt={index === 0 ? `Điểm nhấn trong ${tour.name}` : `Trải nghiệm trong ${tour.name}`}
                className="transition-transform duration-[1100ms] ease-out group-hover:scale-[1.06]"
              />
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold text-primary">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                {getTourTypeLabel(tour.tourType)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                <Star
                  className={cn(
                    "h-3.5 w-3.5",
                    hasRating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  )}
                  aria-hidden="true"
                />
                {hasRating
                  ? `${tour.avgRating.toFixed(1)} · ${tour.reviewCount} đánh giá`
                  : "Chưa có đánh giá"}
              </span>
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-[-0.045em] text-slate-950 sm:text-5xl">
              {tour.name}
            </h1>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <SummaryItem
                icon={Route}
                label="Tuyến hành trình"
                value={`${tour.departureLocation} → ${tour.destination.name}`}
              />
              <SummaryItem
                icon={Clock3}
                label="Thời lượng"
                value={formatTourDuration(
                  tour.durationDays,
                  tour.durationNights
                )}
              />
              <SummaryItem
                icon={Users}
                label="Quy mô nhóm"
                value={`${tour.minGroupSize}–${tour.maxGroupSize} khách`}
              />
              <SummaryItem
                icon={UserRoundCheck}
                label="Hướng dẫn viên"
                value={getGuideModeLabel(tour.guideMode)}
              />
            </div>

            <p className="mt-7 whitespace-pre-line text-base leading-8 text-slate-600">
              {tour.description}
            </p>

            <section className="mt-12" aria-labelledby="package-heading">
              <SectionHeading
                eyebrow="Gói tour minh bạch"
                title="Bạn được bao gồm những gì?"
                id="package-heading"
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <PolicyList
                  title="Đã bao gồm"
                  items={tour.included}
                  icon={Check}
                  tone="included"
                  emptyText="Hạng mục bao gồm đang được cập nhật."
                />
                <PolicyList
                  title="Chưa bao gồm"
                  items={tour.excluded}
                  icon={CircleX}
                  tone="excluded"
                  emptyText="Không có hạng mục loại trừ được công bố."
                />
              </div>

              <PackageDetails tour={tour} />
            </section>

            <section className="mt-12" aria-labelledby="itinerary-heading">
              <SectionHeading
                eyebrow="Hành trình"
                title="Từng ngày, từng câu chuyện"
                id="itinerary-heading"
              />

              <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm leading-6 text-slate-600">
                <p className="flex items-start gap-2">
                  <Info className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  Lịch trình thể hiện các điểm tham quan và khung giờ vận hành dự kiến. Thứ tự có thể điều chỉnh theo thời tiết, giao thông hoặc thông báo của điểm đến nhưng không tự ý cắt giảm quyền lợi đã công bố.
                </p>
              </div>

              <nav aria-label="Đi nhanh đến ngày trong lịch trình" className="mt-5 flex gap-2 overflow-x-auto pb-2">
                {tour.itinerary.map((day) => (
                  <a
                    key={day.dayNumber}
                    href={`#ngay-${day.dayNumber}`}
                    className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    Ngày {day.dayNumber}
                  </a>
                ))}
              </nav>

              <ol className="mt-7 space-y-5">
                {tour.itinerary.map((day) => (
                  <li
                    key={`${day.dayNumber}-${day.title}`}
                    id={`ngay-${day.dayNumber}`}
                    className="scroll-mt-28 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.04)] sm:p-6"
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-white">
                        <small className="text-[0.55rem] font-bold tracking-[0.08em] uppercase opacity-80">Ngày</small>
                        <strong className="text-base leading-none">{day.dayNumber}</strong>
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-bold text-slate-900">
                          {day.title}
                        </h3>
                        <ul className="relative mt-6 space-y-0 before:absolute before:top-2 before:bottom-3 before:left-[5px] before:w-px before:bg-slate-200">
                          {day.activities.map((activity, index) => (
                            <li
                              key={`${activity.time}-${activity.description}-${index}`}
                              className="relative grid gap-2 pb-6 pl-7 text-sm leading-6 text-slate-600 last:pb-0 sm:grid-cols-[118px_1fr]"
                            >
                              <span className="absolute top-1.5 left-0 h-[11px] w-[11px] rounded-full border-[3px] border-sky-100 bg-primary" aria-hidden="true" />
                              <span>
                                <strong className="block font-bold text-primary">{activity.time}</strong>
                                <small className="block text-[0.7rem] font-semibold tracking-[0.04em] text-slate-400 uppercase">
                                  {getItineraryPeriod(activity.time)}
                                </small>
                              </span>
                              <span>
                                <span className="block">{activity.description}</span>
                                {activity.location && (
                                  <a
                                    href={getActivityMapUrl(activity.location)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-flex items-center gap-1.5 font-semibold text-primary transition hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                                    aria-label={`Mở vị trí hoạt động lúc ${activity.time} trên Google Maps`}
                                  >
                                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                    Xem vị trí
                                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                  </a>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <TourPolicies tour={tour} />
          </div>

          <BookingSummary
            tour={tour}
            departureState={departureState}
            onRetryDepartures={onRetryDepartures}
          />
        </div>
      </div>
    </main>
  );
}

function SummaryItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Route;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.035)]">
      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      <span className="mt-3 block text-[0.68rem] font-bold tracking-[0.1em] text-slate-400 uppercase">
        {label}
      </span>
      <strong className="mt-1 block text-sm leading-5 text-slate-800">
        {value}
      </strong>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  id,
}: {
  eyebrow: string;
  title: string;
  id: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950"
      >
        {title}
      </h2>
    </div>
  );
}

function PolicyList({
  title,
  items,
  icon: Icon,
  tone,
  emptyText,
}: {
  title: string;
  items: string[];
  icon: typeof Check;
  tone: "included" | "excluded";
  emptyText: string;
}) {
  const included = tone === "included";

  return (
    <div
      className={cn(
        "rounded-3xl border p-5 sm:p-6",
        included
          ? "border-emerald-100 bg-emerald-50/55"
          : "border-slate-200 bg-white"
      )}
    >
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 text-sm leading-6 text-slate-600"
            >
              <span
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                  included
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                )}
              >
                <Icon className="h-3 w-3" aria-hidden="true" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm leading-6 text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}

const packageSections = [
  { key: "accommodation", label: "Lưu trú", icon: Hotel },
  { key: "transport", label: "Di chuyển", icon: BusFront },
  { key: "meals", label: "Bữa ăn", icon: Utensils },
  { key: "tickets", label: "Vé tham quan", icon: TicketCheck },
  { key: "insurance", label: "Bảo hiểm", icon: ShieldCheck },
] as const;

function PackageDetails({ tour }: { tour: TourDetail }) {
  const sections = packageSections.filter(
    ({ key }) => tour.packageDetails[key].length > 0
  );

  if (sections.length === 0) return null;

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {sections.map(({ key, label, icon: Icon }) => (
        <article
          key={key}
          className="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-primary">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            {label}
          </div>
          <ul className="mt-3 space-y-1.5 text-sm leading-5 text-slate-500">
            {tour.packageDetails[key].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function TourPolicies({ tour }: { tour: TourDetail }) {
  return (
    <section className="mt-12" aria-labelledby="policies-heading">
      <SectionHeading
        eyebrow="Trước khi đặt"
        title="Giá trẻ em, phòng đơn và hoàn hủy"
        id="policies-heading"
      />
      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <PolicyCard icon={Baby} title="Chính sách trẻ em">
          <p>{tour.childPolicy.description}</p>
          <p className="mt-2 font-semibold text-slate-800">
            Mức giá: {tour.childPolicy.pricePercentage}% giá người lớn
          </p>
        </PolicyCard>
        <PolicyCard icon={BedDouble} title="Phụ thu phòng đơn">
          <p>
            {tour.singleRoomSupplement > 0
              ? `${formatTourPrice(tour.singleRoomSupplement)} cho mỗi phòng đơn.`
              : "Không có phụ thu phòng đơn trong cấu hình hiện tại."}
          </p>
        </PolicyCard>
        <PolicyCard icon={RefreshCw} title="Hoàn và hủy">
          {tour.cancellationPolicy.length > 0 ? (
            <ul className="space-y-2">
              {tour.cancellationPolicy.map((rule) => (
                <li
                  key={`${rule.minimumDaysBeforeDeparture}-${rule.refundPercentage}`}
                >
                  {formatCancellationRule(
                    rule.minimumDaysBeforeDeparture,
                    rule.refundPercentage
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>Chính sách hoàn hủy đang được cập nhật.</p>
          )}
        </PolicyCard>
      </div>
    </section>
  );
}

function PolicyCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Baby;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,0.035)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
      <div className="mt-2 text-sm leading-6 text-slate-500">{children}</div>
    </article>
  );
}

function BookingSummary({
  tour,
  departureState,
  onRetryDepartures,
}: {
  tour: TourDetail;
  departureState: CurrentDepartureState;
  onRetryDepartures: () => void;
}) {
  const meetingTime = formatMeetingTime(tour.meetingTime);

  return (
    <aside
      className="lg:sticky lg:top-24 lg:self-start"
      aria-labelledby="booking-summary-heading"
    >
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,73,110,0.1)]">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#eef9ff,#ffffff)] p-6">
          <span className="text-sm font-medium text-slate-500">
            Giá niêm yết
          </span>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
            <strong className="text-3xl font-bold text-[#e84f35]">
              {formatTourPrice(tour.basePrice)}
            </strong>
            <span className="text-sm text-slate-500">
              {getPriceUnitLabel(tour.priceModel)}
            </span>
          </div>
          <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
            <WalletCards
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
              aria-hidden="true"
            />
            Giá cuối cùng do hệ thống tính theo số khách, trẻ em và phụ thu đã chọn.
          </p>
        </div>

        <div className="p-6">
          {tour.tourType === "GROUP" ? (
            <GroupDeparturePanel
              tour={tour}
              departureState={departureState}
              onRetry={onRetryDepartures}
            />
          ) : (
            <PrivateTourPanel tour={tour} />
          )}

          <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-xs leading-5 text-slate-600">
            <p className="flex items-start gap-2">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              {tour.tourType === "GROUP"
                ? "Xem lịch không giữ chỗ. Thời gian giữ chỗ 15 phút chỉ bắt đầu khi bạn tạo booking."
                : "Tour riêng chỉ dành cho nhóm trong một booking, không ghép khách lạ và không dùng tồn chỗ chung."}
            </p>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-5">
            <h3 className="text-sm font-bold text-slate-900">Điểm tập trung</h3>
            <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-500">
              <MapPin
                className="mt-1 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>
                {tour.meetingPoint ?? tour.departureLocation}
                {meetingTime && (
                  <span className="block font-semibold text-slate-700">
                    Có mặt lúc {meetingTime}
                  </span>
                )}
              </span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function GroupDeparturePanel({
  tour,
  departureState,
  onRetry,
}: {
  tour: TourDetail;
  departureState: CurrentDepartureState;
  onRetry: () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 id="booking-summary-heading" className="text-lg font-bold text-slate-900">
          Lịch khởi hành
        </h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Chỉ những đoàn đang mở và còn chỗ mới có thể đặt.
      </p>

      <div className="mt-5">
        {departureState.status === "loading" && <DepartureSkeleton />}

        {departureState.status === "error" && (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <p className="leading-6">{departureState.error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3"
            >
              Thử lại lịch khởi hành
            </Button>
          </div>
        )}

        {departureState.status === "success" &&
          departureState.data.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
              Chưa có lịch khởi hành sắp tới. Tour hiện chưa thể nhận booking mới.
            </div>
          )}

        {departureState.status === "success" &&
          departureState.data.length > 0 && (
            <ul className="space-y-3">
              {departureState.data.map((departure) => {
                const effectivePrice = departure.priceOverride ?? tour.basePrice;

                return (
                  <li
                    key={departure.departureId}
                    className={cn(
                      "rounded-2xl border p-4",
                      departure.bookable
                        ? "border-emerald-200 bg-emerald-50/65"
                        : "border-slate-200 bg-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="block font-bold text-slate-900">
                          {formatDepartureDate(departure.startDate)}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          Kết thúc {formatDepartureDate(departure.endDate)}
                        </span>
                      </div>
                      {departure.bookable ? (
                        <CircleCheck
                          className="h-5 w-5 shrink-0 text-emerald-600"
                          aria-label="Có thể đặt"
                        />
                      ) : (
                        <span className="rounded-full bg-slate-200 px-2 py-1 text-[0.65rem] font-bold text-slate-600">
                          Hết chỗ
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-2 border-t border-black/5 pt-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <Users className="h-4 w-4" aria-hidden="true" />
                        {departure.bookable
                          ? `Còn ${departure.availableSeats}/${departure.capacity} chỗ`
                          : `${departure.capacity} chỗ đã được giữ hoặc đặt`}
                      </span>
                      <strong className="text-sm text-[#d9472e]">
                        {formatTourPrice(effectivePrice)} / khách
                      </strong>
                    </div>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <UserRoundCheck
                        className="h-3.5 w-3.5 text-primary"
                        aria-hidden="true"
                      />
                      Đã phân công hướng dẫn viên
                    </p>
                    {departure.bookable && (
                      <Link
                        href={buildBookingHref(tour.id, departure.departureId)}
                        className={cn(
                          buttonVariants({ size: "lg" }),
                          "mt-4 h-11 w-full rounded-xl bg-primary font-bold text-white shadow-[0_10px_24px_rgba(11,116,209,0.18)] hover:bg-[#075fae]"
                        )}
                      >
                        Chọn lịch này
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
      </div>
    </div>
  );
}

function PrivateTourPanel({ tour }: { tour: TourDetail }) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
        <h2 id="booking-summary-heading" className="text-lg font-bold text-slate-900">
          Ngày đi của nhóm bạn
        </h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Ngày khởi hành mong muốn sẽ được chọn khi tạo booking, không cần chờ ghép đoàn.
      </p>

      <dl className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50/70 px-4">
        <PrivateFact label="Quy mô" value={`${tour.minGroupSize}–${tour.maxGroupSize} khách`} />
        <PrivateFact label="Cách tính giá" value={getPrivatePriceLabel(tour.priceModel)} />
        <PrivateFact label="Hướng dẫn viên" value={getGuideModeLabel(tour.guideMode)} />
        {tour.guideMode === "OPTIONAL" && (
          <PrivateFact
            label="Phí chọn HDV"
            value={formatTourPrice(tour.optionalGuidePrice)}
          />
        )}
      </dl>

      <Link
        href={buildBookingHref(tour.id)}
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-5 h-11 w-full rounded-xl bg-primary font-bold text-white shadow-[0_10px_24px_rgba(11,116,209,0.18)] hover:bg-[#075fae]"
        )}
      >
        Đặt tour riêng
      </Link>
    </div>
  );
}

function PrivateFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function getGuideModeLabel(mode: TourDetail["guideMode"]): string {
  switch (mode) {
    case "INCLUDED":
      return "Đã bao gồm";
    case "OPTIONAL":
      return "Tùy chọn thêm";
    case "NONE":
      return "Không có HDV";
  }
}

function getPrivatePriceLabel(priceModel: TourDetail["priceModel"]): string {
  return priceModel === "PER_PERSON" ? "Theo từng khách" : "Trọn gói theo nhóm";
}

function formatCancellationRule(days: number, refundPercentage: number): string {
  return days > 0
    ? `Hủy trước ít nhất ${days} ngày: hoàn ${refundPercentage}%`
    : `Hủy sát ngày hoặc không tham gia: hoàn ${refundPercentage}%`;
}

function TourDetailSkeleton() {
  return (
    <main
      className="min-h-screen bg-[#f6f9fc] px-5 py-10 sm:px-8"
      role="status"
      aria-label="Đang tải chi tiết tour"
    >
      <div className="mx-auto max-w-7xl">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-6 aspect-[16/7] animate-pulse rounded-[1.75rem] bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_390px]">
          <div className="space-y-4">
            <div className="h-10 w-4/5 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            <div className="h-4 w-full animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
          </div>
          <div className="h-72 animate-pulse rounded-3xl bg-white ring-1 ring-slate-200 motion-reduce:animate-none" />
        </div>
      </div>
      <span className="sr-only">Đang tải...</span>
    </main>
  );
}

function DepartureSkeleton() {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-label="Đang tải lịch khởi hành"
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-28 animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none"
        />
      ))}
      <span className="sr-only">Đang tải...</span>
    </div>
  );
}

function CenteredMessage({
  icon,
  title,
  description,
  onRetry,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#f6f9fc] px-5 py-16">
      <div className="max-w-xl rounded-3xl border border-slate-200 bg-white px-7 py-12 text-center shadow-[0_20px_60px_rgba(15,73,110,0.08)] sm:px-12">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-primary">
          {icon}
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{description}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onRetry && (
            <Button
              type="button"
              onClick={onRetry}
              className="bg-primary text-white hover:bg-[#075fae]"
            >
              Thử lại
            </Button>
          )}
          <Link href="/#tour-results" className={buttonVariants({ variant: "outline" })}>
            Xem các tour khác
          </Link>
        </div>
      </div>
    </main>
  );
}
