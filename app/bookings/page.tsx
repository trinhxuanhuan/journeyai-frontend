import { AuthGuard } from "@/components/auth/auth-guard";
import { BookingList } from "@/components/bookings/booking-list";
import { SiteHeader } from "@/components/layout/site-header";

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <SiteHeader />
      <AuthGuard>
        <BookingList />
      </AuthGuard>
    </div>
  );
}
