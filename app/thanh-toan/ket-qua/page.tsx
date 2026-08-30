import { AuthGuard } from "@/components/auth/auth-guard";
import { PaymentResultView } from "@/components/bookings/payment-result";
import { SiteHeader } from "@/components/layout/site-header";

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{
    paymentId?: string | string[];
    bookingId?: string | string[];
    gatewayResult?: string | string[];
  }>;
}) {
  const query = await searchParams;

  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      <SiteHeader />
      <AuthGuard>
        <PaymentResultView
          key={`${String(query.paymentId)}:${String(query.bookingId)}:${String(query.gatewayResult)}`}
          paymentId={typeof query.paymentId === "string" ? query.paymentId : null}
          bookingId={typeof query.bookingId === "string" ? query.bookingId : null}
          gatewayResult={typeof query.gatewayResult === "string" ? query.gatewayResult : null}
        />
      </AuthGuard>
    </div>
  );
}
