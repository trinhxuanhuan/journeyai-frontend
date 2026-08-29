import { Loader2 } from "lucide-react";

export default function LoadingTourDetail() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="mr-2 h-5 w-5 animate-spin motion-reduce:animate-none" />
      Đang mở hành trình...
    </div>
  );
}
