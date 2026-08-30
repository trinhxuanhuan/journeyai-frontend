export default function BookingDetailLoading() {
  return (
    <main className="min-h-screen bg-[#f6f9fc] px-5 py-10 sm:px-8" role="status" aria-label="Đang tải booking">
      <div className="mx-auto max-w-6xl animate-pulse motion-reduce:animate-none">
        <div className="h-5 w-36 rounded bg-slate-200" />
        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[34rem] rounded-3xl bg-white ring-1 ring-slate-200" />
          <div className="h-80 rounded-3xl bg-white ring-1 ring-slate-200" />
        </div>
      </div>
      <span className="sr-only">Đang tải...</span>
    </main>
  );
}
