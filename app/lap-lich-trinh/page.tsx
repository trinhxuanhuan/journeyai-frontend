import type { Metadata } from "next";

import { AiPlannerForm } from "@/components/ai/ai-planner-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Lập lịch trình AI — Việt Khám Phá",
  description: "Tạo lịch trình du lịch Việt Nam theo ngân sách, sở thích và nhóm đồng hành.",
};

export default function AiPlannerPage() {
  return (
    <div className="min-h-screen bg-[#f6fafc]">
      <SiteHeader />
      <AuthGuard>
        <AiPlannerForm />
      </AuthGuard>
    </div>
  );
}
