import { describe, expect, it } from "vitest";

import {
  buildTourDiscoveryHref,
  buildTourSearchParams,
  formatDepartureDate,
  formatTourDuration,
  getActivityMapUrl,
  getItineraryPeriod,
  getPriceUnitLabel,
  getSafeTourImageUrl,
  getTourTypeLabel,
  parsePublicDepartures,
  parseTourDetail,
  parseTourSearchQuery,
  parseTourSearchResponse,
  TOUR_PAGE_SIZE,
} from "./tours";

const validSearchItem = {
  tourId: "tour-ha-giang",
  name: "Hà Giang mùa đá nở hoa",
  coverImageUrl: "https://cdn.example.test/ha-giang.webp",
  basePrice: 4_500_000,
  avgRating: 4.8,
  tourType: "GROUP",
  departureLocation: "Hà Nội",
  destinationName: "Hà Giang",
  nearestDepartureDate: "2026-09-02T00:00:00Z",
  hasAvailableSlot: true,
};

const validTourDetail = {
  id: "tour-ha-giang",
  name: "Hà Giang mùa đá nở hoa",
  description: "Một hành trình qua cao nguyên đá.",
  destination: {
    name: "Hà Giang",
    province: "Hà Giang",
    geo: { lat: 22.8233, lng: 104.9836 },
  },
  coverImageUrl: null,
  images: null,
  basePrice: 4_500_000,
  tourType: "GROUP",
  priceModel: "PER_PERSON",
  departureLocation: "Hà Nội",
  meetingPoint: "Nhà hát Lớn Hà Nội",
  meetingTime: "05:30:00",
  minGroupSize: 1,
  maxGroupSize: 24,
  guideMode: "INCLUDED",
  optionalGuidePrice: 0,
  durationDays: 3,
  durationNights: 2,
  included: ["Xe du lịch", "Khách sạn", "Hướng dẫn viên"],
  excluded: ["Chi tiêu cá nhân"],
  packageDetails: {
    accommodation: ["Khách sạn 3 sao, phòng đôi"],
    transport: ["Xe du lịch theo chương trình"],
    meals: ["Các bữa ăn theo lịch trình"],
    tickets: ["Vé tham quan theo chương trình"],
    insurance: ["Bảo hiểm du lịch nội địa"],
  },
  childPolicy: {
    description: "Trẻ em tính 70% giá người lớn",
    pricePercentage: 70,
  },
  singleRoomSupplement: 500_000,
  cancellationPolicy: [
    { minimumDaysBeforeDeparture: 7, refundPercentage: 100 },
    { minimumDaysBeforeDeparture: 3, refundPercentage: 50 },
    { minimumDaysBeforeDeparture: 0, refundPercentage: 0 },
  ],
  itinerary: [
    {
      dayNumber: 1,
      title: "Chạm ngõ cao nguyên",
      activities: [
        {
          time: "08:00",
          description: "Khởi hành",
          location: null,
        },
      ],
    },
  ],
  status: "ACTIVE",
  avgRating: 0,
  reviewCount: 0,
  createdAt: "2026-08-01T02:00:00Z",
  updatedAt: "2026-08-02T02:00:00Z",
};

describe("public tour API contracts", () => {
  it("accepts the exact search response exposed by Tour Service", () => {
    const response = parseTourSearchResponse({
      items: [validSearchItem],
      total: 1,
      page: 0,
    });

    expect(response.items[0]).toMatchObject({
      tourId: "tour-ha-giang",
      hasAvailableSlot: true,
    });
  });

  it("rejects malformed pricing instead of rendering misleading tour data", () => {
    expect(() =>
      parseTourSearchResponse({
        items: [{ ...validSearchItem, basePrice: -1 }],
        total: 1,
        page: 0,
      })
    ).toThrow();
  });

  it("normalizes nullable image and review fields from legacy tour documents", () => {
    expect(parseTourDetail(validTourDetail)).toMatchObject({
      images: [],
      avgRating: 0,
      reviewCount: 0,
    });
  });

  it("adds Vietnamese diacritics to legacy public tour content", () => {
    const searchResponse = parseTourSearchResponse({
      items: [
        {
          ...validSearchItem,
          name: "Da Lat Mong Mo 3N2D",
        },
      ],
      total: 1,
      page: 0,
    });
    const detail = parseTourDetail({
      ...validTourDetail,
      name: "Hoi An 2N1D",
      description: "Kham pha pho co Hoi An",
      destination: { ...validTourDetail.destination, province: "Quang Nam" },
      itinerary: [
        {
          dayNumber: 1,
          title: "Pho co ban dem",
          activities: [
            {
              time: "18:00",
              description: "Tham quan pho co",
              location: null,
            },
          ],
        },
      ],
    });

    expect(searchResponse.items[0].name).toBe(
      "Đà Lạt Mộng Mơ — 3 ngày 2 đêm"
    );
    expect(detail).toMatchObject({
      name: "Hội An — 2 ngày 1 đêm",
      description: "Khám phá phố cổ Hội An.",
      destination: { province: "Quảng Nam" },
      itinerary: [
        {
          title: "Phố cổ ban đêm",
          activities: [{ description: "Tham quan phố cổ" }],
        },
      ],
    });
  });

  it("enforces the Booking Service invariant between inventory and bookable", () => {
    expect(() =>
      parsePublicDepartures([
        {
          departureId: "4d34df69-d64f-4cc8-a3dd-e1adb95a73c0",
          tourId: "tour-ha-giang",
          startDate: "2026-09-20",
          endDate: "2026-09-22",
          capacity: 20,
          reservedSeats: 20,
          availableSeats: 0,
          guideId: "guide-1",
          priceOverride: null,
          status: "FULL",
          bookable: true,
        },
      ])
    ).toThrow(/bookable must match OPEN status and availableSeats/);
  });

  it("accepts both bookable and sold-out future departures", () => {
    expect(
      parsePublicDepartures([
        {
          departureId: "4d34df69-d64f-4cc8-a3dd-e1adb95a73c0",
          tourId: "tour-ha-giang",
          startDate: "2026-09-20",
          endDate: "2026-09-22",
          capacity: 20,
          reservedSeats: 17,
          availableSeats: 3,
          guideId: "guide-1",
          priceOverride: 4_800_000,
          status: "OPEN",
          bookable: true,
        },
        {
          departureId: "cf2ac45f-ae92-472e-ae90-641ba3ce5408",
          tourId: "tour-ha-giang",
          startDate: "2026-10-20",
          endDate: "2026-10-22",
          capacity: 20,
          reservedSeats: 20,
          availableSeats: 0,
          guideId: "guide-2",
          priceOverride: null,
          status: "FULL",
          bookable: false,
        },
      ])
    ).toHaveLength(2);
  });
});

