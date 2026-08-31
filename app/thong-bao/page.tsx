import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/auth-guard";
import { SiteHeader } from "@/components/layout/site-header";
import { NotificationCenter } from "@/components/notifications/notification-center";

export const metadata: Metadata = {
  title: "Thông báo — Việt Khám Phá",
  description: "Theo dõi cập nhật booking, thanh toán và lịch khởi hành của bạn.",
};

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-[#f7fafc]">
      <SiteHeader />
      <AuthGuard>
        <NotificationCenter />
      </AuthGuard>
    </div>
  );
}
