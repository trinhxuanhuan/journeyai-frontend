import axios from "axios";
import { z } from "zod";

import { api, getApiErrorMessage } from "@/lib/api";

export const TOUR_PAGE_SIZE = 9;
const TOUR_REQUEST_TIMEOUT_MS = 10_000;

export const TOUR_SORT_OPTIONS = [
  "relevance",
  "priceAsc",
  "priceDesc",
  "ratingDesc",
] as const;

export type TourSortOption = (typeof TOUR_SORT_OPTIONS)[number];
export const TOUR_TYPES = ["GROUP", "PRIVATE"] as const;
export type TourType = (typeof TOUR_TYPES)[number];
export type TourTypeFilter = "" | TourType;

export interface TourSearchQuery {
  q: string;
  destination: string;
  tourType: TourTypeFilter;
  sortBy: TourSortOption;
  page: number;
}

const VIETNAMESE_TOUR_TEXT: Readonly<Record<string, string>> = {
  "Da Lat Mong Mo 3N2D": "Đà Lạt Mộng Mơ — 3 ngày 2 đêm",
  "Hoi An 2N1D": "Hội An — 2 ngày 1 đêm",
  "Thanh pho ngan hoa, khong khi mat me quanh nam":
    "Thành phố ngàn hoa, không khí mát mẻ quanh năm.",
  "Kham pha pho co Hoi An": "Khám phá phố cổ Hội An.",
  "Kham pha trung tam": "Khám phá trung tâm",
  "Pho co ban dem": "Phố cổ ban đêm",
  "Tham quan pho co": "Tham quan phố cổ",
  "Cho Da Lat": "Chợ Đà Lạt",
  "Lam Dong": "Lâm Đồng",
  "Quang Nam": "Quảng Nam",
};

function localizeTourText(value: string): string {
  return VIETNAMESE_TOUR_TEXT[value] ?? value;
}

const localizedTextSchema = z
  .string()
  .trim()
  .min(1)
  .transform(localizeTourText);

const nullableTextSchema = z
  .string()
  .nullable()
  .optional()
  .transform((value) => value?.trim() || null);

const nonNegativeMoneySchema = z.number().finite().nonnegative();
const positiveMoneySchema = z.number().finite().positive();
const tourTypeSchema = z.enum(TOUR_TYPES);
const priceModelSchema = z.enum(["PER_PERSON", "PER_GROUP"]);
const guideModeSchema = z.enum(["INCLUDED", "OPTIONAL", "NONE"]);
const departureStatusSchema = z.enum([
  "OPEN",
  "FULL",
  "CLOSED",
  "CANCELLED",
  "COMPLETED",
]);

const instantSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Expected an ISO-8601 instant"
);

function isValidLocalDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const localDateSchema = z.string().refine(isValidLocalDate, "Expected YYYY-MM-DD");

const tourSearchItemSchema = z.object({
  tourId: z.string().trim().min(1),
  name: localizedTextSchema,
  coverImageUrl: nullableTextSchema,
  basePrice: nonNegativeMoneySchema,
  avgRating: nonNegativeMoneySchema.nullable().transform((value) => value ?? 0),
  tourType: tourTypeSchema,
  departureLocation: localizedTextSchema,
  destinationName: localizedTextSchema.nullable().optional().transform((value) => value ?? null),
  nearestDepartureDate: instantSchema.nullable(),
  hasAvailableSlot: z.boolean(),
});

const tourSearchResponseSchema = z.object({
  items: z.array(tourSearchItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
});

const geoSchema = z.object({
  lat: z.number().finite(),
  lng: z.number().finite(),
});

const activitySchema = z.object({
  time: z.string().trim().min(1),
  description: localizedTextSchema,
  location: geoSchema.nullable().optional().transform((value) => value ?? null),
});

const itineraryDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  title: localizedTextSchema,
  activities: z.array(activitySchema),
});

const imageListSchema = z
  .array(z.string())
  .nullable()
  .optional()
  .transform((items) =>
    (items ?? []).map((item) => item.trim()).filter((item) => item.length > 0)
  );

const textListSchema = z
  .array(localizedTextSchema)
  .nullable()
  .optional()
  .transform((items) => items ?? []);

const packageDetailsSchema = z.object({
  accommodation: textListSchema,
  transport: textListSchema,
  meals: textListSchema,
  tickets: textListSchema,
  insurance: textListSchema,
});

const childPolicySchema = z.object({
  description: localizedTextSchema,
  pricePercentage: z.number().finite().min(0).max(100),
});

const cancellationRuleSchema = z.object({
  minimumDaysBeforeDeparture: z.number().int().nonnegative(),
  refundPercentage: z.number().int().min(0).max(100),
});

