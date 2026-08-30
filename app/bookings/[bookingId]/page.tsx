import { AuthGuard } from "@/components/auth/auth-guard";
import { BookingDetailView } from "@/components/bookings/booking-detail";
import { SiteHeader } from "@/components/layout/site-header";

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ created?: string | string[] }>;
}) {
  const { bookingId } = await params;
  const query = await searchParams;

  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <SiteHeader />
      <AuthGuard>
        <BookingDetailView
          bookingId={bookingId}
          newlyCreated={query.created === "1"}
        />
      </AuthGuard>
    </div>
  );
}
