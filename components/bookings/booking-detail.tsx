"use client";

import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Clock3,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { StatusBadge } from "@/components/bookings/booking-list";
import { Button } from "@/components/ui/button";
import {
  cancelBooking,
  createPayment,
  formatBookingDate,
  formatHoldDuration,
  getBooking,
  getBookingRequestErrorMessage,
  getOrCreateRequestKey,
  getRemainingHoldSeconds,
  isAllowedPaymentRedirectUrl,
  isCanceledBookingRequest,
  parseCommercialSnapshot,
  type BookingDetail,
} from "@/lib/bookings";
import { formatTourPrice } from "@/lib/tours";

type DetailState =
  | { requestKey: string; status: "error"; message: string }
  | { requestKey: string; status: "success"; booking: BookingDetail };

export function BookingDetailView({ bookingId, newlyCreated }: { bookingId: string; newlyCreated: boolean }) {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<DetailState | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [cancelConfirming, setCancelConfirming] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const expiredRefreshTriggered = useRef(false);
  const requestKey = `${bookingId}\u0000${reloadKey}`;
  const state = useMemo(
    () => result?.requestKey === requestKey ? result : { status: "loading" as const },
    [requestKey, result]
  );

  useEffect(() => {
    const controller = new AbortController();
    getBooking(bookingId, controller.signal)
      .then((booking) => {
        setResult({ requestKey, status: "success", booking });
        setRemainingSeconds(getRemainingHoldSeconds(booking.holdExpiresAt));
        expiredRefreshTriggered.current = false;
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isCanceledBookingRequest(error)) return;
        setResult({ requestKey, status: "error", message: getBookingRequestErrorMessage(error) });
      });
    return () => controller.abort();
  }, [bookingId, requestKey]);

  useEffect(() => {
    if (state.status !== "success" || state.booking.status !== "PENDING") return;
    const update = () => {
      const remaining = getRemainingHoldSeconds(state.booking.holdExpiresAt);
      setRemainingSeconds(remaining);
      if (remaining === 0 && !expiredRefreshTriggered.current) {
        expiredRefreshTriggered.current = true;
        window.setTimeout(() => setReloadKey((value) => value + 1), 1200);
      }
    };
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [state]);

  const snapshot = useMemo(
    () => state.status === "success" ? parseCommercialSnapshot(state.booking.commercialSnapshot) : null,
    [state]
  );

  if (state.status === "loading") return <DetailSkeleton />;
  if (state.status === "error") {
    return <DetailMessage title="Chưa thể mở booking" message={state.message} onRetry={() => setReloadKey((value) => value + 1)} />;
  }

  const { booking } = state;
  const priceBreakdown = snapshot?.priceBreakdown;
  const tourName = snapshot?.name ?? "Hành trình Việt Khám Phá";
  const canPay = booking.status === "PENDING" && remainingSeconds > 0;

  const handlePayment = async () => {
    if (!canPay || paymentLoading) return;
    setPaymentLoading(true);
    setPaymentError(null);
    try {
      const payload = { bookingId: booking.bookingId, gateway: "VNPAY" };
      const key = getOrCreateRequestKey(sessionStorage, `payment:${booking.bookingId}`, payload);
      const payment = await createPayment(booking.bookingId, key);
      if (!isAllowedPaymentRedirectUrl(payment.redirectUrl)) {
        throw new Error("Cổng thanh toán trả về địa chỉ không được phép");
      }
      window.location.assign(payment.redirectUrl);
    } catch (error) {
      setPaymentError(getBookingRequestErrorMessage(error));
      setPaymentLoading(false);
    }
  };

  const handleCancel = async () => {
    if (cancelLoading) return;
    setCancelLoading(true);
    setPaymentError(null);
    try {
      await cancelBooking(booking.bookingId);
      setCancelConfirming(false);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setPaymentError(getBookingRequestErrorMessage(error));
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-6xl px-5 pt-7 sm:px-8">
        <Link href="/bookings" className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-500 transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Tất cả booking
        </Link>

        {newlyCreated && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            Booking đã được tạo và giá đã được khóa. Hoàn tất thanh toán trước khi đồng hồ kết thúc.
          </div>
        )}

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_44px_rgba(15,73,110,0.06)] sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={booking.status} />
                    <span className="text-xs font-semibold text-slate-400">#{booking.bookingId.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <h1 className="mt-4 text-3xl font-bold tracking-[-0.04em] text-slate-950">{tourName}</h1>
                  <p className="mt-2 text-sm text-slate-500">{booking.bookingType === "GROUP" ? "Tour ghép trọn gói" : "Tour riêng theo nhóm"}</p>
                </div>
                <strong className="text-2xl font-bold text-[#e84f35]">{formatTourPrice(booking.totalAmount)}</strong>
              </div>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <BookingFact icon={CalendarDays} label="Khởi hành" value={formatBookingDate(booking.startDate)} />
                <BookingFact icon={CalendarDays} label="Kết thúc" value={formatBookingDate(booking.endDate)} />
                <BookingFact icon={Users} label="Quy mô" value={`${booking.participantCount} khách`} />
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_44px_rgba(15,73,110,0.06)] sm:p-8" aria-labelledby="traveler-heading">
              <h2 id="traveler-heading" className="text-xl font-bold text-slate-950">Người tham gia</h2>
              <div className="mt-5 divide-y divide-slate-100 rounded-2xl border border-slate-200 px-4">
                {booking.participants.map((participant, index) => (
                  <div key={`${participant.fullName}-${index}`} className="flex items-start justify-between gap-4 py-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 text-primary"><UserRound className="h-4 w-4" /></span>
                      <div className="min-w-0">
                        <strong className="block text-sm text-slate-900">{participant.fullName}</strong>
                        <span className="mt-1 block text-xs text-slate-500">{participant.phone ?? "Không cung cấp số điện thoại"}{participant.primaryContact ? " · Liên hệ chính" : ""}</span>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{participant.participantType === "ADULT" ? "Người lớn" : "Trẻ em"}</span>
                  </div>
                ))}
              </div>
            </section>

            {priceBreakdown && (
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_14px_44px_rgba(15,73,110,0.06)] sm:p-8" aria-labelledby="price-heading">
                <h2 id="price-heading" className="text-xl font-bold text-slate-950">Giá đã khóa tại thời điểm đặt</h2>
                <dl className="mt-5 divide-y divide-slate-100">
                  <PriceRow label="Giá gói theo số khách" value={priceBreakdown.packageAmount} />
                  {priceBreakdown.singleRoomSupplementAmount > 0 && <PriceRow label="Phụ thu phòng đơn" value={priceBreakdown.singleRoomSupplementAmount} />}
                  {priceBreakdown.optionalGuideAmount > 0 && <PriceRow label="Hướng dẫn viên tùy chọn" value={priceBreakdown.optionalGuideAmount} />}
                  <PriceRow label="Tổng thanh toán" value={priceBreakdown.totalAmount} strong />
                </dl>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,73,110,0.1)]">
              <div className="bg-[linear-gradient(135deg,#eaf7ff,#ffffff)] p-6">
                {booking.status === "PENDING" ? (
                  <>
                    <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Thời gian giữ chỗ</p>
                    <strong className="mt-2 block font-mono text-4xl font-bold text-slate-950" aria-live="polite">{formatHoldDuration(remainingSeconds)}</strong>
                    <p className="mt-2 text-xs leading-5 text-slate-500">Sau thời gian này, booking không thể tiếp tục thanh toán.</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Trạng thái booking</p>
                    <strong className="mt-3 block text-xl font-bold text-slate-950">{booking.status === "CONFIRMED" ? "Hành trình đã sẵn sàng" : "Booking đã được cập nhật"}</strong>
                  </>
                )}
              </div>
              <div className="p-6">
                {booking.status === "PENDING" && (
                  <Button type="button" onClick={handlePayment} disabled={!canPay || paymentLoading} className="h-12 w-full rounded-xl bg-primary font-bold text-white shadow-[0_12px_28px_rgba(11,116,209,0.2)] hover:bg-[#075fae]">
                    {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <CreditCard className="h-4 w-4" />}
                    {paymentLoading ? "Đang mở VNPay..." : remainingSeconds > 0 ? "Thanh toán qua VNPay" : "Đã hết thời gian giữ chỗ"}
                  </Button>
                )}
                {booking.status === "CONFIRMED" && (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"><ShieldCheck className="mb-2 h-5 w-5" />Thanh toán đã được xác nhận. Thông tin hành trình sẽ tiếp tục được cập nhật tại đây.</div>
                )}
                {booking.status === "PAYMENT_REVIEW_REQUIRED" && (
                  <div className="rounded-2xl border border-violet-100 bg-violet-50 p-4 text-sm leading-6 text-violet-800">Giao dịch đến muộn và đang được đối soát. Vui lòng không thanh toán lại.</div>
                )}
                {paymentError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-700" role="alert">{paymentError}</p>}

                <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
                  <p className="flex items-start gap-2"><Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />Trạng thái thanh toán được xác nhận từ VNPay qua máy chủ.</p>
                  {booking.singleRoomCount > 0 && <p className="flex items-start gap-2"><BedDouble className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{booking.singleRoomCount} phòng đơn đã được tính vào giá.</p>}
                </div>

                {booking.status === "CONFIRMED" && !cancelConfirming && (
                  <Button type="button" variant="outline" onClick={() => setCancelConfirming(true)} className="mt-5 h-10 w-full rounded-xl text-slate-600">Yêu cầu hủy booking</Button>
                )}
                {booking.status === "CONFIRMED" && cancelConfirming && (
                  <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
                    <p className="text-sm leading-6 text-red-800">Mức hoàn tiền được tính từ chính sách đã lưu khi đặt. Bạn chắc chắn muốn hủy?</p>
                    <div className="mt-3 flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setCancelConfirming(false)} disabled={cancelLoading} className="flex-1">Quay lại</Button>
                      <Button type="button" variant="destructive" onClick={handleCancel} disabled={cancelLoading} className="flex-1">{cancelLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Xác nhận hủy</Button>
                    </div>
                  </div>
                )}

                <Button type="button" variant="ghost" onClick={() => setReloadKey((value) => value + 1)} className="mt-3 h-10 w-full text-slate-500"><RefreshCw className="h-4 w-4" /> Làm mới trạng thái</Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function BookingFact({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><Icon className="h-5 w-5 text-primary" /><span className="mt-3 block text-[0.68rem] font-bold tracking-[0.1em] text-slate-400 uppercase">{label}</span><strong className="mt-1 block text-sm text-slate-800">{value}</strong></div>;
}

function PriceRow({ label, value, strong = false }: { label: string; value: number; strong?: boolean }) {
  return <div className="flex items-start justify-between gap-4 py-3 text-sm"><dt className={strong ? "font-bold text-slate-900" : "text-slate-500"}>{label}</dt><dd className={strong ? "text-lg font-bold text-[#d9472e]" : "font-semibold text-slate-800"}>{formatTourPrice(value)}</dd></div>;
}

function DetailSkeleton() {
  return <div className="mx-auto min-h-[70vh] max-w-6xl animate-pulse px-5 py-10 motion-reduce:animate-none"><div className="h-[34rem] rounded-3xl bg-white ring-1 ring-slate-200" /></div>;
}

function DetailMessage({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return <div className="flex min-h-[70vh] items-center justify-center px-5"><div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center"><CircleAlert className="mx-auto h-10 w-10 text-amber-500" /><h1 className="mt-4 text-2xl font-bold text-slate-950">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{message}</p><Button type="button" onClick={onRetry} className="mt-5 h-11 rounded-xl bg-primary px-5 text-white">Thử lại</Button></div></div>;
}
