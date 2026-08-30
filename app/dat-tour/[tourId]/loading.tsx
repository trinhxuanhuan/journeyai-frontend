export default function BookingCheckoutLoading() {
  return (
    <main
      className="min-h-screen bg-[#f6f9fc] px-5 py-10 sm:px-8"
      role="status"
      aria-label="Đang tải trang đặt tour"
    >
      <div className="mx-auto max-w-6xl">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[42rem] animate-pulse rounded-3xl bg-white ring-1 ring-slate-200 motion-reduce:animate-none" />
          <div className="h-96 animate-pulse rounded-3xl bg-white ring-1 ring-slate-200 motion-reduce:animate-none" />
        </div>
      </div>
      <span className="sr-only">Đang tải...</span>
    </main>
  );
}