const tourDetailSchema = z
  .object({
    id: z.string().trim().min(1),
    name: localizedTextSchema,
    description: localizedTextSchema,
    destination: z
      .object({
        name: localizedTextSchema.nullable().optional(),
        province: localizedTextSchema,
        geo: geoSchema,
      })
      .transform((destination) => ({
        ...destination,
        name: destination.name ?? destination.province,
      })),
    coverImageUrl: nullableTextSchema,
    images: imageListSchema,
    basePrice: positiveMoneySchema,
    tourType: tourTypeSchema,
    priceModel: priceModelSchema,
    departureLocation: localizedTextSchema,
    meetingPoint: nullableTextSchema,
    meetingTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/)
      .nullable()
      .optional()
      .transform((value) => value ?? null),
    minGroupSize: z.number().int().positive(),
    maxGroupSize: z.number().int().positive(),
    guideMode: guideModeSchema,
    optionalGuidePrice: nonNegativeMoneySchema,
    durationDays: z.number().int().positive(),
    durationNights: z.number().int().nonnegative(),
    included: textListSchema,
    excluded: textListSchema,
    packageDetails: packageDetailsSchema,
    childPolicy: childPolicySchema,
    singleRoomSupplement: nonNegativeMoneySchema,
    cancellationPolicy: z.array(cancellationRuleSchema),
    itinerary: z.array(itineraryDaySchema).min(1),
    status: z.literal("ACTIVE"),
    avgRating: nonNegativeMoneySchema
      .nullable()
      .transform((value) => value ?? 0),
    reviewCount: z
      .number()
      .int()
      .nonnegative()
      .nullable()
      .transform((value) => value ?? 0),
    createdAt: instantSchema,
    updatedAt: instantSchema,
  })
  .superRefine((tour, context) => {
    if (tour.maxGroupSize < tour.minGroupSize) {
      context.addIssue({
        code: "custom",
        message: "maxGroupSize must be greater than or equal to minGroupSize",
        path: ["maxGroupSize"],
      });
    }

    if (
      tour.tourType === "GROUP" &&
      (tour.priceModel !== "PER_PERSON" || tour.guideMode !== "INCLUDED")
    ) {
      context.addIssue({
        code: "custom",
        message: "GROUP tours must use PER_PERSON pricing and include a guide",
        path: ["tourType"],
      });
    }
  });

const publicDepartureSchema = z
  .object({
    departureId: z.string().uuid(),
    tourId: z.string().trim().min(1),
    startDate: localDateSchema,
    endDate: localDateSchema,
    capacity: z.number().int().positive(),
    reservedSeats: z.number().int().nonnegative(),
    availableSeats: z.number().int().nonnegative(),
    guideId: z.string().trim().min(1),
    priceOverride: positiveMoneySchema.nullable(),
    status: departureStatusSchema,
    bookable: z.boolean(),
  })
  .superRefine((departure, context) => {
    if (departure.endDate < departure.startDate) {
      context.addIssue({
        code: "custom",
        message: "endDate must not be before startDate",
        path: ["endDate"],
      });
    }
    if (departure.capacity !== departure.reservedSeats + departure.availableSeats) {
      context.addIssue({
        code: "custom",
        message: "capacity must equal reservedSeats plus availableSeats",
        path: ["capacity"],
      });
    }
    if (
      departure.bookable !==
      (departure.status === "OPEN" && departure.availableSeats > 0)
    ) {
      context.addIssue({
        code: "custom",
        message: "bookable must match OPEN status and availableSeats",
        path: ["bookable"],
      });
    }
  });

const publicDeparturesSchema = z.array(publicDepartureSchema);

export type TourSearchItem = z.infer<typeof tourSearchItemSchema>;
export type TourSearchResponse = z.infer<typeof tourSearchResponseSchema>;
export type TourDetail = z.infer<typeof tourDetailSchema>;
export type PublicDeparture = z.infer<typeof publicDepartureSchema>;

export function parseTourSearchResponse(value: unknown): TourSearchResponse {
  return tourSearchResponseSchema.parse(value);
}

export function parseTourDetail(value: unknown): TourDetail {
  return tourDetailSchema.parse(value);
}

export function parsePublicDepartures(value: unknown): PublicDeparture[] {
  return publicDeparturesSchema.parse(value);
}

export function parseTourSearchQuery(
  searchParams: Pick<URLSearchParams, "get">
): TourSearchQuery {
  const rawQuery = searchParams.get("q")?.trim() ?? "";
  const rawDestination = searchParams.get("destination")?.trim() ?? "";
  const rawTourType = searchParams.get("tourType")?.trim().toUpperCase() ?? "";
  const rawSort = searchParams.get("sortBy");
  const rawPage = Number(searchParams.get("page"));

  const sortBy = TOUR_SORT_OPTIONS.includes(rawSort as TourSortOption)
    ? (rawSort as TourSortOption)
    : "relevance";
  const page = Number.isInteger(rawPage) && rawPage >= 0 ? rawPage : 0;
  const tourType = TOUR_TYPES.includes(rawTourType as TourType)
    ? (rawTourType as TourType)
    : "";

  return {
    q: rawQuery.slice(0, 100),
    destination: rawDestination.slice(0, 100),
    tourType,
    sortBy,
    page,
  };
}

