export default function AccountLoading() {
  return (
    <main className="min-h-screen bg-[#f6f9fc] px-5 py-8 sm:px-8" role="status" aria-label="Đang mở trang tài khoản">
      <div className="mx-auto max-w-6xl">
        <div className="h-64 animate-pulse rounded-[2rem] bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[0.88fr_1.45fr]">
          <div className="h-[28rem] animate-pulse rounded-3xl bg-white ring-1 ring-slate-200 motion-reduce:animate-none" />
          <div className="h-[36rem] animate-pulse rounded-3xl bg-white ring-1 ring-slate-200 motion-reduce:animate-none" />
        </div>
        <span className="sr-only">Đang tải...</span>
      </div>
    </main>
  );
}
