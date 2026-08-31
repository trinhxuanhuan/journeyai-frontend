import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  MapPin,
  PiggyBank,
  Route,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export function AiPlannerPromo() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20" aria-labelledby="ai-planner-promo-heading">
      <div className="relative overflow-hidden rounded-[2.25rem] bg-[linear-gradient(135deg,#052d4b_0%,#075a8e_55%,#0b74d1_100%)] px-6 py-10 text-white shadow-[0_28px_80px_rgba(7,77,123,0.22)] sm:px-10 sm:py-14 lg:px-14">
        <div className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full border-[55px] border-white/5" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-72 rounded-t-full bg-sky-300/8 blur-2xl" />
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.14em] uppercase"><Sparkles className="h-4 w-4 text-amber-300" /> Hành trình tự túc bằng AI</span>
            <h2 id="ai-planner-promo-heading" className="mt-6 max-w-2xl text-3xl leading-tight font-bold tracking-[-0.04em] sm:text-5xl">Không cần mua tour để có một hành trình tử tế.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-sky-100 sm:text-base">Việt Khám Phá xây lịch theo số ngày, ngân sách, nhóm khách và sở thích; đồng thời công khai chi phí, cảnh báo và giới hạn dữ liệu.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/lap-lich-trinh" className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#f4b63f] px-5 text-sm font-bold text-slate-950 transition hover:bg-[#ffc95f]">Tạo hành trình riêng <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/hanh-trinh" className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-5 text-sm font-bold text-white transition hover:bg-white/14">Hành trình đã lưu</Link>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold text-sky-200">Gợi ý minh họa</p><h3 className="mt-1 font-bold">Huế · 3 ngày · Gia đình</h3></div><span className="rounded-full bg-emerald-300/20 px-3 py-1 text-xs font-bold text-emerald-100">92/100</span></div>
            <div className="mt-5 space-y-3">
              <PromoStep icon={CalendarDays} label="Ngày 1" value="Đại Nội · Đông Ba · ẩm thực Huế" />
              <PromoStep icon={Route} label="Ngày 2" value="Lăng Tự Đức · làng hương Thủy Xuân" />
              <PromoStep icon={MapPin} label="Ngày 3" value="Thư thả bên sông Hương" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5"><PromoFact icon={PiggyBank} label="Dự toán rõ ràng" /><PromoFact icon={BadgeCheck} label="Dữ liệu kiểm duyệt" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PromoStep({ icon: Icon, label, value }: { icon: typeof Route; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-2xl bg-white/8 p-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10"><Icon className="h-4 w-4 text-amber-300" /></span><div className="min-w-0"><span className="block text-[0.65rem] font-bold tracking-[0.1em] text-sky-200 uppercase">{label}</span><strong className="mt-0.5 block truncate text-sm">{value}</strong></div></div>;
}

function PromoFact({ icon: Icon, label }: { icon: typeof PiggyBank; label: string }) {
  return <span className="flex items-center gap-2 text-xs font-semibold text-sky-100"><Icon className="h-4 w-4 text-amber-300" />{label}</span>;
}
