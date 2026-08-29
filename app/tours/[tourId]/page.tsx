import type { Metadata } from "next";

import { SiteHeader } from "@/components/layout/site-header";
import { TourDetailView } from "@/components/tours/tour-detail";

export const metadata: Metadata = {
  title: "Chi tiết hành trình | Việt Khám Phá",
  description: "Xem hành trình, giá và lịch khởi hành còn chỗ của tour.",
};

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ tourId: string }>;
}) {
  const { tourId } = await params;

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <TourDetailView tourId={tourId} />
    </div>
  );
}
