import type { MetadataRoute } from "next";

import { resolveSiteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/bookings",
        "/dang-nhap",
        "/dat-tour",
        "/hanh-trinh",
        "/lap-lich-trinh",
        "/thanh-toan",
        "/thong-bao",
      ],
    },
    sitemap: new URL("/sitemap.xml", siteUrl).toString(),
    host: siteUrl.origin,
  };
}
