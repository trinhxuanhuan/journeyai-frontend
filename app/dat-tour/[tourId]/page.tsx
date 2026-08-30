import { AuthGuard } from "@/components/auth/auth-guard";
import { BookingCheckout } from "@/components/bookings/booking-checkout";
import { SiteHeader } from "@/components/layout/site-header";

export default async function BookingCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ tourId: string }>;
  searchParams: Promise<{ departureId?: string | string[] }>;
}) {
  const { tourId } = await params;
  const query = await searchParams;
  const initialDepartureId =
    typeof query.departureId === "string" ? query.departureId : null;

  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <SiteHeader />
      <AuthGuard>
        <BookingCheckout
          tourId={tourId}
          initialDepartureId={initialDepartureId}
        />
      </AuthGuard>
    </div>
  );
}
