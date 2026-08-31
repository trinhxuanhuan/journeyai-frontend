import axios from "axios";
import { z } from "zod";

import { api, getApiErrorMessage } from "@/lib/api";

const READ_TIMEOUT_MS = 12_000;
const GENERATION_TIMEOUT_MS = 65_000;

export const GROUP_PROFILES = ["SOLO", "COUPLE", "FAMILY", "FRIENDS", "SENIORS"] as const;
export const ITINERARY_PACES = ["RELAXED", "BALANCED", "ACTIVE"] as const;
export const TRANSPORT_PREFERENCES = [
  "PUBLIC_TRANSPORT",
  "TAXI_RIDESHARE",
  "MOTORBIKE",
  "PRIVATE_CAR",
  "FLEXIBLE",
] as const;

export type GroupProfile = (typeof GROUP_PROFILES)[number];
export type ItineraryPace = (typeof ITINERARY_PACES)[number];
export type TransportPreference = (typeof TRANSPORT_PREFERENCES)[number];

const instantSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Expected an ISO-8601 instant"
);
const localDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);
const shareTokenSchema = z.string().regex(/^[A-Za-z0-9_-]{20,100}$/);
const amountSchema = z
  .union([z.number(), z.string().trim().regex(/^-?\d+(?:\.\d+)?$/)])
  .transform(Number)
  .pipe(z.number().finite());
const nonnegativeAmountSchema = amountSchema.refine((value) => value >= 0, "Expected a non-negative amount");

const moneySchema = z.object({
  amount: nonnegativeAmountSchema,
  currency: z.literal("VND"),
});

const travelSchema = z.object({
  minutes: z.number().int().nonnegative(),
  mode: z.string().trim().min(1),
  label: z.string().trim().min(1),
});

const locationSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});

const budgetAlternativeSchema = z.object({
  placeId: z.string().trim().min(1),
  placeName: z.string().trim().min(1),
  estimatedCost: moneySchema,
});

const activitySchema = z.object({
  placeId: z.string().trim().min(1).nullable().optional().transform((value) => value ?? null),
  period: z.string().trim().min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  placeName: z.string().trim().min(1).nullable().optional().transform((value) => value ?? null),
  area: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  suggestion: z.string().trim().min(1),
  description: z.string().trim().min(1).optional(),
  whyRecommended: z.string().trim().min(1).optional(),
  culturalNote: z.string().trim().min(1).nullable().optional().transform((value) => value ?? null),
  durationMinutes: z.number().int().positive().optional(),
  estimatedCost: moneySchema,
  travelFromPrevious: travelSchema.optional(),
  location: locationSchema.nullable().optional().transform((value) => value ?? null),
  setting: z.string().trim().min(1).optional(),
  dataSource: z.string().trim().min(1).optional(),
  referenceOnly: z.boolean().optional().default(true),
  requiresUserConfirmation: z.boolean().optional().default(false),
  budgetAlternative: budgetAlternativeSchema.optional(),
});

const itineraryDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  date: localDateSchema.nullable().optional().transform((value) => value ?? null),
  title: z.string().trim().min(1),
  theme: z.string().trim().min(1).optional(),
  pace: z.enum(ITINERARY_PACES).optional(),
  activities: z.array(activitySchema).min(1),
  dailyActivityCost: moneySchema,
});

const costEstimateSchema = z.object({
  accommodation: nonnegativeAmountSchema,
  transport: nonnegativeAmountSchema,
  meals: nonnegativeAmountSchema,
  activities: nonnegativeAmountSchema,
  contingency: nonnegativeAmountSchema,
  total: nonnegativeAmountSchema,
  budget: nonnegativeAmountSchema,
  remaining: amountSchema,
  currency: z.literal("VND"),
  status: z.enum(["WITHIN_BUDGET", "TIGHT", "OVER_BUDGET"]),
  travelStyle: z.enum(["ECONOMY", "COMFORT", "PREMIUM"]),
  requestedTravelStyle: z.enum(["ECONOMY", "COMFORT", "PREMIUM"]),
  optimizedToBudget: z.boolean(),
});

const budgetAdjustmentSchema = z.object({
  dayNumber: z.number().int().positive(),
  placeId: z.string().trim().min(1),
  placeName: z.string().trim().min(1),
  savedAmount: nonnegativeAmountSchema,
  currency: z.literal("VND"),
  reason: z.literal("BUDGET_FIT"),
});

