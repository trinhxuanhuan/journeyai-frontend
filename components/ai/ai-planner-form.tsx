"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleAlert,
  Compass,
  HeartHandshake,
  History,
  Loader2,
  MapPinned,
  PiggyBank,
  Route,
  Sparkles,
  Users,
  WandSparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAiItinerary,
  createItineraryInputSchema,
  getAiCatalog,
  getAiItineraryErrorMessage,
  isCanceledAiRequest,
  type AiCatalog,
  type CreateItineraryInput,
} from "@/lib/ai-itineraries";
import { cn } from "@/lib/utils";

const PREFERENCE_OPTIONS = [
  "văn hóa",
  "ẩm thực",
  "di sản",
  "thiên nhiên",
  "làng nghề",
  "nhiếp ảnh",
  "nghỉ dưỡng",
  "đời sống địa phương",
] as const;

const GROUP_OPTIONS = [
  { value: "SOLO", label: "Đi một mình" },
  { value: "COUPLE", label: "Cặp đôi" },
  { value: "FAMILY", label: "Gia đình" },
  { value: "FRIENDS", label: "Nhóm bạn" },
  { value: "SENIORS", label: "Người cao tuổi" },
] as const;

const PACE_OPTIONS = [
  { value: "RELAXED", label: "Thư thả", copy: "Ít điểm, nhiều thời gian trải nghiệm" },
  { value: "BALANCED", label: "Cân bằng", copy: "Hài hòa khám phá và nghỉ ngơi" },
  { value: "ACTIVE", label: "Năng động", copy: "Nhiều hoạt động hơn mỗi ngày" },
] as const;

const TRANSPORT_OPTIONS = [
  { value: "FLEXIBLE", label: "Linh hoạt" },
  { value: "TAXI_RIDESHARE", label: "Taxi / xe công nghệ" },
  { value: "MOTORBIKE", label: "Xe máy" },
  { value: "PRIVATE_CAR", label: "Ô tô riêng" },
  { value: "PUBLIC_TRANSPORT", label: "Phương tiện công cộng" },
] as const;

type CatalogState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: AiCatalog };

