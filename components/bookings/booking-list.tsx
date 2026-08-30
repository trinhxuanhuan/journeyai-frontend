"use client";

import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Compass,
  RefreshCw,
  TicketCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  formatBookingDate,
  formatBookingStatus,
  getBookingRequestErrorMessage,
  getMyBookings,
  isCanceledBookingRequest,
  type CustomerBookingItem,
  type CustomerBookingList,
} from "@/lib/bookings";
import { formatTourPrice, getTourDetail } from "@/lib/tours";
import { cn } from "@/lib/utils";

type ListState =
  | { requestKey: string; status: "error"; message: string }
  | {
      requestKey: string;
      status: "success";
      data: CustomerBookingList;
      tourNames: Record<string, string>;
    };

export function BookingList() {
  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<ListState | null>(null);
  const requestKey = `${page}\u0000${reloadKey}`;
  const state = result?.requestKey === requestKey ? result : { status: "loading" as const };

  useEffect(() => {
    const controller = new AbortController();

    getMyBookings(page, 10, controller.signal)
      .then(async (data) => {
        const uniqueTourIds = Array.from(new Set(data.items.map((item) => item.tourId)));
        const resolved = await Promise.all(
          uniqueTourIds.map(async (tourId) => {
            try {
              const tour = await getTourDetail(tourId, controller.signal);
              return [tourId, tour.name] as const;
            } catch {
              return [tourId, "Hành trình Việt Khám Phá"] as const;
            }
          })
        );
        if (!controller.signal.aborted) {
          setResult({ requestKey, status: "success", data, tourNames: Object.fromEntries(resolved) });
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isCanceledBookingRequest(error)) return;
        setResult({ requestKey, status: "error", message: getBookingRequestErrorMessage(error) });
      });

    return () => controller.abort();
  }, [page, reloadKey, requestKey]);

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Hành trình của bạn</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Booking của tôi</h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">Theo dõi giữ chỗ, thanh toán và trạng thái từng chuyến đi tại một nơi.</p>
          </div>
          <Link href="/#tour-results" className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-[#075fae]">
            Khám phá thêm tour
            <Compass className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {state.status === "loading" && <BookingListSkeleton />}
        {state.status === "error" && (
          <div className="mt-8 rounded-3xl border border-red-100 bg-white p-8 text-center shadow-[0_14px_44px_rgba(15,73,110,0.06)]">
            <CircleAlert className="mx-auto h-10 w-10 text-red-500" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-slate-950">Chưa thể tải booking</h2>
            <p className="mt-2 text-sm text-slate-500">{state.message}</p>
            <Button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-5 h-11 rounded-xl bg-primary px-5 text-white">
              <RefreshCw className="h-4 w-4" /> Thử lại
            </Button>
          </div>
        )}
        {state.status === "success" && state.data.items.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-[0_14px_44px_rgba(15,73,110,0.06)]">
            <TicketCheck className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold text-slate-950">Bạn chưa có booking nào</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Chọn một hành trình phù hợp; chỗ chỉ được giữ sau khi bạn xác nhận danh sách khách.</p>
          </div>
        )}
        {state.status === "success" && state.data.items.length > 0 && (
          <>
            <div className="mt-8 grid gap-4">
              {state.data.items.map((booking) => (
                <BookingListItem key={booking.bookingId} booking={booking} tourName={state.tourNames[booking.tourId]} />
              ))}
            </div>
            {state.data.totalPages > 1 && (
              <nav className="mt-7 flex items-center justify-between" aria-label="Phân trang booking">
                <Button type="button" variant="outline" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} className="h-10 rounded-xl">Trang trước</Button>
                <span className="text-sm font-semibold text-slate-500">Trang {page + 1}/{state.data.totalPages}</span>
                <Button type="button" variant="outline" disabled={page + 1 >= state.data.totalPages} onClick={() => setPage((value) => value + 1)} className="h-10 rounded-xl">Trang sau</Button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function BookingListItem({ booking, tourName }: { booking: CustomerBookingItem; tourName: string }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_38px_rgba(15,73,110,0.05)] transition hover:border-sky-200 hover:shadow-[0_18px_46px_rgba(15,73,110,0.09)] sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={booking.status} />
            <span className="text-xs font-semibold text-slate-400">#{booking.bookingId.slice(0, 8).toUpperCase()}</span>
          </div>
          <h2 className="mt-3 text-xl font-bold tracking-[-0.025em] text-slate-950">{tourName}</h2>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-primary" />{formatBookingDate(booking.startDate)}</span>
            <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" />{booking.participantCount} khách</span>
            <strong className="text-[#d9472e]">{formatTourPrice(booking.totalAmount)}</strong>
          </div>
        </div>
        <Link href={`/bookings/${booking.bookingId}`} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-primary hover:text-primary">
          Xem booking <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export function StatusBadge({ status }: { status: CustomerBookingItem["status"] }) {
  const tones: Record<CustomerBookingItem["status"], string> = {
    PENDING: "bg-amber-100 text-amber-800",
    CONFIRMED: "bg-emerald-100 text-emerald-800",
    EXPIRED: "bg-slate-100 text-slate-600",
    PAYMENT_FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-slate-100 text-slate-600",
    COMPLETED: "bg-sky-100 text-sky-800",
    PAYMENT_REVIEW_REQUIRED: "bg-violet-100 text-violet-800",
  };
  return <span className={cn("rounded-full px-3 py-1 text-xs font-bold", tones[status])}>{formatBookingStatus(status)}</span>;
}

function BookingListSkeleton() {
  return <div className="mt-8 space-y-4" role="status" aria-label="Đang tải danh sách booking">{[0, 1, 2].map((item) => <div key={item} className="h-36 animate-pulse rounded-3xl bg-white ring-1 ring-slate-200 motion-reduce:animate-none" />)}<span className="sr-only">Đang tải...</span></div>;
}
