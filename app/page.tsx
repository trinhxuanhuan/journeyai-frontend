import { SiteHeader } from "@/components/layout/site-header";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center">
        <h1 className="text-2xl font-semibold">
          Trang chủ Việt Khám Phá — đang xây dựng
        </h1>
      </main>
    </div>
  );
}