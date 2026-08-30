import { describe, expect, it } from "vitest";

import {
  buildBookingHref,
  calculateBookingEstimate,
  clearRequestKey,
  formatBookingStatus,
  formatHoldDuration,
  getOrCreateRequestKey,
  getRemainingHoldSeconds,
  isAllowedPaymentRedirectUrl,
  parseCommercialSnapshot,
} from "./bookings";
import { parseTourDetail, type PublicDeparture } from "./tours";

const tour = parseTourDetail({
  id: "tour-hue",
  name: "Huế 3N2Đ",
  description: "Khám phá Huế",
  destination: { name: "Huế", province: "Thành phố Huế", geo: { lat: 16.46, lng: 107.59 } },
  coverImageUrl: null,
  images: [],
  basePrice: 3_000_000,
  tourType: "GROUP",
  priceModel: "PER_PERSON",
  departureLocation: "Huế",
  meetingPoint: "Ga Huế",
  meetingTime: "08:00",
  minGroupSize: 1,
  maxGroupSize: 20,
  guideMode: "INCLUDED",
  optionalGuidePrice: 0,
  durationDays: 3,
  durationNights: 2,
  included: [],
  excluded: [],
  packageDetails: { accommodation: [], transport: [], meals: [], tickets: [], insurance: [] },
  childPolicy: { description: "Trẻ em 75%", pricePercentage: 75 },
  singleRoomSupplement: 500_000,
  cancellationPolicy: [],
  itinerary: [{ dayNumber: 1, title: "Ngày đầu", activities: [] }],
  status: "ACTIVE",
  avgRating: 0,
  reviewCount: 0,
  createdAt: "2026-08-01T00:00:00Z",
  updatedAt: "2026-08-01T00:00:00Z",
});
class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

describe("booking helpers", () => {
  it("estimates group pricing with child, room supplement and departure override", () => {
    const departure = {
      priceOverride: 2_800_000,
    } as PublicDeparture;
    const result = calculateBookingEstimate(
      tour,
      [{ participantType: "ADULT" }, { participantType: "CHILD" }],
      1,
      false,
      departure
    );

    expect(result).toMatchObject({
      adultCount: 1,
      childCount: 1,
      packageAmount: 4_900_000,
      singleRoomAmount: 500_000,
      totalAmount: 5_400_000,
    });
  });

  it("reuses a key only for the same canonical payload", () => {
    const storage = new MemoryStorage();
    let sequence = 0;
    const generate = () => `key-${++sequence}`;

    const first = getOrCreateRequestKey(storage, "booking:1", { b: 2, a: 1 }, generate);
    const replay = getOrCreateRequestKey(storage, "booking:1", { a: 1, b: 2 }, generate);
    const changed = getOrCreateRequestKey(storage, "booking:1", { a: 2, b: 2 }, generate);

    expect(first).toBe("key-1");
    expect(replay).toBe("key-1");
    expect(changed).toBe("key-2");
    clearRequestKey(storage, "booking:1");
    expect(storage.getItem("viet-kham-pha:idempotency:booking:1")).toBeNull();
  });

  it("accepts only official HTTPS VNPay redirect hosts", () => {
    expect(isAllowedPaymentRedirectUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?a=1")).toBe(true);
    expect(isAllowedPaymentRedirectUrl("https://pay.vnpay.vn/paymentv2/vpcpay.html")).toBe(true);
    expect(isAllowedPaymentRedirectUrl("http://sandbox.vnpayment.vn/payment")).toBe(false);
    expect(isAllowedPaymentRedirectUrl("https://sandbox.vnpayment.vn.evil.test/payment")).toBe(false);
    expect(isAllowedPaymentRedirectUrl("javascript:alert(1)")).toBe(false);
  });

  it("formats routes, countdowns and statuses for the UI", () => {
    expect(buildBookingHref("tour 1", "dep/1")).toBe("/dat-tour/tour%201?departureId=dep%2F1");
    expect(getRemainingHoldSeconds("2026-08-30T10:01:01Z", Date.parse("2026-08-30T10:00:00Z"))).toBe(61);
    expect(formatHoldDuration(61)).toBe("01:01");
    expect(formatBookingStatus("PAYMENT_REVIEW_REQUIRED")).toBe("Cần đối soát thanh toán");
  });

  it("parses a valid commercial snapshot and tolerates legacy invalid data", () => {
    expect(parseCommercialSnapshot(JSON.stringify({ name: "Huế 3N2Đ" })))
      .toMatchObject({ name: "Huế 3N2Đ" });
    expect(parseCommercialSnapshot("not-json")).toBeNull();
    expect(parseCommercialSnapshot(null)).toBeNull();
  });
});
