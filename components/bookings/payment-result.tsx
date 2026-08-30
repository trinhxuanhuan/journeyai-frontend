"use client";

import { CheckCircle2, CircleAlert, Clock3, Loader2, RefreshCw, XCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  clearRequestKey,
  getBookingRequestErrorMessage,
  getPayment,
  isCanceledBookingRequest,
  type PaymentStatus,
} from "@/lib/bookings";
import { formatTourPrice } from "@/lib/tours";

type ResultState =
  | { status: "invalid" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; payment: PaymentStatus };

export function PaymentResultView({ paymentId, bookingId, gatewayResult }: { paymentId: string | null; bookingId: string | null; gatewayResult: string | null }) {
  const [state, setState] = useState<ResultState>(
    paymentId && bookingId && gatewayResult !== "invalid" ? { status: "loading" } : { status: "invalid" }
  );
  const [pollAttempts, setPollAttempts] = useState(0);

  const loadPayment = useCallback(async (signal?: AbortSignal) => {
    if (!paymentId || !bookingId || gatewayResult === "invalid") return;
    try {
      const payment = await getPayment(paymentId, signal);
      if (payment.bookingId !== bookingId) {
        setState({ status: "invalid" });
        return;
      }
      setState({ status: "success", payment });
      if (payment.status !== "INITIATED") {
        clearRequestKey(sessionStorage, `payment:${bookingId}`);
      }
    } catch (error) {
      if (signal?.aborted || isCanceledBookingRequest(error)) return;
      setState({ status: "error", message: getBookingRequestErrorMessage(error) });
    }
  }, [bookingId, gatewayResult, paymentId]);

  useEffect(() => {
    if (!paymentId || !bookingId || gatewayResult === "invalid") return;
    const controller = new AbortController();
    getPayment(paymentId, controller.signal)
      .then((payment) => {
        if (payment.bookingId !== bookingId) {
          setState({ status: "invalid" });
          return;
        }
        setState({ status: "success", payment });
        if (payment.status !== "INITIATED") {
          clearRequestKey(sessionStorage, `payment:${bookingId}`);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isCanceledBookingRequest(error)) return;
        setState({ status: "error", message: getBookingRequestErrorMessage(error) });
      });
    return () => controller.abort();
  }, [bookingId, gatewayResult, paymentId]);

  useEffect(() => {
    if (state.status !== "success" || state.payment.status !== "INITIATED" || pollAttempts >= 20) return;
    const timeout = window.setTimeout(() => {
      setPollAttempts((value) => value + 1);
      loadPayment();
    }, 2500);
    return () => window.clearTimeout(timeout);
  }, [loadPayment, pollAttempts, state]);

  if (state.status === "invalid") {
    return <ResultCard tone="error" icon={<CircleAlert />} title="Không thể xác minh lượt quay về" message="Thông tin từ cổng thanh toán bị thiếu hoặc không hợp lệ. Không có booking nào được xác nhận chỉ dựa trên URL này." bookingId={bookingId} />;
  }
  if (state.status === "loading") {
    return <ResultCard tone="pending" icon={<Loader2 className="animate-spin motion-reduce:animate-none" />} title="Đang kiểm tra thanh toán" message="Việt Khám Phá đang đọc trạng thái trực tiếp từ hệ thống thanh toán." bookingId={bookingId} />;
  }
  if (state.status === "error") {
    return <ResultCard tone="error" icon={<CircleAlert />} title="Chưa thể đọc trạng thái" message={state.message} bookingId={bookingId} onRetry={() => { setPollAttempts(0); setState({ status: "loading" }); loadPayment(); }} />;
  }

  const payment = state.payment;
  if (payment.status === "SUCCESS") {
    return <ResultCard tone="success" icon={<CheckCircle2 />} title="Thanh toán đã được xác nhận" message={`VNPay đã xác nhận giao dịch ${formatTourPrice(payment.amount)}. Booking có thể cần vài giây để nhận trạng thái mới từ hệ thống sự kiện.`} bookingId={bookingId} />;
  }
  if (payment.status === "FAILED" || payment.status === "CANCELLED") {
    return <ResultCard tone="error" icon={<XCircle />} title="Thanh toán chưa thành công" message="Giao dịch không hoàn tất. Bạn có thể quay lại booking để xem trạng thái giữ chỗ trước khi thử lại." bookingId={bookingId} />;
  }
  return <ResultCard tone="pending" icon={<Clock3 />} title="VNPay đang xử lý giao dịch" message={pollAttempts >= 20 ? "Việc xác nhận đang lâu hơn bình thường. Bạn có thể làm mới hoặc quay lại booking; vui lòng không tạo giao dịch mới." : "Đã nhận lượt quay về nhưng IPN chưa xác nhận trạng thái cuối. Trang sẽ tự kiểm tra lại."} bookingId={bookingId} onRetry={() => { setPollAttempts(0); loadPayment(); }} />;
}

function ResultCard({ tone, icon, title, message, bookingId, onRetry }: { tone: "success" | "pending" | "error"; icon: React.ReactNode; title: string; message: string; bookingId: string | null; onRetry?: () => void }) {
  const toneClass = tone === "success" ? "bg-emerald-50 text-emerald-700" : tone === "pending" ? "bg-sky-50 text-primary" : "bg-red-50 text-red-600";
  return (
    <main className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-5 py-12">
      <div className="w-full max-w-xl rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,73,110,0.1)] sm:p-10">
        <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full [&_svg]:h-8 [&_svg]:w-8 ${toneClass}`}>{icon}</span>
        <p className="mt-6 text-xs font-bold tracking-[0.16em] text-primary uppercase">Kết quả thanh toán</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950">{title}</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">{message}</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {onRetry && <Button type="button" variant="outline" onClick={onRetry} className="h-11 rounded-xl"><RefreshCw className="h-4 w-4" /> Kiểm tra lại</Button>}
          {bookingId ? <Link href={`/bookings/${bookingId}`} className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-[#075fae]">Xem booking</Link> : <Link href="/bookings" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-white transition hover:bg-[#075fae]">Booking của tôi</Link>}
        </div>
      </div>
    </main>
  );
}
