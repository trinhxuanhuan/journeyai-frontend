import type { Metadata } from "next";

import { AiItineraryDetail } from "@/components/ai/itinerary-detail";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Chi tiết hành trình AI — Việt Khám Phá",
  description: "Xem và tinh chỉnh lịch trình tự túc của bạn.",
};

export default async function AiItineraryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ itineraryId: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
}) {
  const { itineraryId } = await params;
  const query = await searchParams;
  return (
    <div className="min-h-screen bg-[#f6fafc]">
      <SiteHeader />
      <AuthGuard>
        <AiItineraryDetail itineraryId={itineraryId} newlyCreated={query.created === "1"} />
      </AuthGuard>
    </div>
  );
}
