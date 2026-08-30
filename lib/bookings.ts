import axios from "axios";
import { z } from "zod";

import { api, getApiErrorMessage } from "@/lib/api";
import type { PublicDeparture, TourDetail } from "@/lib/tours";

const REQUEST_TIMEOUT_MS = 10_000;
const uuidSchema = z.string().uuid();
const instantSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Expected an ISO-8601 instant"
);
const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const moneySchema = z.number().finite().nonnegative();

export const PARTICIPANT_TYPES = ["ADULT", "CHILD"] as const;
export type ParticipantType = (typeof PARTICIPANT_TYPES)[number];

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "EXPIRED",
  "PAYMENT_FAILED",
  "CANCELLED",
  "COMPLETED",
  "PAYMENT_REVIEW_REQUIRED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

const participantSchema = z.object({
  fullName: z.string().trim().min(1),
  phone: z.string().nullable().optional().transform((value) => value?.trim() || null),
  primaryContact: z.boolean(),
  participantType: z.enum(PARTICIPANT_TYPES),
});

const createBookingResponseSchema = z.object({
  bookingId: uuidSchema,
  status: z.enum(BOOKING_STATUSES),
  totalAmount: moneySchema,
  holdExpiresAt: instantSchema,
});

const bookingDetailSchema = z.object({
  bookingId: uuidSchema,
  customerId: uuidSchema,
  tourSlotId: uuidSchema.nullable().optional().transform((value) => value ?? null),
  departureId: uuidSchema.nullable().optional().transform((value) => value ?? null),
  tourId: z.string().trim().min(1),
  bookingType: z.enum(["GROUP", "PRIVATE"]),
  startDate: localDateSchema,
  endDate: localDateSchema,
  participantCount: z.number().int().positive(),
  priceModel: z.enum(["PER_PERSON", "PER_GROUP"]),
  unitPrice: moneySchema,
  totalAmount: moneySchema,
  commercialSnapshot: z.string().nullable().optional().transform((value) => value ?? null),
  assignedGuideId: z.string().nullable().optional().transform((value) => value ?? null),
  guideOptionSelected: z.boolean(),
  singleRoomCount: z.number().int().nonnegative(),
  participants: z.array(participantSchema),
  status: z.enum(BOOKING_STATUSES),
  holdExpiresAt: instantSchema,
});

const customerBookingItemSchema = z.object({
  bookingId: uuidSchema,
  tourSlotId: uuidSchema.nullable().optional().transform((value) => value ?? null),
  departureId: uuidSchema.nullable().optional().transform((value) => value ?? null),
  tourId: z.string().trim().min(1),
  bookingType: z.enum(["GROUP", "PRIVATE"]),
  startDate: localDateSchema,
  endDate: localDateSchema,
  participantCount: z.number().int().positive(),
  totalAmount: moneySchema,
  status: z.enum(BOOKING_STATUSES),
  holdExpiresAt: instantSchema,
  createdAt: instantSchema,
  updatedAt: instantSchema,
});