describe("tour discovery query", () => {
  it("normalizes unsupported URL values to a safe first page", () => {
    const params = new URLSearchParams(
      "q=%20H%C3%A0%20Giang%20&sortBy=unknown&page=-4"
    );

    expect(parseTourSearchQuery(params)).toEqual({
      q: "Hà Giang",
      destination: "",
      tourType: "",
      sortBy: "relevance",
      page: 0,
    });
  });

  it("sends only parameters that Tour Service currently implements", () => {
    expect(
      buildTourSearchParams({
        q: "  phố cổ  ",
        destination: "  Hội An  ",
        tourType: "PRIVATE",
        sortBy: "priceAsc",
        page: 2,
      })
    ).toEqual({
      q: "phố cổ",
      destination: "Hội An",
      tourType: "PRIVATE",
      sortBy: "priceAsc",
      page: 2,
      size: TOUR_PAGE_SIZE,
    });
  });

  it("builds a shareable URL without redundant defaults", () => {
    expect(
      buildTourDiscoveryHref({
        q: "ẩm thực",
        destination: "Huế",
        tourType: "GROUP",
        sortBy: "relevance",
        page: 0,
      })
    ).toBe(
      "/?q=%E1%BA%A9m+th%E1%BB%B1c&destination=Hu%E1%BA%BF&tourType=GROUP"
    );
  });
});

describe("tour presentation helpers", () => {
  it("rejects executable image schemes while keeping web and local images", () => {
    expect(getSafeTourImageUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeTourImageUrl("//attacker.example/image.jpg")).toBeNull();
    expect(getSafeTourImageUrl("/images/tour.webp")).toBe("/images/tour.webp");
    expect(getSafeTourImageUrl("https://cdn.example.test/tour.webp")).toBe(
      "https://cdn.example.test/tour.webp"
    );
  });

  it("formats a LocalDate without shifting it across time zones", () => {
    expect(formatDepartureDate("2026-09-02")).toContain("02/09/2026");
  });

  it("uses customer-facing labels for package type, duration and price unit", () => {
    expect(getTourTypeLabel("GROUP")).toBe("Tour ghép trọn gói");
    expect(getTourTypeLabel("PRIVATE")).toBe("Tour riêng");
    expect(formatTourDuration(3, 2)).toBe("3 ngày 2 đêm");
    expect(getPriceUnitLabel("PER_GROUP")).toBe("/ nhóm");
  });

  it("labels itinerary periods and creates a coordinate-only map URL", () => {
    expect(getItineraryPeriod("06:30")).toBe("Buổi sáng");
    expect(getItineraryPeriod("12:00")).toBe("Buổi trưa");
    expect(getItineraryPeriod("15:30")).toBe("Buổi chiều");
    expect(getItineraryPeriod("19:00")).toBe("Buổi tối");
    expect(getActivityMapUrl({ lat: 16.4637, lng: 107.5909 })).toBe(
      "https://www.google.com/maps/search/?api=1&query=16.4637%2C107.5909"
    );
  });

  it("falls back to the administrative area for legacy detail responses", () => {
    const legacyDetail = parseTourDetail({
      ...validTourDetail,
      destination: {
        province: "Quảng Nam",
        geo: validTourDetail.destination.geo,
      },
    });

    expect(legacyDetail.destination.name).toBe("Quảng Nam");
  });
});