export function AiPlannerForm() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<CatalogState>({ status: "loading" });
  const [customPreference, setCustomPreference] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CreateItineraryInput>({
    resolver: zodResolver(createItineraryInputSchema),
    defaultValues: {
      destination: "Huế",
      days: 3,
      budget: 6_000_000,
      travelerCount: 2,
      childrenCount: 0,
      seniorCount: 0,
      groupProfile: "COUPLE",
      preferences: ["văn hóa", "ẩm thực"],
      pace: "BALANCED",
      transportPreference: "FLEXIBLE",
      startDate: "",
    },
  });

  const preferences = useWatch({ control, name: "preferences" }) ?? [];
  const selectedPace = useWatch({ control, name: "pace" });

  useEffect(() => {
    const controller = new AbortController();
    getAiCatalog(controller.signal)
      .then((data) => setCatalog({ status: "success", data }))
      .catch((error) => {
        if (!isCanceledAiRequest(error)) {
          setCatalog({ status: "error", message: getAiItineraryErrorMessage(error) });
        }
      });
    return () => controller.abort();
  }, []);

  const togglePreference = (preference: string) => {
    const next = preferences.includes(preference)
      ? preferences.filter((item) => item !== preference)
      : [...preferences, preference].slice(0, 12);
    setValue("preferences", next, { shouldValidate: true, shouldDirty: true });
  };

  const addCustomPreference = () => {
    const cleaned = customPreference.trim();
    if (!cleaned || preferences.includes(cleaned) || preferences.length >= 12) return;
    setValue("preferences", [...preferences, cleaned], { shouldValidate: true, shouldDirty: true });
    setCustomPreference("");
  };

  const submit = async (input: CreateItineraryInput) => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const itinerary = await createAiItinerary(input);
      router.push(`/hanh-trinh/${itinerary.id}?created=1`);
    } catch (error) {
      setSubmitError(getAiItineraryErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-[#f6fafc] pb-20">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#062b4a_0%,#064e79_55%,#0b74d1_100%)] px-5 py-14 text-white sm:px-8 sm:py-20">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,#7dd3fc_0,transparent_24%),radial-gradient(circle_at_85%_15%,#fef3c7_0,transparent_18%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold tracking-[0.16em] uppercase backdrop-blur">
              <WandSparkles className="h-4 w-4 text-amber-300" /> AI Planner của Việt Khám Phá
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.08] font-bold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              Việt Nam theo nhịp riêng của bạn.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-sky-100 sm:text-lg">
              Nhập ngân sách, số ngày và người đồng hành. Hệ thống dựng lịch trình theo dữ liệu điểm đến đã kiểm duyệt, đồng thời nói rõ mọi giả định và giới hạn.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <PlannerPromise icon={Route} title="Lịch khả thi" copy="Không xếp chồng hoạt động" />
            <PlannerPromise icon={PiggyBank} title="Rõ ngân sách" copy="Tách từng nhóm chi phí" />
            <PlannerPromise icon={HeartHandshake} title="Hiểu nhóm đi" copy="Lưu ý trẻ em và cao tuổi" />
            <PlannerPromise icon={MapPinned} title="Dữ liệu có nguồn" copy="Phân biệt curated và gợi ý" />
          </div>
        </div>
      </section>

      <div className="mx-auto mt-[-2rem] grid max-w-7xl gap-7 px-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <form
          onSubmit={handleSubmit(submit)}
          className="relative rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,73,110,0.14)] sm:p-8"
          aria-busy={submitting}
        >
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Thiết kế hành trình</p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-slate-950">Bạn muốn chuyến đi như thế nào?</h2>
            </div>
            <Link href="/hanh-trinh" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-[#075fae]">
              <History className="h-4 w-4" /> Hành trình đã lưu
            </Link>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <Field label="Điểm đến" icon={MapPinned} error={errors.destination?.message} className="sm:col-span-2">
              <Input {...register("destination")} className="h-12 rounded-xl border-slate-300 px-4" placeholder="Ví dụ: Huế, Đà Lạt..." aria-invalid={Boolean(errors.destination)} />
              <div className="mt-3 flex flex-wrap gap-2" aria-label="Điểm đến có dữ liệu kiểm duyệt">
                {catalog.status === "loading" && <span className="text-xs text-slate-400">Đang tải điểm đến được kiểm duyệt...</span>}
                {catalog.status === "error" && <span className="text-xs text-amber-700">Không tải được catalog; bạn vẫn có thể nhập điểm đến.</span>}
                {catalog.status === "success" && catalog.data.supportedDestinations.map((destination) => (
                  <button key={destination.id} type="button" onClick={() => setValue("destination", destination.name, { shouldValidate: true, shouldDirty: true })} className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-primary transition hover:border-primary">
                    {destination.name}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Số ngày" icon={CalendarDays} error={errors.days?.message}>
              <Input type="number" min={1} max={30} {...register("days", { valueAsNumber: true })} className="h-12 rounded-xl border-slate-300 px-4" aria-invalid={Boolean(errors.days)} />
            </Field>
            <Field label="Ngày bắt đầu (không bắt buộc)" icon={CalendarDays} error={errors.startDate?.message}>
              <Input type="date" {...register("startDate")} className="h-12 rounded-xl border-slate-300 px-4" aria-invalid={Boolean(errors.startDate)} />
            </Field>

            <Field label="Ngân sách cho cả nhóm" icon={PiggyBank} error={errors.budget?.message} className="sm:col-span-2">
              <div className="relative">
                <Input type="number" min={100000} step={100000} {...register("budget", { valueAsNumber: true })} className="h-12 rounded-xl border-slate-300 px-4 pr-14" aria-invalid={Boolean(errors.budget)} />
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm font-bold text-slate-400">VND</span>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500">Bao gồm lưu trú, ăn uống, đi lại nội vùng, hoạt động và khoản dự phòng; không gồm vé tới điểm đến.</p>
            </Field>

            <Field label="Tổng số khách" icon={Users} error={errors.travelerCount?.message}>
              <Input type="number" min={1} max={30} {...register("travelerCount", { valueAsNumber: true })} className="h-12 rounded-xl border-slate-300 px-4" aria-invalid={Boolean(errors.travelerCount)} />
            </Field>
            <Field label="Kiểu nhóm" icon={Users} error={errors.groupProfile?.message}>
              <select {...register("groupProfile")} className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
                {GROUP_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Trong đó có trẻ em" icon={Users} error={errors.childrenCount?.message}>
              <Input type="number" min={0} max={20} {...register("childrenCount", { valueAsNumber: true })} className="h-12 rounded-xl border-slate-300 px-4" aria-invalid={Boolean(errors.childrenCount)} />
            </Field>
            <Field label="Người cao tuổi" icon={Users} error={errors.seniorCount?.message}>
              <Input type="number" min={0} max={20} {...register("seniorCount", { valueAsNumber: true })} className="h-12 rounded-xl border-slate-300 px-4" aria-invalid={Boolean(errors.seniorCount)} />
            </Field>

            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-bold text-slate-800">Nhịp độ mong muốn</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {PACE_OPTIONS.map((option) => (
                  <label key={option.value} className={cn("cursor-pointer rounded-2xl border p-4 transition", selectedPace === option.value ? "border-primary bg-sky-50 ring-2 ring-primary/10" : "border-slate-200 hover:border-sky-200")}>
                    <input type="radio" value={option.value} {...register("pace")} className="sr-only" />
                    <span className="flex items-center justify-between gap-2"><strong className="text-sm text-slate-900">{option.label}</strong>{selectedPace === option.value && <Check className="h-4 w-4 text-primary" />}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{option.copy}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Field label="Phương tiện tại điểm đến" icon={Compass} error={errors.transportPreference?.message} className="sm:col-span-2">
              <select {...register("transportPreference")} className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15">
                {TRANSPORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </Field>

            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-bold text-slate-800">Điều bạn quan tâm</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {PREFERENCE_OPTIONS.map((preference) => {
                  const selected = preferences.includes(preference);
                  return <button key={preference} type="button" aria-pressed={selected} onClick={() => togglePreference(preference)} className={cn("rounded-full border px-3.5 py-2 text-sm font-semibold transition", selected ? "border-primary bg-primary text-white" : "border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-primary")}>{preference}</button>;
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <Input value={customPreference} onChange={(event) => setCustomPreference(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomPreference(); } }} maxLength={80} placeholder="Thêm sở thích riêng..." className="h-11 rounded-xl border-slate-300 px-4" />
                <Button type="button" variant="outline" onClick={addCustomPreference} disabled={!customPreference.trim() || preferences.length >= 12} className="h-11 rounded-xl">Thêm</Button>
              </div>
              {preferences.length > 0 && <p className="mt-2 text-xs text-slate-500">Đã chọn: {preferences.join(", ")}</p>}
            </fieldset>
          </div>

          {submitError && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700" role="alert"><CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />{submitError}</div>}

          <div className="mt-8 rounded-2xl bg-slate-950 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div className="flex items-start gap-3 text-white">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <p className="text-xs leading-5 text-slate-300"><strong className="block text-sm text-white">Kế hoạch được kiểm tra trước khi trả về</strong>Planner vẫn hoạt động bằng dữ liệu và quy tắc nếu dịch vụ tạo nội dung tạm thời gián đoạn.</p>
            </div>
            <Button type="submit" disabled={submitting} className="mt-4 h-12 w-full shrink-0 rounded-xl bg-[#f4b63f] px-5 font-bold text-slate-950 shadow-none hover:bg-[#ffc95f] sm:mt-0 sm:w-auto">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : <WandSparkles className="h-4 w-4" />}
              {submitting ? "Đang dựng hành trình..." : "Tạo hành trình"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
        </form>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-sky-100 bg-[linear-gradient(145deg,#e8f6ff,#ffffff)] p-6 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white"><Sparkles className="h-5 w-5" /></span>
            <h2 className="mt-5 text-xl font-bold text-slate-950">AI không tự bịa lịch trình</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Địa điểm, giờ, tọa độ và chi phí được planner xác định trước. AI chỉ giúp cách diễn đạt tự nhiên và phù hợp nhóm khách.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Bạn luôn biết giới hạn dữ liệu</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <AsideItem>Chi phí và thời gian di chuyển là dự toán tham khảo.</AsideItem>
              <AsideItem>Điểm ngoài catalog được gắn rõ là khung gợi ý chung.</AsideItem>
              <AsideItem>Ngân sách vượt mức sẽ được cảnh báo, không âm thầm bóp giá.</AsideItem>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Field({ label, icon: Icon, error, className, children }: { label: string; icon: typeof MapPinned; error?: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><Label className="mb-2.5 font-bold text-slate-800"><Icon className="h-4 w-4 text-primary" />{label}</Label>{children}{error && <p className="mt-2 text-xs font-medium text-red-600" role="alert">{error}</p>}</div>;
}

function PlannerPromise({ icon: Icon, title, copy }: { icon: typeof Route; title: string; copy: string }) {
  return <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"><Icon className="h-5 w-5 text-amber-300" /><strong className="mt-3 block text-sm">{title}</strong><span className="mt-1 block text-xs leading-5 text-sky-100">{copy}</span></div>;
}

function AsideItem({ children }: { children: React.ReactNode }) {
  return <li className="flex gap-2.5"><Check className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /><span>{children}</span></li>;
}
