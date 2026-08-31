"use client";

import {
  ArrowLeft,
  Check,
  CircleAlert,
  Copy,
  History,
  Link2,
  Loader2,
  RefreshCw,
  Share2,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { ItineraryPresentation } from "@/components/ai/itinerary-presentation";
import { Button } from "@/components/ui/button";
import {
  getAiItinerary,
  getAiItineraryErrorMessage,
  isCanceledAiRequest,
  isValidAiItineraryId,
  refineAiItinerary,
  shareAiItinerary,
  type AiItinerary,
} from "@/lib/ai-itineraries";

type DetailResult =
  | { requestKey: string; status: "success"; itinerary: AiItinerary }
  | { requestKey: string; status: "error"; message: string };

export function AiItineraryDetail({ itineraryId, newlyCreated }: { itineraryId: string; newlyCreated: boolean }) {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<DetailResult | null>(null);
  const [instruction, setInstruction] = useState("");
  const [lockedDayNumbers, setLockedDayNumbers] = useState<number[]>([]);
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const requestKey = `${itineraryId}\u0000${reloadKey}`;

  const state = useMemo(() => {
    if (!isValidAiItineraryId(itineraryId)) {
      return { status: "error" as const, message: "Mã hành trình không hợp lệ." };
    }
    return result?.requestKey === requestKey ? result : { status: "loading" as const };
  }, [itineraryId, requestKey, result]);

  useEffect(() => {
    if (!isValidAiItineraryId(itineraryId)) return;
    const controller = new AbortController();
    getAiItinerary(itineraryId, controller.signal)
      .then((itinerary) => setResult({ requestKey, status: "success", itinerary }))
      .catch((error) => {
        if (!isCanceledAiRequest(error)) {
          setResult({ requestKey, status: "error", message: getAiItineraryErrorMessage(error) });
        }
      });
    return () => controller.abort();
  }, [itineraryId, requestKey]);

  const toggleDayLock = (dayNumber: number) => {
    setLockedDayNumbers((current) => current.includes(dayNumber) ? current.filter((item) => item !== dayNumber) : [...current, dayNumber].sort((a, b) => a - b));
  };

  const refine = async () => {
    if (state.status !== "success" || refining || instruction.trim().length < 5) return;
    setRefining(true);
    setRefineError(null);
    try {
      const itinerary = await refineAiItinerary(state.itinerary.id, instruction, lockedDayNumbers);
      setResult({ requestKey, status: "success", itinerary });
      setInstruction("");
      toast.success(`Đã cập nhật hành trình lên phiên bản ${itinerary.revision}.`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setRefineError(getAiItineraryErrorMessage(error));
    } finally {
      setRefining(false);
    }
  };

  const share = async () => {
    if (state.status !== "success" || sharing) return;
    setSharing(true);
    try {
      const token = await shareAiItinerary(state.itinerary.id);
      const url = `${window.location.origin}/hanh-trinh/chia-se/${token}`;
      setShareUrl(url);
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Đã sao chép liên kết chia sẻ.");
      } catch {
        toast.success("Đã tạo liên kết. Bạn có thể sao chép ở khung bên dưới.");
      }
    } catch (error) {
      toast.error(getAiItineraryErrorMessage(error));
    } finally {
      setSharing(false);
    }
  };

  if (state.status === "loading") return <ItineraryDetailSkeleton />;
  if (state.status === "error") return <ItineraryDetailError message={state.message} onRetry={() => setReloadKey((value) => value + 1)} />;

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[#f6fafc] pb-20">
      <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/hanh-trinh" className="inline-flex items-center gap-2 rounded-md text-sm font-bold text-slate-500 transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"><ArrowLeft className="h-4 w-4" /> Hành trình của tôi</Link>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setReloadKey((value) => value + 1)} className="h-10 rounded-xl"><RefreshCw className="h-4 w-4" /> Làm mới</Button>
            <Button type="button" onClick={share} disabled={sharing} className="h-10 rounded-xl bg-primary text-white hover:bg-[#075fae]">{sharing ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Share2 className="h-4 w-4" />} Chia sẻ</Button>
          </div>
        </div>

        {newlyCreated && <div className="mt-5 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800"><Check className="mt-0.5 h-5 w-5 shrink-0" /><span><strong className="block">Hành trình đã được tạo và lưu.</strong>Bạn có thể chỉnh tiếp bằng câu lệnh tiếng Việt hoặc chia sẻ bản chỉ đọc.</span></div>}

        {shareUrl && <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 sm:flex-row sm:items-center"><Link2 className="h-5 w-5 shrink-0 text-primary" /><input readOnly value={shareUrl} aria-label="Liên kết chia sẻ hành trình" className="h-10 min-w-0 flex-1 rounded-xl border border-sky-200 bg-white px-3 text-sm text-slate-700 outline-none" /><Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(shareUrl).then(() => toast.success("Đã sao chép liên kết.")).catch(() => toast.error("Không thể sao chép tự động. Hãy sao chép trực tiếp trong ô."))} className="h-10 rounded-xl bg-white"><Copy className="h-4 w-4" /> Sao chép</Button></div>}

        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <ItineraryPresentation itinerary={state.itinerary} lockedDayNumbers={lockedDayNumbers} onToggleDayLock={toggleDayLock} />

          <aside className="xl:sticky xl:top-24">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,73,110,0.1)]">
              <div className="bg-[linear-gradient(135deg,#062b4a,#075f97)] p-6 text-white"><WandSparkles className="h-6 w-6 text-amber-300" /><h2 className="mt-4 text-xl font-bold">Tinh chỉnh bằng tiếng Việt</h2><p className="mt-2 text-sm leading-6 text-sky-100">Planner chỉ áp dụng những thay đổi hiểu được và giữ nguyên các ngày bạn đã khóa.</p></div>
              <div className="p-6">
                <label htmlFor="refine-instruction" className="text-sm font-bold text-slate-800">Bạn muốn thay đổi điều gì?</label>
                <textarea id="refine-instruction" value={instruction} onChange={(event) => setInstruction(event.target.value)} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); void refine(); } }} rows={6} maxLength={500} placeholder="Ví dụ: Làm ngày 2 nhẹ hơn, bỏ Đại Nội Huế và giảm ngân sách xuống 5 triệu..." className="mt-3 w-full resize-y rounded-2xl border border-slate-300 p-4 text-sm leading-6 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" />
                <div className="mt-2 flex justify-between text-xs text-slate-400"><span>Ctrl/⌘ + Enter để gửi</span><span>{instruction.length}/500</span></div>

                {lockedDayNumbers.length > 0 && <div className="mt-4 rounded-xl bg-sky-50 p-3 text-xs leading-5 text-sky-800"><strong>Ngày đang khóa:</strong> {lockedDayNumbers.join(", ")}</div>}
                {refineError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm leading-5 text-red-700" role="alert">{refineError}</p>}
                <Button type="button" onClick={refine} disabled={refining || instruction.trim().length < 5} className="mt-5 h-12 w-full rounded-xl bg-primary font-bold text-white hover:bg-[#075fae]">{refining ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <Sparkles className="h-4 w-4" />}{refining ? "Đang kiểm tra và cập nhật..." : "Cập nhật hành trình"}</Button>
                <p className="mt-3 text-xs leading-5 text-slate-400">Nếu yêu cầu không ánh xạ được thành ràng buộc cụ thể, hệ thống sẽ cảnh báo thay vì giả vờ đã sửa.</p>
              </div>
            </div>

            {state.itinerary.refinementHistory.length > 0 && <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6"><h2 className="flex items-center gap-2 font-bold text-slate-950"><History className="h-4 w-4 text-primary" /> Lịch sử phiên bản</h2><ol className="mt-4 space-y-3">{state.itinerary.refinementHistory.slice().reverse().map((entry) => <li key={entry.revision} className="border-l-2 border-sky-100 pl-3 text-xs leading-5 text-slate-500"><strong className="block text-slate-800">Phiên bản {entry.revision}</strong>{entry.instruction}</li>)}</ol></div>}
          </aside>
        </div>
      </div>
    </main>
  );
}