const customerBookingListSchema = z.object({
  items: z.array(customerBookingItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

const createPaymentResponseSchema = z.object({
  paymentId: uuidSchema,
  redirectUrl: z.string().url(),
});

const paymentStatusSchema = z.object({
  paymentId: uuidSchema,
  bookingId: uuidSchema,
  amount: moneySchema,
  currency: z.literal("VND"),
  gateway: z.literal("VNPAY"),
  status: z.enum(["INITIATED", "SUCCESS", "FAILED", "CANCELLED"]),
  createdAt: instantSchema,
  completedAt: instantSchema.nullable(),
});

const commercialSnapshotSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    departureLocation: z.string().trim().min(1).optional(),
    destination: z
      .object({
        name: z.string().trim().min(1).optional(),
        province: z.string().trim().min(1).optional(),
      })
      .optional(),
    priceBreakdown: z
      .object({
        priceModel: z.enum(["PER_PERSON", "PER_GROUP"]),
        unitPrice: moneySchema,
        adultCount: z.number().int().nonnegative(),
        childCount: z.number().int().nonnegative(),
        childPricePercentage: z.number().finite().min(0).max(100),
        packageAmount: moneySchema,
        singleRoomSupplementAmount: moneySchema,
        optionalGuideAmount: moneySchema,
        totalAmount: moneySchema,
      })
      .optional(),
  })
  .passthrough();

export interface BookingParticipantInput {
  fullName: string;
  phone?: string;
  primaryContact: boolean;
  participantType: ParticipantType;
}

export interface CreateBookingInput {
  tourId?: string;
  departureId?: string;
  requestedStartDate?: string;
  guideOptionSelected: boolean;
  singleRoomCount: number;
  participants: BookingParticipantInput[];
}

export type CreateBookingResponse = z.infer<typeof createBookingResponseSchema>;
export type BookingDetail = z.infer<typeof bookingDetailSchema>;
export type CustomerBookingItem = z.infer<typeof customerBookingItemSchema>;
export type CustomerBookingList = z.infer<typeof customerBookingListSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type CommercialSnapshot = z.infer<typeof commercialSnapshotSchema>;

export async function createBooking(
  input: CreateBookingInput,
  idempotencyKey: string
): Promise<CreateBookingResponse> {
  const response = await api.post("/v1/bookings", input, {
    headers: { "Idempotency-Key": idempotencyKey },
    timeout: REQUEST_TIMEOUT_MS,
  });
  return createBookingResponseSchema.parse(response.data);
}

export async function getBooking(
  bookingId: string,
  signal?: AbortSignal
): Promise<BookingDetail> {
  const response = await api.get(`/v1/bookings/${encodeURIComponent(bookingId)}`, {
    signal,
    timeout: REQUEST_TIMEOUT_MS,
  });
  return bookingDetailSchema.parse(response.data);
}

export async function getMyBookings(
  page = 0,
  size = 20,
  signal?: AbortSignal
): Promise<CustomerBookingList> {
  const response = await api.get("/v1/bookings/me", {
    params: { page, size },
    signal,
    timeout: REQUEST_TIMEOUT_MS,
  });
  return customerBookingListSchema.parse(response.data);
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await api.post(`/v1/bookings/${encodeURIComponent(bookingId)}/cancel`, undefined, {
    timeout: REQUEST_TIMEOUT_MS,
  });
}

export async function createPayment(
  bookingId: string,
  idempotencyKey: string
): Promise<z.infer<typeof createPaymentResponseSchema>> {
  const response = await api.post(
    "/v1/payments",
    { bookingId, gateway: "VNPAY" },
    {
      headers: { "Idempotency-Key": idempotencyKey },
      timeout: REQUEST_TIMEOUT_MS,
    }
  );
  return createPaymentResponseSchema.parse(response.data);
}

export async function getPayment(
  paymentId: string,
  signal?: AbortSignal
): Promise<PaymentStatus> {
  const response = await api.get(`/v1/payments/${encodeURIComponent(paymentId)}`, {
    signal,
    timeout: REQUEST_TIMEOUT_MS,
  });
  return paymentStatusSchema.parse(response.data);
}

export function parseCommercialSnapshot(value: string | null): CommercialSnapshot | null {
  if (!value) return null;
  try {
    return commercialSnapshotSchema.parse(JSON.parse(value));
  } catch {
    return null;
  }
}

export interface BookingEstimate {
  unitPrice: number;
  adultCount: number;
  childCount: number;
  packageAmount: number;
  singleRoomAmount: number;
  guideAmount: number;
  totalAmount: number;
}

export function calculateBookingEstimate(
  tour: TourDetail,
  participants: Pick<BookingParticipantInput, "participantType">[],
  singleRoomCount: number,
  guideOptionSelected: boolean,
  departure?: PublicDeparture | null
): BookingEstimate {
  const unitPrice = departure?.priceOverride ?? tour.basePrice;
  const adultCount = participants.filter(
    (participant) => participant.participantType === "ADULT"
  ).length;
  const childCount = participants.length - adultCount;
  const packageAmount =
    tour.priceModel === "PER_GROUP"
      ? unitPrice
      : unitPrice * adultCount +
        unitPrice * (tour.childPolicy.pricePercentage / 100) * childCount;
  const singleRoomAmount =
    tour.singleRoomSupplement * Math.max(0, singleRoomCount);
  const guideAmount =
    guideOptionSelected && tour.guideMode === "OPTIONAL"
      ? tour.optionalGuidePrice
      : 0;

  return {
    unitPrice,
    adultCount,
    childCount,
    packageAmount,
    singleRoomAmount,
    guideAmount,
    totalAmount: packageAmount + singleRoomAmount + guideAmount,
  };
}

export function buildBookingHref(tourId: string, departureId?: string): string {
  const base = `/dat-tour/${encodeURIComponent(tourId)}`;
  if (!departureId) return base;
  return `${base}?departureId=${encodeURIComponent(departureId)}`;
}

export function formatBookingStatus(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    PENDING: "Chờ thanh toán",
    CONFIRMED: "Đã xác nhận",
    EXPIRED: "Đã hết hạn",
    PAYMENT_FAILED: "Thanh toán thất bại",
    CANCELLED: "Đã hủy",
    COMPLETED: "Đã hoàn thành",
    PAYMENT_REVIEW_REQUIRED: "Cần đối soát thanh toán",
  };
  return labels[status];
}

