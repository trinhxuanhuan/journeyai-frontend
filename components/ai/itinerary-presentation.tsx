import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  BedDouble,
  Bike,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock3,
  Coffee,
  Compass,
  Footprints,
  Info,
  Landmark,
  Lightbulb,
  MapPin,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";

import {
  formatAiDate,
  formatAiMoney,
  formatItineraryOverview,
  type AiActivity,
  type AiItinerary,
} from "@/lib/ai-itineraries";
import { cn } from "@/lib/utils";

const PACE_LABELS = { RELAXED: "Thư thả", BALANCED: "Cân bằng", ACTIVE: "Năng động" } as const;
const PROFILE_LABELS = { SOLO: "Đi một mình", COUPLE: "Cặp đôi", FAMILY: "Gia đình", FRIENDS: "Nhóm bạn", SENIORS: "Người cao tuổi" } as const;
const TRAVEL_STYLE_LABELS = { ECONOMY: "Tiết kiệm", COMFORT: "Thoải mái", PREMIUM: "Cao cấp" } as const;
const PERIOD_LABELS: Record<string, string> = { MORNING: "Buổi sáng", AFTERNOON: "Buổi chiều", EVENING: "Buổi tối" };

export function ItineraryPresentation({
  itinerary,
  lockedDayNumbers = [],
  onToggleDayLock,
  publicView = false,
}: {
  itinerary: AiItinerary;
  lockedDayNumbers?: number[];
  onToggleDayLock?: (dayNumber: number) => void;
  publicView?: boolean;
}) {
  const { costEstimate, qualitySummary } = itinerary;
  const qualityTone = qualitySummary.score >= 80 ? "text-emerald-700 bg-emerald-50" : qualitySummary.score >= 60 ? "text-amber-700 bg-amber-50" : "text-red-700 bg-red-50";

  return (
    <div className="space-y-7">
      {publicView && (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          Đây là bản chia sẻ chỉ đọc. Thông tin người tạo và lịch sử chỉnh sửa không được hiển thị.
        </div>
      )}

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_64px_rgba(15,73,110,0.09)]">
        <div className="bg-[linear-gradient(135deg,#062b4a,#075f97)] p-6 text-white sm:p-9">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold backdrop-blur">Phiên bản {itinerary.revision}</span>
            <span className={cn("rounded-full px-3 py-1.5 text-xs font-bold", qualitySummary.catalogCoverage === "CURATED" ? "bg-emerald-400/20 text-emerald-100" : "bg-amber-300/20 text-amber-100")}>{qualitySummary.catalogCoverage === "CURATED" ? "Dữ liệu đã kiểm duyệt" : "Khung tham khảo chung"}</span>
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-[-0.04em] sm:text-5xl">{itinerary.destinationDisplayName}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-sky-100 sm:text-base">{formatItineraryOverview(itinerary.overview)}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <HeroFact icon={CalendarDays} label="Thời lượng" value={`${itinerary.days} ngày`} />
            <HeroFact icon={Users} label="Nhóm đi" value={`${itinerary.travelerCount} khách · ${PROFILE_LABELS[itinerary.groupProfile]}`} />
            <HeroFact icon={Compass} label="Nhịp độ" value={PACE_LABELS[itinerary.pace]} />
            <HeroFact icon={PiggyBank} label="Ngân sách" value={formatAiMoney(itinerary.budget)} />
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 bg-white p-5 sm:grid-cols-3 sm:p-7">
          <div className={cn("rounded-2xl p-4", qualityTone)}><span className="text-xs font-bold tracking-[0.12em] uppercase">Điểm chất lượng</span><strong className="mt-1 block text-3xl">{qualitySummary.score}/100</strong></div>
          <QualityFact good={qualitySummary.budgetFit} label="Khớp ngân sách" />
          <QualityFact good={qualitySummary.scheduleFeasible} label="Lịch trình khả thi" />
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="budget-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Dự toán minh bạch</p>
            <h2 id="budget-heading" className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">Ngân sách cho cả nhóm</h2>
          </div>
          <BudgetStatus status={costEstimate.status} />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <CostCard icon={BedDouble} label="Lưu trú" value={costEstimate.accommodation} />
          <CostCard icon={Car} label="Đi lại nội vùng" value={costEstimate.transport} />
          <CostCard icon={Coffee} label="Ăn uống" value={costEstimate.meals} />
          <CostCard icon={Ticket} label="Hoạt động" value={costEstimate.activities} />
          <CostCard icon={ShieldCheck} label="Dự phòng" value={costEstimate.contingency} />
        </div>

        <div className="mt-5 grid gap-3 rounded-2xl bg-slate-950 p-5 text-white sm:grid-cols-3">
          <MoneySummary label="Tổng dự toán" value={costEstimate.total} />
          <MoneySummary label="Ngân sách đặt ra" value={costEstimate.budget} />
          <MoneySummary label={costEstimate.remaining >= 0 ? "Còn dự kiến" : "Vượt dự kiến"} value={Math.abs(costEstimate.remaining)} accent={costEstimate.remaining < 0} />
        </div>

        <p className="mt-4 text-xs leading-5 text-slate-500">Mức chi tiêu: {TRAVEL_STYLE_LABELS[costEstimate.travelStyle]}. Giá và thời gian là dữ liệu tham khảo, không phải báo giá hoặc tình trạng theo thời gian thực.</p>
      </section>

      {itinerary.budgetAdjustments.length > 0 && (
        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3"><Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h2 className="font-bold text-amber-950">Điều chỉnh để bám sát ngân sách</h2><p className="mt-1 text-sm leading-6 text-amber-800">Một số hoạt động trả phí được chuyển thành lựa chọn bổ sung, không bị âm thầm xóa khỏi đề xuất.</p></div></div>
          <ul className="mt-4 space-y-2 text-sm text-amber-900">
            {itinerary.budgetAdjustments.map((item) => <li key={`${item.dayNumber}-${item.placeId}`} className="rounded-xl bg-white/70 px-4 py-3">Ngày {item.dayNumber}: <strong>{item.placeName}</strong> · tiết kiệm khoảng {formatAiMoney(item.savedAmount)}</li>)}
          </ul>
        </section>
      )}

      <section aria-labelledby="timeline-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">Lịch trình chi tiết</p><h2 id="timeline-heading" className="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950">Từng ngày, từng trải nghiệm</h2></div>
          {onToggleDayLock && <p className="text-xs leading-5 text-slate-500">Khóa ngày bạn muốn giữ nguyên trước khi yêu cầu chỉnh sửa.</p>}
        </div>

        <div className="mt-6 space-y-6">
          {itinerary.itineraryDays.map((day) => {
            const locked = lockedDayNumbers.includes(day.dayNumber);
            return (
              <article key={day.dayNumber} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_14px_44px_rgba(15,73,110,0.06)]">
                <header className="flex flex-col gap-4 border-b border-slate-100 bg-[linear-gradient(135deg,#f0f9ff,#ffffff)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                  <div className="flex items-start gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">{day.dayNumber}</span>
                    <div><p className="text-xs font-bold tracking-[0.12em] text-primary uppercase">{formatAiDate(day.date)}</p><h3 className="mt-1 text-xl font-bold text-slate-950">{day.title}</h3>{day.theme && <p className="mt-1 text-sm text-slate-500">{day.theme}</p>}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {day.pace && <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{PACE_LABELS[day.pace]}</span>}
                    {onToggleDayLock && <button type="button" aria-pressed={locked} onClick={() => onToggleDayLock(day.dayNumber)} className={cn("rounded-full border px-3 py-1.5 text-xs font-bold transition", locked ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary")}>{locked ? "Đã khóa ngày" : "Khóa ngày này"}</button>}
                  </div>
                </header>

                <div className="divide-y divide-slate-100 px-5 sm:px-7">
                  {day.activities.map((activity, index) => <ActivityRow key={`${day.dayNumber}-${activity.startTime}-${activity.placeId ?? index}`} activity={activity} first={index === 0} />)}
                </div>
                <footer className="flex items-center justify-between bg-slate-50 px-5 py-3 text-xs sm:px-7"><span className="font-semibold text-slate-500">Chi phí hoạt động trong ngày</span><strong className="text-slate-900">{formatAiMoney(day.dailyActivityCost.amount)}</strong></footer>
              </article>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <NoticeList title="Điều cần lưu ý" icon={AlertTriangle} tone="amber" items={itinerary.warnings} />
        <NoticeList title="Giả định của dự toán" icon={Info} tone="sky" items={itinerary.assumptions} />
      </div>
    </div>
  );
}

function ActivityRow({ activity, first }: { activity: AiActivity; first: boolean }) {
  return (
    <div className="relative py-6 pl-1 sm:grid sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-5">
      <div className="flex items-center gap-2 text-sm font-bold text-primary sm:block">
        <Clock3 className="inline h-4 w-4 sm:mr-2" />{activity.startTime}–{activity.endTime}
        <span className="ml-1 text-xs font-medium text-slate-400 sm:mt-1 sm:block sm:ml-6">{PERIOD_LABELS[activity.period] ?? activity.period}</span>
      </div>
      <div className="mt-3 sm:mt-0">
        {!first && activity.travelFromPrevious && activity.travelFromPrevious.minutes > 0 && <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-400"><Bike className="h-4 w-4" />{activity.travelFromPrevious.label} · khoảng {activity.travelFromPrevious.minutes} phút <ArrowRight className="h-3.5 w-3.5" /></div>}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><div className="flex flex-wrap items-center gap-2"><h4 className="font-bold text-slate-950">{activity.placeName ?? "Thời gian linh hoạt"}</h4>{activity.requiresUserConfirmation && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[0.65rem] font-bold text-amber-800">Cần xác nhận</span>}</div>{activity.area && <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400"><MapPin className="h-3.5 w-3.5" />{activity.area}</p>}</div>
          <strong className="shrink-0 text-sm text-[#d9472e]">{activity.estimatedCost.amount > 0 ? formatAiMoney(activity.estimatedCost.amount) : "Không tính phí"}</strong>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{activity.description ?? activity.suggestion}</p>
        {activity.whyRecommended && <p className="mt-3 flex items-start gap-2 rounded-xl bg-sky-50 px-3 py-2.5 text-xs leading-5 text-sky-900"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{activity.whyRecommended}</p>}
        {activity.culturalNote && <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500"><Landmark className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" /><span><strong>Lưu ý văn hóa:</strong> {activity.culturalNote}</span></p>}
      </div>
    </div>
  );
}

function HeroFact({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/12 bg-white/8 p-4"><Icon className="h-4 w-4 text-amber-300" /><span className="mt-3 block text-[0.65rem] font-bold tracking-[0.12em] text-sky-200 uppercase">{label}</span><strong className="mt-1 block text-sm">{value}</strong></div>;
}

function QualityFact({ good, label }: { good: boolean; label: string }) {
  return <div className={cn("flex items-center gap-3 rounded-2xl p-4", good ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700")}>{good ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}<div><span className="block text-xs font-semibold opacity-70">Kiểm tra</span><strong className="text-sm">{label}</strong></div></div>;
}

function BudgetStatus({ status }: { status: AiItinerary["costEstimate"]["status"] }) {
  const copy = status === "WITHIN_BUDGET" ? ["Trong ngân sách", "bg-emerald-100 text-emerald-800"] : status === "TIGHT" ? ["Ngân sách sát mức", "bg-amber-100 text-amber-800"] : ["Đang vượt ngân sách", "bg-red-100 text-red-700"];
  return <span className={cn("self-start rounded-full px-3 py-1.5 text-xs font-bold", copy[1])}>{copy[0]}</span>;
}

function CostCard({ icon: Icon, label, value }: { icon: typeof Banknote; label: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><Icon className="h-5 w-5 text-primary" /><span className="mt-3 block text-xs font-semibold text-slate-500">{label}</span><strong className="mt-1 block text-sm text-slate-900">{formatAiMoney(value)}</strong></div>;
}

function MoneySummary({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return <div><span className="text-xs font-semibold text-slate-400">{label}</span><strong className={cn("mt-1 block text-lg", accent ? "text-red-300" : "text-white")}>{formatAiMoney(value)}</strong></div>;
}

function NoticeList({ title, icon: Icon, tone, items }: { title: string; icon: typeof Info; tone: "amber" | "sky"; items: string[] }) {
  return <section className={cn("rounded-3xl border p-6", tone === "amber" ? "border-amber-200 bg-amber-50" : "border-sky-100 bg-sky-50")}><h2 className={cn("flex items-center gap-2 font-bold", tone === "amber" ? "text-amber-950" : "text-sky-950")}><Icon className="h-5 w-5" />{title}</h2><ul className={cn("mt-4 space-y-3 text-sm leading-6", tone === "amber" ? "text-amber-900" : "text-sky-900")}>{items.map((item, index) => <li key={`${index}-${item}`} className="flex gap-2"><Footprints className="mt-1 h-4 w-4 shrink-0 opacity-60" /><span>{item}</span></li>)}</ul></section>;
}
