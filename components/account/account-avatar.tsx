"use client";

import { useState } from "react";

import { getAccountInitials, getSafeAvatarUrl } from "@/lib/account";
import { cn } from "@/lib/utils";

export function AccountAvatar({
  fullName,
  email,
  avatarUrl,
  className,
}: {
  fullName?: string | null;
  email?: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  const safeAvatarUrl = getSafeAvatarUrl(avatarUrl);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(145deg,#0b74d1,#07518f)] font-bold text-white ring-2 ring-white",
        className
      )}
      aria-hidden="true"
    >
      {getAccountInitials(fullName, email)}
      {safeAvatarUrl && failedAvatarUrl !== safeAvatarUrl && (
        // User-controlled remote avatars intentionally bypass the Next image proxy.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={safeAvatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailedAvatarUrl(safeAvatarUrl)}
        />
      )}
    </span>
  );
}
