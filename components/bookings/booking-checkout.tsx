"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
  UserRoundCheck,
  Users,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { TourImage } from "@/components/tours/tour-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateBookingEstimate,
  clearRequestKey,
  createBooking,
  getBookingRequestErrorMessage,
  getOrCreateRequestKey,
  type CreateBookingInput,
} from "@/lib/bookings";
import {
  formatDepartureDate,
  formatTourDuration,
  formatTourPrice,
  getPublicDepartures,
  getTourDetail,
  isCanceledTourRequest,
  type PublicDeparture,
  type TourDetail,
} from "@/lib/tours";
import { cn } from "@/lib/utils";

const participantFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên đầy đủ")
    .max(100, "Họ tên không được vượt quá 100 ký tự"),
  phone: z.string().trim().max(20, "Số điện thoại không được vượt quá 20 ký tự"),
  participantType: z.enum(["ADULT", "CHILD"]),
});

const checkoutFormSchema = z
  .object({
    departureId: z.string(),
    requestedStartDate: z.string(),
    guideOptionSelected: z.boolean(),
    singleRoomCount: z.number().int().min(0),
    participants: z.array(participantFormSchema).min(1).max(50),
  })
  .superRefine((value, context) => {
    if (!/^0\d{8,10}$/.test(value.participants[0]?.phone ?? "")) {
      context.addIssue({
        code: "custom",
        message: "Vui lòng nhập số điện thoại liên hệ hợp lệ",
        path: ["participants", 0, "phone"],
      });
    }
    if (value.singleRoomCount > value.participants.length) {
      context.addIssue({
        code: "custom",
        message: "Số phòng đơn không thể lớn hơn số khách",
        path: ["singleRoomCount"],
      });
    }
  });

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

type CheckoutState =
  | { requestKey: string; status: "error"; message: string }
  | { requestKey: string; status: "success"; tour: TourDetail; departures: PublicDeparture[] };