export function buildTourSearchParams(
  query: TourSearchQuery
): Record<string, string | number> {
  const normalizedQuery = query.q.trim().slice(0, 100);
  const normalizedDestination = query.destination.trim().slice(0, 100);
  const page = Number.isInteger(query.page) && query.page >= 0 ? query.page : 0;

  return {
    ...(normalizedQuery ? { q: normalizedQuery } : {}),
    ...(normalizedDestination ? { destination: normalizedDestination } : {}),
    ...(query.tourType ? { tourType: query.tourType } : {}),
    ...(query.sortBy !== "relevance" ? { sortBy: query.sortBy } : {}),
    page,
    size: TOUR_PAGE_SIZE,
  };
}

export function buildTourDiscoveryHref(query: TourSearchQuery): string {
  const params = new URLSearchParams();
  const normalizedQuery = query.q.trim().slice(0, 100);
  const normalizedDestination = query.destination.trim().slice(0, 100);

  if (normalizedQuery) params.set("q", normalizedQuery);
  if (normalizedDestination) params.set("destination", normalizedDestination);
  if (query.tourType) params.set("tourType", query.tourType);
  if (query.sortBy !== "relevance") params.set("sortBy", query.sortBy);
  if (query.page > 0) params.set("page", String(query.page));

  const queryString = params.toString();
  return queryString ? `/?${queryString}` : "/";
}

export async function searchTours(
  query: TourSearchQuery,
  signal?: AbortSignal
): Promise<TourSearchResponse> {
  const response = await api.get("/v1/tours", {
    params: buildTourSearchParams(query),
    signal,
    timeout: TOUR_REQUEST_TIMEOUT_MS,
  });
  return parseTourSearchResponse(response.data);
}

export async function getTourDetail(
  tourId: string,
  signal?: AbortSignal
): Promise<TourDetail> {
  const response = await api.get(`/v1/tours/${encodeURIComponent(tourId)}`, {
    signal,
    timeout: TOUR_REQUEST_TIMEOUT_MS,
  });
  return parseTourDetail(response.data);
}

export async function getPublicDepartures(
  tourId: string,
  signal?: AbortSignal
): Promise<PublicDeparture[]> {
  const response = await api.get(
    `/v1/tours/${encodeURIComponent(tourId)}/departures`,
    { signal, timeout: TOUR_REQUEST_TIMEOUT_MS }
  );
  return parsePublicDepartures(response.data);
}

export function isTourNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function isCanceledTourRequest(error: unknown): boolean {
  return axios.isCancel(error);
}

export function getTourRequestErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return "Dữ liệu tour từ hệ thống chưa đúng định dạng. Vui lòng thử lại sau.";
  }
  return getApiErrorMessage(error);
}

export function getSafeTourImageUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

const priceFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const vietnamInstantFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Ho_Chi_Minh",
});

const localDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

export function formatTourPrice(value: number): string {
  return priceFormatter.format(value);
}

export function formatVietnamInstant(value: string): string {
  return vietnamInstantFormatter.format(new Date(value));
}

export function formatDepartureDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return localDateFormatter.format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatMeetingTime(value: string | null): string | null {
  return value ? value.slice(0, 5) : null;
}

export function formatTourDuration(days: number, nights: number): string {
  return `${days} ngày ${nights} đêm`;
}

export function getTourTypeLabel(value: TourType): string {
  return value === "GROUP" ? "Tour ghép trọn gói" : "Tour riêng";
}

const DESTINATION_LABELS: Readonly<Record<string, string>> = {
  "Thừa Thiên Huế": "Huế",
  "Quảng Nam": "Hội An - Quảng Nam",
  "Kiên Giang": "Phú Quốc - Kiên Giang",
  "Thành phố Huế": "Huế",
  "Thành phố Đà Nẵng": "Đà Nẵng",
};

export function getDestinationDisplayName(value: string): string {
  return DESTINATION_LABELS[value] ?? value;
}

export function getPriceUnitLabel(priceModel: "PER_PERSON" | "PER_GROUP"): string {
  return priceModel === "PER_PERSON" ? "/ khách" : "/ nhóm";
}

export function getItineraryPeriod(time: string): string {
  const hour = Number(time.slice(0, 2));
  if (!Number.isInteger(hour)) return "Trong ngày";
  if (hour < 11) return "Buổi sáng";
  if (hour < 14) return "Buổi trưa";
  if (hour < 18) return "Buổi chiều";
  return "Buổi tối";
}

export function getActivityMapUrl(location: { lat: number; lng: number }): string {
  const query = encodeURIComponent(`${location.lat},${location.lng}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
