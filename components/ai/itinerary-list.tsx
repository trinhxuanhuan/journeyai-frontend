"use client";

import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  Compass,
  MapPinned,
  PiggyBank,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  formatAiDate,
  formatAiMoney,
  formatItineraryOverview,
  getAiItineraryErrorMessage,
  isCanceledAiRequest,
  listMyAiItineraries,
  type AiItinerary,
  type AiItineraryList,
} from "@/lib/ai-itineraries";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

type ListResult =
  | { requestKey: string; status: "success"; data: AiItineraryList }
  | { requestKey: string; status: "error"; message: string };

export function AiItineraryListView() {
  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<ListResult | null>(null);
  const requestKey = `${page}\u0000${reloadKey}`;
  const state = useMemo(() => result?.requestKey === requestKey ? result : { status: "loading" as const }, [requestKey, result]);

  useEffect(() => {
    const controller = new AbortController();
    listMyAiItineraries(page, PAGE_SIZE, controller.signal)
      .then((data) => setResult({ requestKey, status: "success", data }))
      .catch((error) => {
        if (!isCanceledAiRequest(error)) setResult({ requestKey, status: "error", message: getAiItineraryErrorMessage(error) });
      });
    return () => controller.abort();
  }, [page, requestKey]);

  const totalPages = state.status === "success" ? Math.max(1, Math.ceil(state.data.total / PAGE_SIZE)) : 1;

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[linear-gradient(180deg,#edf8ff_0%,#f6fafc_18rem,#f6fafc_100%)] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Không gian của bạn</p><h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">Hành trình đã lưu</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Mỗi lần tinh chỉnh tạo một revision mới; bản cũ vẫn được ghi trong lịch sử thay đổi.</p></div>
          <Link href="/lap-lich-trinh" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white shadow-[0_10px_28px_rgba(11,116,209,0.22)] transition hover:bg-[#075fae]"><Plus className="h-4 w-4" /> Tạo hành trình mới</Link>
        </div>

        {state.status === "loading" && <ListSkeleton />}

        {state.status === "error" && <div className="mt-9 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm"><CircleAlert className="h-10 w-10 text-red-500" /><h2 className="mt-4 text-xl font-bold text-slate-950">Chưa thể tải hành trình</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{state.message}</p><Button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-5 h-11 rounded-xl"><RefreshCw className="h-4 w-4" /> Thử lại</Button></div>}

        {state.status === "success" && state.data.items.length === 0 && <div className="mt-9 flex min-h-80 flex-col items-center justify-center rounded-[2rem] border border-dashed border-sky-200 bg-white p-8 text-center"><span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-primary"><Sparkles className="h-7 w-7" /></span><h2 className="mt-5 text-2xl font-bold text-slate-950">Bắt đầu hành trình đầu tiên</h2><p className="mt-2 max-w-md text-sm leading-6 text-slate-500">Chọn điểm đến, ngân sách và người đồng hành; planner sẽ xây một lịch trình có thể kiểm tra và chỉnh sửa.</p><Link href="/lap-lich-trinh" className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-white">Lập lịch trình <ArrowRight className="h-4 w-4" /></Link></div>}

        {state.status === "success" && state.data.items.length > 0 && <>
          <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{state.data.items.map((itinerary) => <ItineraryCard key={itinerary.id} itinerary={itinerary} />)}</div>
          {totalPages > 1 && <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Phân trang hành trình"><Button type="button" variant="outline" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-xl">Trang trước</Button><span className="text-sm font-semibold text-slate-500">Trang {page + 1}/{totalPages}</span><Button type="button" variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-xl">Trang sau</Button></nav>}
        </>}
      </div>
    </main>
  );
}

function ItineraryCard({ itinerary }: { itinerary: AiItinerary }) {
  const coverage = itinerary.qualitySummary.catalogCoverage;
  const status = itinerary.costEstimate.status;
  return <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_44px_rgba(15,73,110,0.06)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_20px_54px_rgba(15,73,110,0.11)]">
    <div className="relative bg-[linear-gradient(135deg,#073b60,#0b74d1)] p-6 text-white"><div className="flex items-center justify-between gap-3"><span className={cn("rounded-full px-2.5 py-1 text-[0.65rem] font-bold", coverage === "CURATED" ? "bg-emerald-300/20 text-emerald-100" : "bg-amber-300/20 text-amber-100")}>{coverage === "CURATED" ? "Đã kiểm duyệt" : "Khung tham khảo"}</span><span className="text-xs font-semibold text-sky-200">v{itinerary.revision}</span></div><h2 className="mt-5 text-2xl font-bold tracking-[-0.035em]">{itinerary.destinationDisplayName}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-sky-100">{formatItineraryOverview(itinerary.overview)}</p></div>
    <div className="flex flex-1 flex-col p-6"><div className="grid grid-cols-2 gap-3 text-xs text-slate-500"><CardFact icon={CalendarDays} value={`${itinerary.days} ngày`} /><CardFact icon={Users} value={`${itinerary.travelerCount} khách`} /><CardFact icon={PiggyBank} value={formatAiMoney(itinerary.budget)} /><CardFact icon={MapPinned} value={formatAiDate(itinerary.startDate)} /></div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5"><span className={cn("rounded-full px-3 py-1.5 text-xs font-bold", status === "WITHIN_BUDGET" ? "bg-emerald-50 text-emerald-700" : status === "TIGHT" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700")}>{status === "WITHIN_BUDGET" ? "Trong ngân sách" : status === "TIGHT" ? "Ngân sách sát mức" : "Vượt ngân sách"}</span><Link href={`/hanh-trinh/${itinerary.id}`} aria-label={`Mở hành trình ${itinerary.destinationDisplayName}`} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-primary transition group-hover:bg-primary group-hover:text-white"><ArrowRight className="h-4 w-4" /></Link></div></div>
  </article>;
}

function CardFact({ icon: Icon, value }: { icon: typeof Compass; value: string }) {
  return <span className="flex min-w-0 items-center gap-2"><Icon className="h-4 w-4 shrink-0 text-primary" /><span className="truncate">{value}</span></span>;
}

function ListSkeleton() {
  return <div className="mt-9 grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Đang tải hành trình">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-80 animate-pulse rounded-3xl bg-white ring-1 ring-slate-200 motion-reduce:animate-none" />)}<span className="sr-only">Đang tải...</span></div>;
}
