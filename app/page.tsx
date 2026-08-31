import { Suspense } from "react";

import { SiteHeader } from "@/components/layout/site-header";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { EditorialFooter } from "@/components/home/editorial-footer";
import { AiPlannerPromo } from "@/components/home/ai-planner-promo";
import {
  TourDiscovery,
  TourDiscoveryFallback,
} from "@/components/tours/tour-discovery";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-white">
      <SiteHeader />

      <main>
        <Suspense fallback={<TourDiscoveryFallback />}>
          <TourDiscovery />
        </Suspense>
        <AiPlannerPromo />
        <WhyChooseUs />
      </main>

      <EditorialFooter />
    </div>
  );
}
