import type { Metadata } from "next";

import { AccountCenter } from "@/components/account/account-center";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SiteHeader } from "@/components/layout/site-header";

export const metadata: Metadata = {
  title: "Tài khoản của tôi — Việt Khám Phá",
  description: "Quản lý danh tính, thông tin liên hệ và sở thích du lịch của bạn.",
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <SiteHeader />
      <AuthGuard>
        <AccountCenter />
      </AuthGuard>
    </div>
  );
}
