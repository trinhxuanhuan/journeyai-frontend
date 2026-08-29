import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[0.9rem] bg-[linear-gradient(145deg,#075ea8,#0998d8)] shadow-[0_10px_28px_rgba(11,116,209,0.28)]",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none">
        <circle cx="34" cy="13" r="5" fill="#FFB547" />
        <path
          d="M6 35.5 17.5 21l6.2 7.2 5.2-6.1L42 35.5H6Z"
          fill="rgba(255,255,255,.98)"
        />
        <path
          d="M7 37c7-4 13-4 19 0 5 3 10 2 16-1"
          stroke="#A7F3E7"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