const qualitySummarySchema = z.object({
  score: z.number().finite().min(0).max(100),
  catalogCoverage: z.enum(["CURATED", "GENERIC"]),
  budgetFit: z.boolean(),
  scheduleFeasible: z.boolean(),
  placeholderDays: z.number().int().nonnegative(),
  placeholderActivities: z.number().int().nonnegative(),
});

const refinementHistorySchema = z.object({
  revision: z.number().int().positive(),
  instruction: z.string().trim().min(1),
  appliedChanges: z.array(z.string()),
  createdAt: instantSchema,
});

const itinerarySchema = z
  .object({
    id: objectIdSchema,
    userId: z.string().trim().min(1).optional(),
    destination: z.string().trim().min(1),
    destinationDisplayName: z.string().trim().min(1),
    days: z.number().int().min(1).max(30),
    budget: nonnegativeAmountSchema,
    travelerCount: z.number().int().min(1).max(30),
    childrenCount: z.number().int().min(0).max(20),
    seniorCount: z.number().int().min(0).max(20),
    groupProfile: z.enum(GROUP_PROFILES),
    preferences: z.array(z.string().trim().min(1)).max(12),
    pace: z.enum(ITINERARY_PACES),
    transportPreference: z.enum(TRANSPORT_PREFERENCES),
    startDate: localDateSchema.nullable().optional().transform((value) => value ?? null),
    overview: z.string().trim().min(1),
    itineraryDays: z.array(itineraryDaySchema).min(1),
    costEstimate: costEstimateSchema,
    budgetAdjustments: z.array(budgetAdjustmentSchema),
    warnings: z.array(z.string().trim().min(1)),
    assumptions: z.array(z.string().trim().min(1)),
    qualitySummary: qualitySummarySchema,
    plannerVersion: z.string().trim().min(1),
    schemaVersion: z.string().trim().min(1),
    catalogVersion: z.string().trim().min(1),
    effectiveTransport: z.string().trim().min(1),
    generationProvider: z.string().trim().min(1),
    revision: z.number().int().positive(),
    refinementHistory: z.array(refinementHistorySchema).optional().default([]),
    shareEnabled: z.boolean(),
    createdAt: instantSchema,
    updatedAt: instantSchema,
  })
  .superRefine((itinerary, context) => {
    if (itinerary.childrenCount + itinerary.seniorCount > itinerary.travelerCount) {
      context.addIssue({ code: "custom", path: ["travelerCount"], message: "Invalid group composition" });
    }
    if (itinerary.itineraryDays.length !== itinerary.days) {
      context.addIssue({ code: "custom", path: ["itineraryDays"], message: "Day count does not match" });
    }
  });

const catalogSchema = z.object({
  catalogVersion: z.string().trim().min(1),
  referenceNotice: z.string().trim().min(1),
  supportedDestinations: z.array(
    z.object({
      id: z.string().trim().min(1),
      name: z.string().trim().min(1),
      aliases: z.array(z.string()),
    })
  ),
});

