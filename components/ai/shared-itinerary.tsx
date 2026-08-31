"use client";

import { ArrowRight, CircleAlert, Loader2, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ItineraryPresentation } from "@/components/ai/itinerary-presentation";
import { Button } from "@/components/ui/button";
import {
  getAiItineraryErrorMessage,
  getSharedAiItinerary,
  isCanceledAiRequest,
  isValidAiShareToken,
  type AiItinerary,
} from "@/lib/ai-itineraries";

type SharedResult =
  | { requestKey: string; status: "success"; itinerary: AiItinerary }
  | { requestKey: string; status: "error"; message: string };

export function SharedItineraryView({ shareToken }: { shareToken: string }) {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<SharedResult | null>(null);
  const requestKey = `${shareToken}\u0000${reloadKey}`;
  const state = useMemo(() => {
    if (!isValidAiShareToken(shareToken)) return { status: "error" as const, message: "Liên kết chia sẻ không hợp lệ." };
    return result?.requestKey === requestKey ? result : { status: "loading" as const };
  }, [requestKey, result, shareToken]);

  useEffect(() => {
    if (!isValidAiShareToken(shareToken)) return;
    const controller = new AbortController();
    getSharedAiItinerary(shareToken, controller.signal)
      .then((itinerary) => setResult({ requestKey, status: "success", itinerary }))
      .catch((error) => {
        if (!isCanceledAiRequest(error)) setResult({ requestKey, status: "error", message: getAiItineraryErrorMessage(error) });
      });
    return () => controller.abort();
  }, [requestKey, shareToken]);

  if (state.status === "loading") return <div className="flex min-h-[70vh] items-center justify-center bg-[#f6fafc] text-slate-500" role="status"><Loader2 className="mr-2 h-5 w-5 animate-spin motion-reduce:animate-none" /> Đang mở hành trình...</div>;
  if (state.status === "error") return <div className="flex min-h-[70vh] items-center justify-center bg-[#f6fafc] px-5"><div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center"><CircleAlert className="mx-auto h-10 w-10 text-amber-500" /><h1 className="mt-4 text-2xl font-bold text-slate-950">Không mở được liên kết</h1><p className="mt-2 text-sm leading-6 text-slate-500">{state.message}</p><Button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-5 h-11 rounded-xl"><RefreshCw className="h-4 w-4" /> Thử lại</Button></div></div>;

  return <main className="min-h-[calc(100vh-4.5rem)] bg-[#f6fafc] pb-20"><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8"><ItineraryPresentation itinerary={state.itinerary} publicView /><section className="mt-8 flex flex-col items-start justify-between gap-5 rounded-3xl bg-[linear-gradient(135deg,#062b4a,#075f97)] p-6 text-white sm:flex-row sm:items-center sm:p-8"><div className="flex gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10"><Sparkles className="h-5 w-5 text-amber-300" /></span><div><h2 className="text-xl font-bold">Tạo một hành trình theo cách của bạn</h2><p className="mt-1 text-sm leading-6 text-sky-100">Thay đổi ngân sách, nhịp độ và nhóm đồng hành mà không ảnh hưởng bản đang xem.</p></div></div><Link href="/lap-lich-trinh" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#f4b63f] px-5 text-sm font-bold text-slate-950">Bắt đầu lập lịch <ArrowRight className="h-4 w-4" /></Link></section></div></main>;
}
