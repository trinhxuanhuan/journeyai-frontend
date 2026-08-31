import { describe, expect, it } from "vitest";

import {
  formatNotificationTime,
  getSafeNotificationActionHref,
  parseNotificationPage,
} from "./notifications";

const notification = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "BOOKING_CONFIRMED",
  category: "PAYMENT",
  title: "Đặt tour đã được xác nhận",
  message: "Thanh toán thành công.",
  actionUrl: "/bookings/22222222-2222-4222-8222-222222222222",
  referenceType: "BOOKING",
  referenceId: "22222222-2222-4222-8222-222222222222",
  read: false,
  readAt: null,
  createdAt: "2026-08-31T08:00:00Z",
};

describe("notification helpers", () => {
  it("parses the notification page contract", () => {
    const page = parseNotificationPage({
      content: [notification],
      page: 0,
      size: 10,
      totalElements: 1,
      totalPages: 1,
      unreadCount: 1,
    });

    expect(page.content[0]).toMatchObject({
      type: "BOOKING_CONFIRMED",
      category: "PAYMENT",
      read: false,
    });
  });

  it("rejects a read flag that disagrees with readAt", () => {
    expect(() =>
      parseNotificationPage({
        content: [{ ...notification, read: true }],
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        unreadCount: 0,
      })
    ).toThrow();
  });

  it("accepts internal notification actions and blocks redirects", () => {
    expect(getSafeNotificationActionHref("/bookings/abc?from=notification#status"))
      .toBe("/bookings/abc?from=notification#status");
    expect(getSafeNotificationActionHref("//evil.example/path")).toBeNull();
    expect(getSafeNotificationActionHref("https://evil.example/path")).toBeNull();
    expect(getSafeNotificationActionHref("javascript:alert(1)")).toBeNull();
  });

  it("formats recent notification times in Vietnamese", () => {
    const now = Date.parse("2026-08-31T09:30:00Z");
    expect(formatNotificationTime("2026-08-31T09:29:40Z", now)).toBe("Vừa xong");
    expect(formatNotificationTime("2026-08-31T09:00:00Z", now)).toBe("30 phút trước");
    expect(formatNotificationTime("2026-08-31T07:30:00Z", now)).toBe("2 giờ trước");
  });
});