export function BookingCheckout({
  tourId,
  initialDepartureId,
}: {
  tourId: string;
  initialDepartureId: string | null;
}) {
  const router = useRouter();
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<CheckoutState | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      departureId: initialDepartureId ?? "",
      requestedStartDate: "",
      guideOptionSelected: false,
      singleRoomCount: 0,
      participants: [
        { fullName: "", phone: "", participantType: "ADULT" },
      ],
    },
    mode: "onBlur",
  });
  const participantsFieldArray = useFieldArray({
    control: form.control,
    name: "participants",
  });
  const requestKey = `${tourId}\u0000${initialDepartureId ?? ""}\u0000${reloadKey}`;
  const state = result?.requestKey === requestKey ? result : { status: "loading" as const };
  const watchedDepartureId = useWatch({ control: form.control, name: "departureId" });
  const watchedRequestedStartDate = useWatch({ control: form.control, name: "requestedStartDate" });
  const watchedGuideOption = useWatch({ control: form.control, name: "guideOptionSelected" });
  const watchedSingleRooms = useWatch({ control: form.control, name: "singleRoomCount" });
  const watchedParticipants = useWatch({ control: form.control, name: "participants" });
  const values: CheckoutFormValues = {
    departureId: watchedDepartureId ?? "",
    requestedStartDate: watchedRequestedStartDate ?? "",
    guideOptionSelected: watchedGuideOption ?? false,
    singleRoomCount: watchedSingleRooms ?? 0,
    participants: watchedParticipants ?? [],
  };

  useEffect(() => {
    const controller = new AbortController();

    getTourDetail(tourId, controller.signal)
      .then(async (tour) => {
        const departures =
          tour.tourType === "GROUP"
            ? await getPublicDepartures(tourId, controller.signal)
            : [];
        if (controller.signal.aborted) return;

        const requestedDeparture = departures.find(
          (departure) =>
            departure.departureId === initialDepartureId && departure.bookable
        );
        const firstBookable = departures.find((departure) => departure.bookable);
        form.setValue(
          "departureId",
          requestedDeparture?.departureId ?? firstBookable?.departureId ?? ""
        );
        setResult({ requestKey, status: "success", tour, departures });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isCanceledTourRequest(error)) return;
        setResult({
          requestKey,
          status: "error",
          message: getBookingRequestErrorMessage(error),
        });
      });

    return () => controller.abort();
  }, [form, initialDepartureId, requestKey, tourId]);

  if (state.status === "loading") return <CheckoutSkeleton />;
  if (state.status === "error") {
    return (
      <CheckoutMessage
        title="Chưa thể chuẩn bị booking"
        message={state.message}
        onRetry={() => setReloadKey((value) => value + 1)}
      />
    );
  }

  const { tour, departures } = state;
  const selectedDeparture = departures.find(
    (departure) => departure.departureId === values.departureId
  );
  const estimate = calculateBookingEstimate(
    tour,
    values.participants,
    values.singleRoomCount,
    values.guideOptionSelected,
    selectedDeparture
  );
  const canAddParticipant = values.participants.length < tour.maxGroupSize;
  const canRemoveParticipant = values.participants.length > tour.minGroupSize;

  const handleSubmit = form.handleSubmit(async (formValues) => {
    setSubmitError(null);

    if (
      formValues.participants.length < tour.minGroupSize ||
      formValues.participants.length > tour.maxGroupSize
    ) {
      setSubmitError(
        `Tour này nhận từ ${tour.minGroupSize} đến ${tour.maxGroupSize} khách trong một booking.`
      );
      return;
    }

    const participants = formValues.participants.map((participant, index) => ({
      fullName: participant.fullName.trim(),
      phone: participant.phone.trim() || undefined,
      primaryContact: index === 0,
      participantType: participant.participantType,
    }));

    let payload: CreateBookingInput;
    if (tour.tourType === "GROUP") {
      if (!selectedDeparture?.bookable) {
        setSubmitError("Vui lòng chọn một lịch khởi hành đang mở và còn chỗ.");
        return;
      }
      if (participants.length > selectedDeparture.availableSeats) {
        setSubmitError("Lịch khởi hành không còn đủ chỗ cho nhóm của bạn.");
        return;
      }
      payload = {
        tourId: tour.id,
        departureId: selectedDeparture.departureId,
        guideOptionSelected: false,
        singleRoomCount: formValues.singleRoomCount,
        participants,
      };
    } else {
      if (!formValues.requestedStartDate) {
        setSubmitError("Vui lòng chọn ngày khởi hành cho nhóm của bạn.");
        return;
      }
      payload = {
        tourId: tour.id,
        requestedStartDate: formValues.requestedStartDate,
        guideOptionSelected:
          tour.guideMode === "OPTIONAL" && formValues.guideOptionSelected,
        singleRoomCount: formValues.singleRoomCount,
        participants,
      };
    }

    setSubmitting(true);
    try {
      const scope = `booking:${tour.id}`;
      const idempotencyKey = getOrCreateRequestKey(
        sessionStorage,
        scope,
        payload
      );
      const booking = await createBooking(payload, idempotencyKey);
      clearRequestKey(sessionStorage, scope);
      router.push(`/bookings/${booking.bookingId}?created=1`);
    } catch (error) {
      setSubmitError(getBookingRequestErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-6xl px-5 pt-7 sm:px-8">
        <Link
          href={`/tours/${encodeURIComponent(tour.id)}`}
          className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-slate-500 transition hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Quay lại chi tiết tour
        </Link>

        <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
              Đặt tour an toàn
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Thông tin đoàn của bạn
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Hệ thống chỉ giữ chỗ 15 phút sau khi booking được tạo. Giá chính thức luôn do máy chủ tính lại.
            </p>
          </div>
          <ol className="flex items-center gap-2 text-xs font-bold text-slate-400" aria-label="Tiến trình đặt tour">
            <Step active number="1" label="Thông tin" />
            <span aria-hidden="true">—</span>
            <Step number="2" label="Giữ chỗ" />
            <span aria-hidden="true">—</span>
            <Step number="3" label="Thanh toán" />
          </ol>
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <TourCheckoutCard tour={tour} selectedDeparture={selectedDeparture} />

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_44px_rgba(15,73,110,0.06)] sm:p-7" aria-labelledby="schedule-heading">
              <SectionTitle
                icon={CalendarDays}
                id="schedule-heading"
                title={tour.tourType === "GROUP" ? "Chọn lịch khởi hành" : "Chọn ngày đi riêng"}
                description={tour.tourType === "GROUP" ? "Số chỗ được cập nhật tại thời điểm mở trang." : "Nhóm của bạn đi riêng và không sử dụng tồn chỗ chung."}
              />

              {tour.tourType === "GROUP" ? (
                <fieldset className="mt-5 space-y-3">
                  <legend className="sr-only">Lịch khởi hành có thể đặt</legend>
                  {departures.filter((departure) => departure.bookable).length > 0 ? (
                    departures.filter((departure) => departure.bookable).map((departure) => (
                      <label
                        key={departure.departureId}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition",
                          values.departureId === departure.departureId
                            ? "border-primary bg-sky-50 ring-2 ring-primary/10"
                            : "border-slate-200 hover:border-sky-200"
                        )}
                      >
                        <input
                          type="radio"
                          value={departure.departureId}
                          className="mt-1 h-4 w-4 accent-primary"
                          {...form.register("departureId")}
                        />
                        <span className="min-w-0 flex-1">
                          <strong className="block text-sm text-slate-900">
                            {formatDepartureDate(departure.startDate)} – {formatDepartureDate(departure.endDate)}
                          </strong>
                          <span className="mt-1 block text-xs text-slate-500">
                            Còn {departure.availableSeats}/{departure.capacity} chỗ · {formatTourPrice(departure.priceOverride ?? tour.basePrice)}/khách
                          </span>
                        </span>
                        {values.departureId === departure.departureId && (
                          <Check className="h-5 w-5 text-primary" aria-hidden="true" />
                        )}
                      </label>
                    ))
                  ) : (
                    <p className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                      Tour chưa có lịch khởi hành còn chỗ. Vui lòng quay lại sau.
                    </p>
                  )}
                </fieldset>
              ) : (
                <div className="mt-5 max-w-sm">
                  <Label htmlFor="requestedStartDate">Ngày khởi hành mong muốn</Label>
                  <Input
                    id="requestedStartDate"
                    type="date"
                    min={getVietnamToday()}
                    className="mt-2 h-11 bg-white"
                    aria-invalid={Boolean(form.formState.errors.requestedStartDate)}
                    {...form.register("requestedStartDate")}
                  />
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_44px_rgba(15,73,110,0.06)] sm:p-7" aria-labelledby="participants-heading">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <SectionTitle
                  icon={Users}
                  id="participants-heading"
                  title="Danh sách người tham gia"
                  description={`Tour nhận ${tour.minGroupSize}–${tour.maxGroupSize} khách trong một booking.`}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => participantsFieldArray.append({ fullName: "", phone: "", participantType: "ADULT" })}
                  disabled={!canAddParticipant}
                  className="h-10 self-start rounded-xl"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Thêm khách
                </Button>
              </div>

              <div className="mt-5 space-y-4">
                {participantsFieldArray.fields.map((field, index) => {
                  const errors = form.formState.errors.participants?.[index];
                  return (
                    <fieldset key={field.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                      <legend className="sr-only">Thông tin khách {index + 1}</legend>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                            {index + 1}
                          </span>
                          <strong className="text-sm text-slate-900">
                            {index === 0 ? "Người liên hệ chính" : `Khách ${index + 1}`}
                          </strong>
                        </div>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => participantsFieldArray.remove(index)}
                            disabled={!canRemoveParticipant}
                            aria-label={`Xóa khách ${index + 1}`}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <Field label="Họ và tên" error={errors?.fullName?.message}>
                          <Input
                            autoComplete="name"
                            placeholder="Nguyễn Văn A"
                            className="mt-2 h-11 bg-white"
                            aria-invalid={Boolean(errors?.fullName)}
                            {...form.register(`participants.${index}.fullName`)}
                          />
                        </Field>
                        <Field
                          label={index === 0 ? "Số điện thoại liên hệ" : "Số điện thoại (không bắt buộc)"}
                          error={errors?.phone?.message}
                        >
                          <Input
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="0901234567"
                            className="mt-2 h-11 bg-white"
                            aria-invalid={Boolean(errors?.phone)}
                            {...form.register(`participants.${index}.phone`)}
                          />
                        </Field>
                        <Field label="Nhóm giá">
                          <select
                            className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
                            {...form.register(`participants.${index}.participantType`)}
                          >
                            <option value="ADULT">Người lớn</option>
                            <option value="CHILD">Trẻ em ({tour.childPolicy.pricePercentage}% giá)</option>
                          </select>
                        </Field>
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_44px_rgba(15,73,110,0.06)] sm:p-7" aria-labelledby="options-heading">
              <SectionTitle
                icon={BedDouble}
                id="options-heading"
                title="Dịch vụ bổ sung"
                description="Chỉ chọn những dịch vụ nhóm bạn thực sự cần."
              />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <Label htmlFor="singleRoomCount">Số phòng đơn</Label>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Phụ thu {formatTourPrice(tour.singleRoomSupplement)}/phòng.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => form.setValue("singleRoomCount", Math.max(0, values.singleRoomCount - 1), { shouldValidate: true })}
                      aria-label="Giảm số phòng đơn"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      id="singleRoomCount"
                      type="number"
                      min={0}
                      max={values.participants.length}
                      className="h-9 w-20 bg-white text-center"
                      aria-invalid={Boolean(form.formState.errors.singleRoomCount)}
                      {...form.register("singleRoomCount", { valueAsNumber: true })}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => form.setValue("singleRoomCount", Math.min(values.participants.length, values.singleRoomCount + 1), { shouldValidate: true })}
                      aria-label="Tăng số phòng đơn"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {form.formState.errors.singleRoomCount?.message && (
                    <p className="mt-2 text-xs text-red-600">{form.formState.errors.singleRoomCount.message}</p>
                  )}
                </div>

                {tour.tourType === "PRIVATE" && tour.guideMode === "OPTIONAL" ? (
                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-sky-200">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded accent-primary"
                      {...form.register("guideOptionSelected")}
                    />
                    <span>
                      <strong className="block text-sm text-slate-900">Thêm hướng dẫn viên</strong>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {formatTourPrice(tour.optionalGuidePrice)} cho toàn hành trình.
                      </span>
                    </span>
                  </label>
                ) : (
                  <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <UserRoundCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
                    <div>
                      <strong className="block text-sm text-slate-900">Hướng dẫn viên</strong>
                      <span className="mt-1 block text-xs leading-5 text-slate-500">
                        {tour.guideMode === "INCLUDED" ? "Đã nằm trong gói tour." : "Tour này không sử dụng hướng dẫn viên."}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {submitError && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700" role="alert">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                {submitError}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href={`/tours/${encodeURIComponent(tour.id)}`}
                className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Xem lại tour
              </Link>
              <Button
                type="submit"
                disabled={submitting || (tour.tourType === "GROUP" && !selectedDeparture?.bookable)}
                className="h-12 rounded-xl bg-primary px-6 font-bold text-white shadow-[0_12px_28px_rgba(11,116,209,0.2)] hover:bg-[#075fae]"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                ) : (
                  <ShieldCheck className="h-4 w-4" />
                )}
                {submitting ? "Đang tạo booking..." : "Xác nhận và giữ chỗ"}
              </Button>
            </div>
          </form>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label="Tạm tính booking">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,73,110,0.1)]">
              <div className="bg-[linear-gradient(135deg,#eaf7ff,#ffffff)] p-6">
                <p className="text-xs font-bold tracking-[0.14em] text-primary uppercase">Tạm tính</p>
                <strong className="mt-2 block text-3xl font-bold text-[#e84f35]">
                  {formatTourPrice(estimate.totalAmount)}
                </strong>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  BE sẽ tính và khóa giá chính thức khi booking được tạo.
                </p>
              </div>
              <dl className="divide-y divide-slate-100 px-6">
                {tour.priceModel === "PER_GROUP" ? (
                  <EstimateRow label={`Giá trọn gói ${values.participants.length} khách`} value={formatTourPrice(estimate.packageAmount)} />
                ) : (
                  <>
                    <EstimateRow label={`${estimate.adultCount} người lớn`} value={estimate.adultCount > 0 ? formatTourPrice(estimate.unitPrice * estimate.adultCount) : "0 ₫"} />
                    {estimate.childCount > 0 && (
                      <EstimateRow label={`${estimate.childCount} trẻ em`} value={formatTourPrice(estimate.unitPrice * (tour.childPolicy.pricePercentage / 100) * estimate.childCount)} />
                    )}
                  </>
                )}
                {estimate.singleRoomAmount > 0 && <EstimateRow label="Phụ thu phòng đơn" value={formatTourPrice(estimate.singleRoomAmount)} />}
                {estimate.guideAmount > 0 && <EstimateRow label="Hướng dẫn viên" value={formatTourPrice(estimate.guideAmount)} />}
              </dl>
              <div className="space-y-3 border-t border-slate-100 p-6 text-xs leading-5 text-slate-500">
                <p className="flex items-start gap-2">
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  Chưa giữ chỗ ở bước này. Đồng hồ 15 phút bắt đầu sau khi xác nhận.
                </p>
                <p className="flex items-start gap-2">
                  <WalletCards className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  Không nhập số thẻ trên Việt Khám Phá; bạn sẽ chuyển sang cổng VNPay.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function TourCheckoutCard({
  tour,
  selectedDeparture,
}: {
  tour: TourDetail;
  selectedDeparture?: PublicDeparture;
}) {
  return (
    <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_44px_rgba(15,73,110,0.06)] sm:grid-cols-[180px_1fr]" aria-label="Tour đang đặt">
      <div className="relative aspect-[16/9] bg-slate-200 sm:aspect-auto sm:min-h-44">
        <TourImage src={tour.coverImageUrl} alt={`Ảnh tour ${tour.name}`} eager />
      </div>
      <div className="p-5 sm:p-6">
        <span className="text-xs font-bold text-primary">
          {tour.tourType === "GROUP" ? "Tour ghép trọn gói" : "Tour riêng"}
        </span>
        <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-slate-950">{tour.name}</h2>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-primary" />{selectedDeparture ? formatDepartureDate(selectedDeparture.startDate) : tour.tourType === "PRIVATE" ? "Ngày do nhóm lựa chọn" : "Chọn lịch bên dưới"}</span>
          <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-primary" />{formatTourDuration(tour.durationDays, tour.durationNights)}</span>
          <span className="inline-flex items-center gap-1.5"><UserRound className="h-4 w-4 text-primary" />{tour.departureLocation} → {tour.destination.name}</span>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ icon: Icon, id, title, description }: { icon: typeof Users; id: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <h2 id={id} className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      {children}
      {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

function EstimateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function Step({ active = false, number, label }: { active?: boolean; number: string; label: string }) {
  return (
    <li className={cn("flex items-center gap-1.5", active && "text-primary")}>
      <span className={cn("flex h-6 w-6 items-center justify-center rounded-full bg-slate-100", active && "bg-primary text-white")}>{number}</span>
      <span className="hidden sm:inline">{label}</span>
    </li>
  );
}

function getVietnamToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
}

function CheckoutSkeleton() {
  return <div className="mx-auto min-h-[70vh] max-w-6xl animate-pulse px-5 py-10 motion-reduce:animate-none"><div className="h-6 w-44 rounded bg-slate-200" /><div className="mt-8 h-[38rem] rounded-3xl bg-white ring-1 ring-slate-200" /></div>;
}

function CheckoutMessage({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-12">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_60px_rgba(15,73,110,0.08)]">
        <CircleAlert className="mx-auto h-10 w-10 text-amber-500" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-bold text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
        <Button type="button" onClick={onRetry} className="mt-6 h-11 rounded-xl bg-primary px-5 text-white">Thử lại</Button>
      </div>
    </div>
  );
}