function ItineraryDetailSkeleton() {
  return <main className="min-h-[calc(100vh-4.5rem)] bg-[#f6fafc] px-5 py-10 sm:px-8" role="status" aria-label="Đang tải hành trình"><div className="mx-auto max-w-7xl animate-pulse space-y-6 motion-reduce:animate-none"><div className="h-80 rounded-[2rem] bg-slate-200" /><div className="h-64 rounded-[2rem] bg-white ring-1 ring-slate-200" /><div className="h-96 rounded-[2rem] bg-white ring-1 ring-slate-200" /></div><span className="sr-only">Đang tải...</span></main>;
}

function ItineraryDetailError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <main className="flex min-h-[70vh] items-center justify-center bg-[#f6fafc] px-5"><div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><CircleAlert className="mx-auto h-10 w-10 text-amber-500" /><h1 className="mt-4 text-2xl font-bold text-slate-950">Chưa thể mở hành trình</h1><p className="mt-2 text-sm leading-6 text-slate-500">{message}</p><div className="mt-6 flex justify-center gap-3"><Link href="/hanh-trinh" className="inline-flex h-11 items-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Quay lại</Link><Button type="button" onClick={onRetry} className="h-11 rounded-xl bg-primary px-5 text-white">Thử lại</Button></div></div></main>;
}