const itineraryListSchema = z.object({
  items: z.array(itinerarySchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive().max(100),
});

const shareResponseSchema = z.object({
  shareToken: shareTokenSchema,
  sharePath: z.string().startsWith("/v1/ai/shared/"),
});

export const createItineraryInputSchema = z
  .object({
    destination: z.string().trim().min(2, "Hãy chọn hoặc nhập điểm đến").max(120),
    days: z.number().int().min(1, "Số ngày tối thiểu là 1").max(30, "Số ngày tối đa là 30"),
    budget: z.number().finite().min(100_000, "Ngân sách tối thiểu là 100.000đ"),
    travelerCount: z.number().int().min(1).max(30),
    childrenCount: z.number().int().min(0).max(20),
    seniorCount: z.number().int().min(0).max(20),
    groupProfile: z.enum(GROUP_PROFILES),
    preferences: z.array(z.string().trim().min(1)).max(12),
    pace: z.enum(ITINERARY_PACES),
    transportPreference: z.enum(TRANSPORT_PREFERENCES),
    startDate: z.union([localDateSchema, z.literal("")]).optional(),
  })
  .superRefine((value, context) => {
    if (value.childrenCount + value.seniorCount > value.travelerCount) {
      context.addIssue({
        code: "custom",
        path: ["travelerCount"],
        message: "Tổng số trẻ em và người cao tuổi không được vượt quá tổng số khách",
      });
    }
  });

export type AiCatalog = z.infer<typeof catalogSchema>;
export type AiItinerary = z.infer<typeof itinerarySchema>;
export type AiItineraryDay = z.infer<typeof itineraryDaySchema>;
export type AiActivity = z.infer<typeof activitySchema>;
export type AiItineraryList = z.infer<typeof itineraryListSchema>;
export type CreateItineraryInput = z.infer<typeof createItineraryInputSchema>;

export function parseAiItinerary(value: unknown): AiItinerary {
  return itinerarySchema.parse(value);
}

export function parseAiCatalog(value: unknown): AiCatalog {
  return catalogSchema.parse(value);
}

export async function getAiCatalog(signal?: AbortSignal): Promise<AiCatalog> {
  const response = await api.get("/v1/ai/catalog", { signal, timeout: READ_TIMEOUT_MS });
  return catalogSchema.parse(response.data);
}

export async function createAiItinerary(input: CreateItineraryInput): Promise<AiItinerary> {
  const payload = { ...input, startDate: input.startDate || null };
  const response = await api.post("/v1/ai/itineraries", payload, { timeout: GENERATION_TIMEOUT_MS });
  return itinerarySchema.parse(response.data);
}

export async function listMyAiItineraries(
  page: number,
  size = 12,
  signal?: AbortSignal
): Promise<AiItineraryList> {
  const response = await api.get("/v1/ai/itineraries/me", {
    params: { page, size },
    signal,
    timeout: READ_TIMEOUT_MS,
  });
  return itineraryListSchema.parse(response.data);
}

export async function getAiItinerary(id: string, signal?: AbortSignal): Promise<AiItinerary> {
  const response = await api.get(`/v1/ai/itineraries/${encodeURIComponent(id)}`, {
    signal,
    timeout: READ_TIMEOUT_MS,
  });
  return itinerarySchema.parse(response.data);
}

export async function refineAiItinerary(
  id: string,
  instruction: string,
  lockedDayNumbers: number[]
): Promise<AiItinerary> {
  const response = await api.post(
    `/v1/ai/itineraries/${encodeURIComponent(id)}/refine`,
    { instruction: instruction.trim(), lockedDayNumbers },
    { timeout: GENERATION_TIMEOUT_MS }
  );
  return itinerarySchema.parse(response.data);
}

export async function shareAiItinerary(id: string): Promise<string> {
  const response = await api.post(
    `/v1/ai/itineraries/${encodeURIComponent(id)}/share`,
    undefined,
    { timeout: READ_TIMEOUT_MS }
  );
  return shareResponseSchema.parse(response.data).shareToken;
}

export async function getSharedAiItinerary(
  token: string,
  signal?: AbortSignal
): Promise<AiItinerary> {
  const response = await api.get(`/v1/ai/shared/${encodeURIComponent(token)}`, {
    signal,
    timeout: READ_TIMEOUT_MS,
  });
  return itinerarySchema.parse(response.data);
}

export function isValidAiItineraryId(value: string): boolean {
  return objectIdSchema.safeParse(value).success;
}

export function isValidAiShareToken(value: string): boolean {
  return shareTokenSchema.safeParse(value).success;
}

export function getAiItineraryErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return "Dữ liệu lịch trình từ hệ thống chưa đúng định dạng. Vui lòng thử lại sau.";
  }
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: unknown } | undefined;
    if (typeof data?.detail === "string") return data.detail;
    if (error.code === "ECONNABORTED") {
      return "Việc lập lịch đang mất nhiều thời gian hơn dự kiến. Vui lòng thử lại sau ít phút.";
    }
  }
  return getApiErrorMessage(error);
}

export function isCanceledAiRequest(error: unknown): boolean {
  return axios.isCancel(error);
}

export function formatAiMoney(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatAiDate(value: string | null | undefined): string {
  if (!value) return "Ngày linh hoạt";
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

export function formatItineraryOverview(value: string): string {
  return value
    .replace(/nhịp relaxed/gi, "nhịp thư thả")
    .replace(/nhịp balanced/gi, "nhịp cân bằng")
    .replace(/nhịp active/gi, "nhịp năng động");
}
