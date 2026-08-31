import type { Metadata } from "next";

import { AiItineraryListView } from "@/components/ai/itinerary-list";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Hành trình của tôi — Việt Khám Phá",
  description: "Xem lại và tiếp tục chỉnh sửa các lịch trình tự túc đã lưu.",
};

export default function MyAiItinerariesPage() {
  return <div className="min-h-screen bg-[#f6fafc]"><SiteHeader /><AuthGuard><AiItineraryListView /></AuthGuard></div>;
}
