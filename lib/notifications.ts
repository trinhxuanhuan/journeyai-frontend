import axios from "axios";
import { z } from "zod";

import { api, getApiErrorMessage } from "@/lib/api";

const NOTIFICATION_REQUEST_TIMEOUT_MS = 10_000;

export const NOTIFICATION_FILTERS = ["ALL", "UNREAD", "READ"] as const;
export type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number];

export const NOTIFICATION_CATEGORIES = [
  "BOOKING",
  "PAYMENT",
  "DEPARTURE",
  "SYSTEM",
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

const instantSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Expected an ISO-8601 instant"
);

const nullableTextSchema = z
  .string()
  .nullable()
  .optional()
  .transform((value) => value?.trim() || null);

const notificationSchema = z
  .object({
    id: z.string().uuid(),
    type: z.string().trim().min(1),
    category: z.enum(NOTIFICATION_CATEGORIES),
    title: z.string().trim().min(1),
    message: z.string().trim().min(1),
    actionUrl: nullableTextSchema,
    referenceType: nullableTextSchema,
    referenceId: nullableTextSchema,
    read: z.boolean(),
    readAt: instantSchema.nullable(),
    createdAt: instantSchema,
  })
  .superRefine((notification, context) => {
    if (notification.read !== Boolean(notification.readAt)) {
      context.addIssue({
        code: "custom",
        message: "read must match readAt",
        path: ["read"],
      });
    }
  });

const notificationPageSchema = z.object({
  content: z.array(notificationSchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive().max(100),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  unreadCount: z.number().int().nonnegative(),
});

const unreadCountSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
});

const markAllReadSchema = z.object({
  updatedCount: z.number().int().nonnegative(),
});

const notificationPreferenceSchema = z.object({
  emailEnabled: z.boolean(),
});

export type NotificationItem = z.infer<typeof notificationSchema>;
export type NotificationPage = z.infer<typeof notificationPageSchema>;
export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>;

export function parseNotificationPage(value: unknown): NotificationPage {
  return notificationPageSchema.parse(value);
}

export async function getNotifications(
  status: NotificationFilter,
  page: number,
  size = 10,
  signal?: AbortSignal
): Promise<NotificationPage> {
  const response = await api.get("/v1/notifications", {
    params: { status, page, size },
    signal,
    timeout: NOTIFICATION_REQUEST_TIMEOUT_MS,
  });
  return notificationPageSchema.parse(response.data);
}

export async function getUnreadNotificationCount(
  signal?: AbortSignal
): Promise<number> {
  const response = await api.get("/v1/notifications/unread-count", {
    signal,
    timeout: NOTIFICATION_REQUEST_TIMEOUT_MS,
  });
  return unreadCountSchema.parse(response.data).unreadCount;
}

export async function markNotificationRead(
  notificationId: string
): Promise<NotificationItem> {
  const response = await api.patch(
    `/v1/notifications/${encodeURIComponent(notificationId)}/read`,
    undefined,
    { timeout: NOTIFICATION_REQUEST_TIMEOUT_MS }
  );
  return notificationSchema.parse(response.data);
}

export async function markAllNotificationsRead(): Promise<number> {
  const response = await api.patch(
    "/v1/notifications/read-all",
    undefined,
    { timeout: NOTIFICATION_REQUEST_TIMEOUT_MS }
  );
  return markAllReadSchema.parse(response.data).updatedCount;
}

export async function getNotificationPreference(
  signal?: AbortSignal
): Promise<NotificationPreference> {
  const response = await api.get("/v1/notifications/preferences", {
    signal,
    timeout: NOTIFICATION_REQUEST_TIMEOUT_MS,
  });
  return notificationPreferenceSchema.parse(response.data);
}

export async function updateNotificationPreference(
  emailEnabled: boolean
): Promise<NotificationPreference> {
  const response = await api.patch(
    "/v1/notifications/preferences",
    { emailEnabled },
    { timeout: NOTIFICATION_REQUEST_TIMEOUT_MS }
  );
  return notificationPreferenceSchema.parse(response.data);
}

export function getSafeNotificationActionHref(
  value: string | null | undefined
): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;

  try {
    const base = "https://viet-kham-pha.local";
    const url = new URL(value, base);
    if (url.origin !== base || url.username || url.password) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function formatNotificationTime(
  value: string,
  nowMilliseconds = Date.now()
): string {
  const timestamp = Date.parse(value);
  const elapsedMilliseconds = Math.max(0, nowMilliseconds - timestamp);
  const elapsedMinutes = Math.floor(elapsedMilliseconds / 60_000);

  if (elapsedMinutes < 1) return "Vừa xong";
  if (elapsedMinutes < 60) return `${elapsedMinutes} phút trước`;

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours < 24) return `${elapsedHours} giờ trước`;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(timestamp));
}

export function getNotificationRequestErrorMessage(error: unknown): string {
  if (error instanceof z.ZodError) {
    return "Dữ liệu thông báo từ hệ thống chưa đúng định dạng. Vui lòng thử lại sau.";
  }
  return getApiErrorMessage(error);
}

export function isCanceledNotificationRequest(error: unknown): boolean {
  return axios.isCancel(error);
}