export function formatBookingDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

export function getRemainingHoldSeconds(
  holdExpiresAt: string,
  nowMilliseconds = Date.now()
): number {
  return Math.max(0, Math.ceil((Date.parse(holdExpiresAt) - nowMilliseconds) / 1000));
}

export function formatHoldDuration(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

interface IdempotencyRecord {
  key: string;
  fingerprint: string;
}

type RequestKeyStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function getOrCreateRequestKey(
  storage: RequestKeyStorage,
  scope: string,
  payload: unknown,
  generateKey: () => string = () => crypto.randomUUID()
): string {
  const storageKey = `viet-kham-pha:idempotency:${scope}`;
  const fingerprint = stableStringify(payload);

  try {
    const raw = storage.getItem(storageKey);
    if (raw) {
      const existing = JSON.parse(raw) as Partial<IdempotencyRecord>;
      if (existing.key && existing.fingerprint === fingerprint) return existing.key;
    }
  } catch {
    // A malformed or unavailable session entry must not block checkout.
  }

  const key = generateKey();
  try {
    storage.setItem(storageKey, JSON.stringify({ key, fingerprint }));
  } catch {
    // The request can still be idempotent for the current attempt.
  }
  return key;
}

export function clearRequestKey(storage: RequestKeyStorage, scope: string): void {
  try {
    storage.removeItem(`viet-kham-pha:idempotency:${scope}`);
  } catch {
    // Storage cleanup is best effort only.
  }
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}

export function isAllowedPaymentRedirectUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "sandbox.vnpayment.vn" || url.hostname === "pay.vnpay.vn")
    );
  } catch {
    return false;
  }
}

export function getBookingRequestErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return "Dữ liệu đặt tour từ hệ thống chưa đúng định dạng. Vui lòng thử lại sau.";
  }
  if (axios.isAxiosError(error)) {
    const code = (error.response?.data as { error?: string } | undefined)?.error;
    const messages: Record<string, string> = {
      SLOT_UNAVAILABLE: "Số chỗ vừa thay đổi và không còn đủ cho nhóm của bạn. Vui lòng chọn lịch khác.",
      GROUP_SIZE_INVALID: "Số khách không nằm trong giới hạn của tour.",
      PRIVATE_START_DATE_INVALID: "Ngày khởi hành tour riêng không còn hợp lệ.",
      PAYMENT_WINDOW_EXPIRED: "Thời gian giữ chỗ đã hết. Vui lòng tạo booking mới.",
      PAYMENT_ALREADY_INITIATED: "Booking này đã có một giao dịch đang chờ xử lý.",
      BOOKING_NOT_PENDING: "Booking không còn ở trạng thái chờ thanh toán.",
      BOOKING_NOT_CANCELLABLE: "Booking hiện không thể hủy.",
      BOOKING_CANCEL_WINDOW_CLOSED: "Đã qua thời hạn cho phép hủy booking.",
      IDEMPOTENCY_KEY_REUSED: "Yêu cầu trước đã thay đổi. Vui lòng thử lại.",
      IDEMPOTENCY_KEY_EXPIRED: "Phiên gửi yêu cầu đã hết hạn. Vui lòng thử lại.",
    };
    if (code && messages[code]) return messages[code];
  }
  return getApiErrorMessage(error);
}

export function isCanceledBookingRequest(error: unknown): boolean {
  return axios.isCancel(error);
}
