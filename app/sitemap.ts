import type { MetadataRoute } from "next";

import { resolveSiteUrl } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: new URL("/", resolveSiteUrl()).toString(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
