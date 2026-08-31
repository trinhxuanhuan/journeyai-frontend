import type { Metadata } from "next";

import { SharedItineraryView } from "@/components/ai/shared-itinerary";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Hành trình được chia sẻ — Việt Khám Phá",
  description: "Khám phá một lịch trình Việt Nam được chia sẻ từ Việt Khám Phá.",
};

export default async function SharedItineraryPage({ params }: { params: Promise<{ shareToken: string }> }) {
  const { shareToken } = await params;
  return <div className="min-h-screen bg-[#f6fafc]"><SiteHeader /><SharedItineraryView shareToken={shareToken} /></div>;
}
