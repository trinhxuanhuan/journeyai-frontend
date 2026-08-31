import { describe, expect, it } from "vitest";

import {
  createItineraryInputSchema,
  formatAiMoney,
  formatItineraryOverview,
  isValidAiItineraryId,
  isValidAiShareToken,
  parseAiCatalog,
  parseAiItinerary,
} from "./ai-itineraries";

const itinerary = {
  id: "66d1f4b7a33f4a3d6f70c111",
  userId: "11111111-1111-4111-8111-111111111111",
  destination: "Huế",
  destinationDisplayName: "Huế",
  days: 1,
  budget: "2000000",
  travelerCount: 2,
  childrenCount: 1,
  seniorCount: 0,
  groupProfile: "FAMILY",
  preferences: ["di sản", "ẩm thực"],
  pace: "BALANCED",
  transportPreference: "TAXI_RIDESHARE",
  startDate: "2026-10-10",
  overview: "Hành trình có kiểm soát ngân sách.",
  itineraryDays: [
    {
      dayNumber: 1,
      date: "2026-10-10",
      title: "Ngày 1: Kinh thành Huế",
      theme: "Di sản",
      pace: "BALANCED",
      activities: [
        {
          placeId: "hue-dai-noi",
          period: "MORNING",
          startTime: "08:00",
          endTime: "10:30",
          placeName: "Đại Nội Huế",
          area: "Kinh thành Huế",
          category: "HERITAGE",
          suggestion: "Khám phá quần thể cung đình.",
          description: "Tìm hiểu di sản triều Nguyễn.",
          whyRecommended: "Phù hợp sở thích di sản.",
          culturalNote: "Giữ trang phục lịch sự.",
          durationMinutes: 150,
          estimatedCost: { amount: "300000", currency: "VND" },
          travelFromPrevious: { minutes: 0, mode: "TAXI_RIDESHARE", label: "Taxi / xe công nghệ" },
          location: { latitude: 16.4694, longitude: 107.5777 },
          setting: "MIXED",
          dataSource: "VIET_KHAM_PHA_CURATED_V1",
          referenceOnly: true,
        },
      ],
      dailyActivityCost: { amount: "300000", currency: "VND" },
    },
  ],
  costEstimate: {
    accommodation: "0",
    transport: "440000",
    meals: "486000",
    activities: "300000",
    contingency: "98080",
    total: "1324080",
    budget: "2000000",
    remaining: "675920",
    currency: "VND",
    status: "WITHIN_BUDGET",
    travelStyle: "COMFORT",
    requestedTravelStyle: "COMFORT",
    optimizedToBudget: false,
  },
  budgetAdjustments: [],
  warnings: ["Chi phí là dữ liệu tham khảo."],
  assumptions: ["Ngân sách là tổng chi phí dự kiến cho cả nhóm."],
  qualitySummary: {
    score: 92,
    catalogCoverage: "CURATED",
    budgetFit: true,
    scheduleFeasible: true,
    placeholderDays: 0,
    placeholderActivities: 0,
  },
  plannerVersion: "1.0.0",
  schemaVersion: "2.0",
  catalogVersion: "2026.08",
  effectiveTransport: "TAXI_RIDESHARE",
  generationProvider: "RULE_BASED_GROUNDED",
  revision: 1,
  refinementHistory: [],
  shareEnabled: false,
  createdAt: "2026-08-31T08:00:00Z",
  updatedAt: "2026-08-31T08:00:00Z",
};

describe("AI itinerary contract", () => {
  it("parses catalog destinations", () => {
    const catalog = parseAiCatalog({
      catalogVersion: "2026.08",
      referenceNotice: "Dữ liệu tham khảo.",
      supportedDestinations: [{ id: "hue", name: "Huế", aliases: ["hue"] }],
    });
    expect(catalog.supportedDestinations[0].name).toBe("Huế");
  });

  it("parses planner output and normalizes money", () => {
    const parsed = parseAiItinerary(itinerary);
    expect(parsed.costEstimate.total).toBe(1_324_080);
    expect(parsed.itineraryDays[0].activities[0].estimatedCost.amount).toBe(300_000);
  });

  it("rejects mismatched itinerary day count", () => {
    expect(() => parseAiItinerary({ ...itinerary, days: 2 })).toThrow();
  });

  it("rejects an impossible traveler composition before submit", () => {
    const result = createItineraryInputSchema.safeParse({
      destination: "Huế",
      days: 3,
      budget: 6_000_000,
      travelerCount: 2,
      childrenCount: 2,
      seniorCount: 1,
      groupProfile: "FAMILY",
      preferences: [],
      pace: "BALANCED",
      transportPreference: "FLEXIBLE",
      startDate: "",
    });
    expect(result.success).toBe(false);
  });

  it("validates internal itinerary identifiers and public tokens", () => {
    expect(isValidAiItineraryId("66d1f4b7a33f4a3d6f70c111")).toBe(true);
    expect(isValidAiItineraryId("../../admin")).toBe(false);
    expect(isValidAiShareToken("qwertyuiop_ASDFGHJKL-123456")).toBe(true);
    expect(isValidAiShareToken("short")).toBe(false);
  });

  it("formats VND without fractional digits", () => {
    expect(formatAiMoney(2_800_000)).toContain("2.800.000");
  });

  it("localizes planner pace in its generated overview", () => {
    expect(formatItineraryOverview("Lịch trình theo nhịp balanced và ngân sách của nhóm."))
      .toBe("Lịch trình theo nhịp cân bằng và ngân sách của nhóm.");
  });
});
